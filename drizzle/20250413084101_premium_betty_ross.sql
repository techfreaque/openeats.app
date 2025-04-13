CREATE TYPE "public"."notification_status" AS ENUM('UNREAD', 'READ', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('ORDER', 'DELIVERY', 'PAYMENT', 'SYSTEM', 'MARKETING');--> statement-breakpoint
CREATE TABLE "notification_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" text NOT NULL,
	"user_id" uuid,
	"device_id" text NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"disconnected_at" timestamp,
	CONSTRAINT "notification_connections_connection_id_unique" UNIQUE("connection_id")
);
--> statement-breakpoint
CREATE TABLE "notification_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" text NOT NULL,
	"channel" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"status" "notification_status" DEFAULT 'UNREAD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "notification_connections" ADD CONSTRAINT "notification_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_connection_id_notification_connections_connection_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."notification_connections"("connection_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;