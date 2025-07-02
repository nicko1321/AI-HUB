import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  decimal,
  index,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants (Customers) - Root level for multi-tenancy
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  apiKey: varchar("api_key", { length: 128 }).notNull().unique(),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).notNull().default("basic"), // basic, pro, enterprise
  maxHubs: integer("max_hubs").notNull().default(5),
  maxCameras: integer("max_cameras").notNull().default(50),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, suspended, cancelled
  billingEmail: varchar("billing_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  address: jsonb("address"), // { street, city, state, zip, country }
  settings: jsonb("settings").default({}), // Custom tenant settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_tenant_api_key").on(table.apiKey),
  index("idx_tenant_slug").on(table.slug)
]);

// Users within tenants (multi-user per customer)
export const tenantUsers = pgTable("tenant_users", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 50 }).notNull().default("user"), // admin, manager, user, viewer
  permissions: jsonb("permissions").default([]), // Array of specific permissions
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  unique("unique_tenant_user_email").on(table.tenantId, table.email),
  index("idx_tenant_users_tenant").on(table.tenantId),
  index("idx_tenant_users_email").on(table.email)
]);

// Hub Licenses - Controls which hubs can connect to which tenants
export const hubLicenses = pgTable("hub_licenses", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  hubSerial: varchar("hub_serial", { length: 100 }).notNull().unique(),
  licenseKey: varchar("license_key", { length: 128 }).notNull().unique(),
  hubName: varchar("hub_name", { length: 255 }),
  deploymentLocation: varchar("deployment_location", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, suspended, revoked
  maxCameras: integer("max_cameras").notNull().default(16),
  features: jsonb("features").default({}), // Available features for this hub
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_hub_licenses_tenant").on(table.tenantId),
  index("idx_hub_licenses_serial").on(table.hubSerial),
  index("idx_hub_licenses_key").on(table.licenseKey)
]);

// Update existing tables to include tenantId for isolation
export const tenantsHubs = pgTable("hubs", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  serialNumber: varchar("serial_number", { length: 100 }).notNull(),
  licenseId: integer("license_id").references(() => hubLicenses.id),
  status: varchar("status", { length: 50 }).notNull().default("offline"),
  systemArmed: boolean("system_armed").notNull().default(false),
  lastHeartbeat: timestamp("last_heartbeat"),
  ipAddress: varchar("ip_address", { length: 45 }),
  version: varchar("version", { length: 50 }),
  configuration: jsonb("configuration").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  unique("unique_tenant_hub_serial").on(table.tenantId, table.serialNumber),
  index("idx_hubs_tenant").on(table.tenantId),
  index("idx_hubs_serial").on(table.serialNumber),
  index("idx_hubs_status").on(table.status)
]);

export const tenantsCameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  hubId: integer("hub_id").notNull().references(() => tenantsHubs.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("offline"),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  isRecording: boolean("is_recording").notNull().default(false),
  streamUrl: varchar("stream_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  protocol: varchar("protocol", { length: 20 }).notNull().default("RTSP"),
  port: integer("port"),
  username: varchar("username", { length: 100 }),
  password: varchar("password", { length: 100 }),
  streamPath: varchar("stream_path", { length: 255 }),
  onvifPort: integer("onvif_port"),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  resolution: varchar("resolution", { length: 20 }),
  fps: integer("fps"),
  codec: varchar("codec", { length: 20 }),
  ptzCapable: boolean("ptz_capable").notNull().default(false),
  audioEnabled: boolean("audio_enabled").notNull().default(false),
  nightVision: boolean("night_vision").notNull().default(false),
  motionDetection: boolean("motion_detection").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_cameras_tenant").on(table.tenantId),
  index("idx_cameras_hub").on(table.hubId),
  index("idx_cameras_status").on(table.status)
]);

export const tenantsEvents = pgTable("events", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  hubId: integer("hub_id").notNull().references(() => tenantsHubs.id, { onDelete: "cascade" }),
  cameraId: integer("camera_id").references(() => tenantsCameras.id),
  type: varchar("type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedBy: integer("acknowledged_by").references(() => tenantUsers.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  metadata: jsonb("metadata"),
  licensePlate: varchar("license_plate", { length: 20 }),
  licensePlateThumbnail: varchar("license_plate_thumbnail", { length: 500 }),
  licensePlateConfidence: decimal("license_plate_confidence", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_events_tenant").on(table.tenantId),
  index("idx_events_hub").on(table.hubId),
  index("idx_events_timestamp").on(table.timestamp),
  index("idx_events_severity").on(table.severity),
  index("idx_events_type").on(table.type)
]);

// API Usage Tracking for billing
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  requestCount: integer("request_count").notNull().default(1),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  hubId: integer("hub_id").references(() => tenantsHubs.id)
}, (table) => [
  index("idx_api_usage_tenant_month").on(table.tenantId, table.month),
  index("idx_api_usage_endpoint").on(table.endpoint)
]);

// Billing Records
export const billingRecords = pgTable("billing_records", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM
  hubCount: integer("hub_count").notNull(),
  cameraCount: integer("camera_count").notNull(),
  apiCalls: integer("api_calls").notNull(),
  storageUsedGB: decimal("storage_used_gb", { precision: 10, scale: 2 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, paid, overdue
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  unique("unique_tenant_billing_period").on(table.tenantId, table.period),
  index("idx_billing_tenant").on(table.tenantId),
  index("idx_billing_status").on(table.status)
]);

// Type exports
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;
export type HubLicense = typeof hubLicenses.$inferSelect;
export type InsertHubLicense = typeof hubLicenses.$inferInsert;
export type TenantHub = typeof tenantsHubs.$inferSelect;
export type InsertTenantHub = typeof tenantsHubs.$inferInsert;
export type TenantCamera = typeof tenantsCameras.$inferSelect;
export type InsertTenantCamera = typeof tenantsCameras.$inferInsert;
export type TenantEvent = typeof tenantsEvents.$inferSelect;
export type InsertTenantEvent = typeof tenantsEvents.$inferInsert;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;
export type BillingRecord = typeof billingRecords.$inferSelect;
export type InsertBillingRecord = typeof billingRecords.$inferInsert;

// Schema validation
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  apiKey: true
});

export const insertTenantUserSchema = createInsertSchema(tenantUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHubLicenseSchema = createInsertSchema(hubLicenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  licenseKey: true
});