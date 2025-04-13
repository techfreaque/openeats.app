// Configuration types
export interface ServerConfig {
  port: number;
  host: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export interface SecurityConfig {
  apiKey: string;
  defaultApiKey: string;
}

// Job status enums for better type safety
export type PrintJobStatus =
  | "pending"
  | "printing"
  | "paused"
  | "completed"
  | "failed";
export type BalancingStrategy = "round-robin" | "least-busy" | "failover";
export type RoutingMatchType = "exact" | "contains" | "regex";
export type BackupFrequency = "daily" | "weekly" | "monthly";
export type PrinterOrientation = "portrait" | "landscape";

// Queue Management types
export interface PrintJob {
  id: string;
  status: PrintJobStatus;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  printer?: string;
  priority: number;
  retries: number;
  error?: string;
  options: PrintOptions;
}

// Printer Categories types
export interface PrinterCategory {
  id: string;
  name: string;
  description?: string;
  printers: string[];
  defaultOptions?: PrintOptions;
  routingRules?: RoutingRule[];
}

export interface RoutingRule {
  id?: string;
  field: string;
  pattern: string;
  matchType: RoutingMatchType;
}

// Printer Groups types
export interface PrinterGroup {
  id: string;
  name: string;
  description?: string;
  printers: string[];
  balancingStrategy: BalancingStrategy;
  active: boolean;
}

// Analytics types
export interface PrintAnalytics {
  id: string;
  jobId?: string;
  printer?: string;
  category?: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  duration?: number;
  pageCount?: number;
  error?: string;
}

// Backup types
export interface BackupSettings {
  enabled: boolean;
  automatic: boolean;
  frequency: BackupFrequency;
  maxBackups: number;
  includeJobs: boolean;
  includeAnalytics: boolean;
  encryptBackups: boolean;
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  status: string;
  error?: string;
}

// Sync types
export interface SyncStatus {
  online: boolean;
  lastSyncTime?: string;
  pendingJobs: number;
  syncErrors: SyncError[];
}

export interface SyncError {
  timestamp: string;
  jobId?: string;
  error: string;
  resolved: boolean;
}

export interface BluetoothPrinterConfig {
  enabled: boolean;
  name: string;
  address: string;
  channel: number;
  discoverable: boolean;
  discoveryTimeout: number;
}

export interface PrintingConfig {
  defaultPrinter: string;
  tempDirectory: string;
  receiptWidth: number;
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  bluetooth: BluetoothPrinterConfig;
}

export interface GpioConfig {
  enabled: boolean;
  resetPin: number;
}

export interface NotificationSounds {
  newOrder: string;
  printSuccess: string;
  printError: string;
}

export interface NotificationConfig {
  enabled: boolean;
  sounds: NotificationSounds;
  volume: number;
}

export interface LoggingConfig {
  level: string;
  file: string;
  maxSize: number;
  maxFiles: number;
}

export interface AppConfig {
  server: ServerConfig;
  websocket: WebSocketConfig;
  security: SecurityConfig;
  printing: PrintingConfig;
  notifications: NotificationConfig;
  gpio: GpioConfig;
  logging: LoggingConfig;
}

// WebSocket message types
export enum MessageType {
  PRINT = "print",
  UPDATE_SETTINGS = "updateSettings",
  STATUS = "status",
  AUTHENTICATE = "authenticate",
  RESET_API_KEY = "resetApiKey",
}

export interface BaseMessage {
  type: MessageType;
  apiKey: string;
}

export interface PrintMessage extends BaseMessage {
  type: MessageType.PRINT;
  data: {
    fileContent: string; // Base64 encoded file content
    fileName: string;
    printer?: string;
    options?: PrintOptions;
  };
}

export interface UpdateSettingsMessage extends BaseMessage {
  type: MessageType.UPDATE_SETTINGS;
  data: Partial<AppConfig>;
}

export interface StatusMessage extends BaseMessage {
  type: MessageType.STATUS;
}

export interface AuthenticateMessage extends BaseMessage {
  type: MessageType.AUTHENTICATE;
}

export interface ResetApiKeyMessage extends BaseMessage {
  type: MessageType.RESET_API_KEY;
  data: {
    newApiKey: string;
  };
}

export type WebSocketMessage =
  | PrintMessage
  | UpdateSettingsMessage
  | StatusMessage
  | AuthenticateMessage
  | ResetApiKeyMessage;

// Printing types
export interface PrintOptions {
  copies?: number;
  duplex?: boolean;
  orientation?: PrinterOrientation;
  paperSize?: string;
  bluetooth?: boolean; // Whether to use Bluetooth printing
  [key: string]: unknown; // Allow additional options with unknown type
}

export interface PrintResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Status types
export interface SystemStatus {
  apiKey: string;
  websocketUrl: string;
  websocketConnected: boolean;
  printers: PrinterInfo[];
  platform: string;
  version: string;
}

export interface PrinterInfo {
  name: string;
  isDefault: boolean;
  status: string;
}
