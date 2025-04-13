-- Create notification status enum
CREATE TYPE "notification_status" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- Create notification type enum
CREATE TYPE "notification_type" AS ENUM ('ORDER', 'DELIVERY', 'PAYMENT', 'SYSTEM', 'MARKETING');

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "type" notification_type NOT NULL,
  "channel" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB,
  "status" notification_status NOT NULL DEFAULT 'UNREAD',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "read_at" TIMESTAMP
);

-- Create notification connections table
CREATE TABLE IF NOT EXISTS "notification_connections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "connection_id" TEXT NOT NULL UNIQUE,
  "user_id" UUID REFERENCES "users"("id"),
  "device_id" TEXT NOT NULL,
  "user_agent" TEXT,
  "ip_address" TEXT,
  "connected_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_activity" TIMESTAMP NOT NULL DEFAULT NOW(),
  "disconnected_at" TIMESTAMP
);

-- Create notification subscriptions table
CREATE TABLE IF NOT EXISTS "notification_subscriptions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "connection_id" TEXT NOT NULL REFERENCES "notification_connections"("connection_id"),
  "channel" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_status_idx" ON "notifications"("status");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");
CREATE INDEX IF NOT EXISTS "notification_connections_user_id_idx" ON "notification_connections"("user_id");
CREATE INDEX IF NOT EXISTS "notification_connections_device_id_idx" ON "notification_connections"("device_id");
CREATE INDEX IF NOT EXISTS "notification_subscriptions_connection_id_idx" ON "notification_subscriptions"("connection_id");
CREATE INDEX IF NOT EXISTS "notification_subscriptions_channel_idx" ON "notification_subscriptions"("channel");
