import type { Server as HttpServer } from "http";
import type { RedisOptions } from "ioredis";
import Redis from "ioredis";
import { Server } from "socket.io";

import type {
  ActiveConnection,
  AuthenticatedSocket,
  ConnectionInfo,
} from "../../shared/types/websocket";
import { debugLogger, errorLogger } from "../../shared/utils/logger";
import { authenticateSocket } from "./auth";
import { setupSocketEventHandlers } from "./handlers";

// Connection storage interface
interface ConnectionStore {
  addConnection(
    connectionId: string,
    connection: ActiveConnection,
  ): Promise<void> | void;
  removeConnection(connectionId: string): Promise<void> | void;
  getConnection(
    connectionId: string,
  ): Promise<ActiveConnection | null> | ActiveConnection | null;
  getAllConnections(): Promise<ConnectionInfo[]> | ConnectionInfo[];
  getUserConnections(
    userId: string,
  ): Promise<ConnectionInfo[]> | ConnectionInfo[];
}

// In-memory implementation of connection store
class MemoryConnectionStore implements ConnectionStore {
  private connections: Record<string, ActiveConnection> = {};

  async addConnection(
    connectionId: string,
    connection: ActiveConnection,
  ): Promise<void> {
    this.connections[connectionId] = connection;
    return await Promise.resolve();
  }

  async removeConnection(connectionId: string): Promise<void> {
    delete this.connections[connectionId];
    return await Promise.resolve();
  }

  async getConnection(connectionId: string): Promise<ActiveConnection | null> {
    return await Promise.resolve(this.connections[connectionId] ?? null);
  }

  async getAllConnections(): Promise<ConnectionInfo[]> {
    return await Promise.resolve(
      Object.values(this.connections).map(
        ({
          connectionId,
          userId,
          deviceId,
          subscribedChannels,
          connectedAt,
        }) => ({
          connectionId,
          userId,
          deviceId,
          subscribedChannels,
          connectedAt,
        }),
      ),
    );
  }

  async getUserConnections(userId: string): Promise<ConnectionInfo[]> {
    return await Promise.resolve(
      Object.values(this.connections)
        .filter((conn) => conn.userId === userId)
        .map(
          ({
            connectionId,
            userId,
            deviceId,
            subscribedChannels,
            connectedAt,
          }) => ({
            connectionId,
            userId,
            deviceId,
            subscribedChannels,
            connectedAt,
          }),
        ),
    );
  }
}

// Redis implementation of connection store
class RedisConnectionStore implements ConnectionStore {
  private redis: Redis;
  private readonly prefix = "ws:conn:";
  private readonly userPrefix = "ws:user:";

  constructor(redisOptions: RedisOptions) {
    this.redis = new Redis(redisOptions);
  }

  async addConnection(
    connectionId: string,
    connection: ActiveConnection,
  ): Promise<void> {
    // Store connection data as JSON string
    await this.redis.set(
      `${this.prefix}${connectionId}`,
      JSON.stringify({
        connectionId: connection.connectionId,
        userId: connection.userId,
        deviceId: connection.deviceId,
        subscribedChannels: connection.subscribedChannels,
        connectedAt: connection.connectedAt,
      }),
    );

    // If there's a userId, add this connection to the user's connection set
    if (connection.userId) {
      await this.redis.sadd(
        `${this.userPrefix}${connection.userId}`,
        connectionId,
      );
    }
  }

  async removeConnection(connectionId: string): Promise<void> {
    // Get the connection data to find the userId
    const connData = await this.getConnection(connectionId);

    // Remove the connection
    await this.redis.del(`${this.prefix}${connectionId}`);

    // If there was a userId, remove this connection from the user's connection set
    if (connData?.userId) {
      await this.redis.srem(
        `${this.userPrefix}${connData.userId}`,
        connectionId,
      );
    }
  }

  async getConnection(connectionId: string): Promise<ActiveConnection | null> {
    const data = await this.redis.get(`${this.prefix}${connectionId}`);
    if (!data) {
      return null;
    }

    return JSON.parse(data) as ActiveConnection;
  }

  async getAllConnections(): Promise<ConnectionInfo[]> {
    // Get all keys matching the connection prefix
    const keys = await this.redis.keys(`${this.prefix}*`);
    if (keys.length === 0) {
      return [];
    }

    // Get all connection data
    const connDataArray = await this.redis.mget(keys);

    // Parse and return connections
    return connDataArray
      .filter((data): data is string => data !== null)
      .map((data) => JSON.parse(data) as ConnectionInfo);
  }

  async getUserConnections(userId: string): Promise<ConnectionInfo[]> {
    // Get connection IDs for this user
    const connectionIds = await this.redis.smembers(
      `${this.userPrefix}${userId}`,
    );
    if (connectionIds.length === 0) {
      return [];
    }

    // Get connection data for each ID
    const keys = connectionIds.map((id) => `${this.prefix}${id}`);
    const connDataArray = await this.redis.mget(keys);

    // Parse and return connections
    return connDataArray
      .filter((data): data is string => data !== null)
      .map((data) => JSON.parse(data) as ConnectionInfo);
  }
}

// Configuration interface
interface WebSocketServerConfig {
  storage: "memory" | "redis";
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

// Default configuration
const defaultConfig: WebSocketServerConfig = {
  storage: "memory",
};

// Storage instance
let connectionStore: ConnectionStore;

// Socket.IO server instance
let io: Server | null = null;

/**
 * Initialize Socket.IO server
 * @param httpServer - HTTP server instance
 * @param path - WebSocket path
 * @param corsOrigin - CORS origin (default: "*")
 * @param config - WebSocket server configuration
 * @returns Socket.IO server instance
 */
export function initializeSocketServer(
  httpServer: HttpServer,
  path = "/api/ws",
  corsOrigin: string | string[] = "*",
  config: Partial<WebSocketServerConfig> = {},
): Server {
  if (io) {
    return io;
  }

  // Merge with default config
  const finalConfig: WebSocketServerConfig = { ...defaultConfig, ...config };

  // Initialize connection store
  if (finalConfig.storage === "redis" && finalConfig.redis) {
    debugLogger("Using Redis storage for WebSocket connections");
    connectionStore = new RedisConnectionStore(finalConfig.redis);
  } else {
    debugLogger("Using in-memory storage for WebSocket connections");
    connectionStore = new MemoryConnectionStore();
  }

  // Create Socket.IO server
  io = new Server(httpServer, {
    path,
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Handle new socket connections
  io.on("connection", async (socket: AuthenticatedSocket) => {
    try {
      // Store connection
      const connectionId = socket.id;
      const userId = socket.user?.id;

      const connection: ActiveConnection = {
        connectionId,
        userId,
        deviceId: (socket.handshake.query["deviceId"] as string) ?? "unknown",
        subscribedChannels: [],
        connectedAt: Date.now(),
        socket,
      };

      await connectionStore.addConnection(connectionId, connection);

      // Set up event handlers
      setupSocketEventHandlers(socket);

      // Handle disconnection
      socket.on("disconnect", async () => {
        // Remove connection
        await connectionStore.removeConnection(connectionId);
      });
    } catch (error) {
      errorLogger("Error handling socket connection:", error);
      socket.disconnect();
    }
  });

  debugLogger("Socket.IO server initialized");

  return io;
}

/**
 * Get Socket.IO server instance
 * @returns Socket.IO server instance or null if not initialized
 */
export function getSocketServer(): Server | null {
  return io;
}

/**
 * Get all active connections
 * @returns Array of connection info objects
 */
export async function getActiveConnections(): Promise<ConnectionInfo[]> {
  if (!connectionStore) {
    return [];
  }
  return await connectionStore.getAllConnections();
}

/**
 * Get connections for a specific user
 * @param userId - User ID
 * @returns Array of connection info objects
 */
export async function getUserConnections(
  userId: string,
): Promise<ConnectionInfo[]> {
  if (!connectionStore) {
    return [];
  }
  return await connectionStore.getUserConnections(userId);
}

/**
 * Send a notification to a specific channel
 * @param channel - Channel name
 * @param notification - Notification data
 * @returns Number of clients the notification was sent to
 */
export function sendNotificationToChannel(
  channel: string,
  notification: {
    title: string;
    message: string;
    data?: Record<string, unknown>;
    sender: {
      id: string;
      role: string;
    };
  },
): number {
  if (!io) {
    return 0;
  }

  // Emit to all clients subscribed to the channel
  io.to(channel).emit("notification", {
    channel,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    timestamp: Date.now(),
    sender: notification.sender,
  });

  // Count delivered notifications
  const roomSize = io.sockets.adapter.rooms.get(channel)?.size ?? 0;

  return roomSize;
}
