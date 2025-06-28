import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const hubs = pgTable("hubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  ipAddress: text("ip_address").notNull(),
  status: text("status").notNull().default("offline"), // online, offline, error
  systemArmed: boolean("system_armed").notNull().default(false),
  lastHeartbeat: timestamp("last_heartbeat"),
  configuration: jsonb("configuration"),
});

export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  hubId: integer("hub_id").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  ipAddress: text("ip_address").notNull(),
  status: text("status").notNull().default("offline"), // online, offline, error
  isRecording: boolean("is_recording").notNull().default(false),
  streamUrl: text("stream_url"),
  thumbnailUrl: text("thumbnail_url"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  hubId: integer("hub_id").notNull(),
  cameraId: integer("camera_id"),
  type: text("type").notNull(), // motion, alarm, system, connection, license_plate
  severity: text("severity").notNull(), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  metadata: jsonb("metadata"),
  licensePlate: text("license_plate"), // captured license plate number
  licensePlateThumbnail: text("license_plate_thumbnail"), // thumbnail image URL
  licensePlateConfidence: integer("license_plate_confidence"), // confidence score 0-100
});

export const speakers = pgTable("speakers", {
  id: serial("id").primaryKey(),
  hubId: integer("hub_id").notNull(),
  name: text("name").notNull(),
  zone: text("zone").notNull(),
  ipAddress: text("ip_address").notNull(),
  status: text("status").notNull().default("offline"), // online, offline, error
  volume: integer("volume").notNull().default(50),
  isActive: boolean("is_active").notNull().default(false),
});

export const aiTriggers = pgTable("ai_triggers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  enabled: boolean("enabled").notNull().default(true),
  confidence: integer("confidence").notNull().default(70),
  hubIds: text("hub_ids").array(),
  cameraIds: text("camera_ids").array(),
  actions: text("actions").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHubSchema = createInsertSchema(hubs).omit({
  id: true,
  lastHeartbeat: true,
});

export const insertCameraSchema = createInsertSchema(cameras).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  timestamp: true,
});

export const insertSpeakerSchema = createInsertSchema(speakers).omit({
  id: true,
});

export const insertAITriggerSchema = createInsertSchema(aiTriggers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Hub = typeof hubs.$inferSelect;
export type InsertHub = z.infer<typeof insertHubSchema>;
export type Camera = typeof cameras.$inferSelect;
export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Speaker = typeof speakers.$inferSelect;
export type InsertSpeaker = z.infer<typeof insertSpeakerSchema>;
export type AITrigger = typeof aiTriggers.$inferSelect;
export type InsertAITrigger = z.infer<typeof insertAITriggerSchema>;
