"use client";

import { useNotifications } from "next-vibe/client/notification";
import type { ReactElement } from "react";
import { useState } from "react";

interface NotificationExampleProps {
  userId?: string;
  channels?: string[];
}

export function NotificationExample({
  userId,
  channels = ["announcements", "orders"],
}: NotificationExampleProps): ReactElement {
  const {
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    notifications,
    clearNotifications,
  } = useNotifications({
    channels,
    autoConnect: true,
    userId: userId,
  });

  const [newChannel, setNewChannel] = useState("");

  // Handle connection
  const handleConnect = async (): Promise<void> => {
    try {
      await connect();
    } catch (error) {
      // Handle error
      if (error instanceof Error) {
        // Log error
      }
    }
  };

  // Handle subscription
  const handleSubscribe = async (): Promise<void> => {
    if (!newChannel) {
      return;
    }

    try {
      await subscribe(newChannel);
      setNewChannel("");
    } catch (error) {
      // Handle error
      if (error instanceof Error) {
        // Log error
      }
    }
  };

  // Handle channel unsubscribe
  const handleUnsubscribe = (channel: string): void => {
    unsubscribe(channel);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>

      {/* Connection status */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleConnect}
            disabled={isConnected}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Channel subscription */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Subscribed Channels</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {channels.map((channel) => (
            <div
              key={channel}
              className="flex items-center bg-gray-100 px-2 py-1 rounded"
            >
              <span className="mr-1">{channel}</span>
              <button
                onClick={() => handleUnsubscribe(channel)}
                className="text-red-500 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="Channel name"
            className="border rounded-l px-2 py-1 flex-1"
          />
          <button
            onClick={handleSubscribe}
            disabled={!isConnected || !newChannel}
            className="px-3 py-1 bg-blue-500 text-white rounded-r disabled:opacity-50"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Notifications</h3>
          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="text-sm text-blue-500 disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-sm">No notifications</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div key={index} className="border rounded p-2 bg-gray-50">
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm">{notification.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString()} via{" "}
                  {notification.channel}
                </div>
                {notification.data && (
                  <details className="mt-1">
                    <summary className="text-xs text-blue-500 cursor-pointer">
                      View Details
                    </summary>
                    <pre className="text-xs bg-gray-100 p-1 mt-1 overflow-x-auto">
                      {JSON.stringify(notification.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
