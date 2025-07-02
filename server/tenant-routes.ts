import type { Express } from "express";
import { db } from "./db";
import { 
  tenants, 
  tenantUsers, 
  hubLicenses, 
  tenantsHubs, 
  tenantsCameras,
  tenantsEvents,
  apiUsage,
  billingRecords,
  type InsertTenant,
  type InsertHubLicense,
  insertTenantSchema,
  insertHubLicenseSchema
} from "@shared/tenant-schema";
import { 
  authenticateApiKey, 
  authenticateHubLicense,
  requireRole,
  requireSubscriptionTier,
  rateLimitByTier,
  generateApiKey,
  generateLicenseKey,
  generateHubSerial
} from "./tenant-auth";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

export function registerTenantRoutes(app: Express) {
  
  // ======================
  // PUBLIC TENANT MANAGEMENT (No Auth Required)
  // ======================
  
  // Create new tenant (customer signup)
  app.post("/api/tenants", async (req, res) => {
    try {
      const validatedData = insertTenantSchema.parse(req.body);
      
      // Generate unique API key and slug
      const apiKey = generateApiKey();
      const slug = validatedData.name.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      // Check if slug is unique
      const existingTenant = await db.select().from(tenants).where(eq(tenants.slug, slug));
      if (existingTenant.length > 0) {
        return res.status(400).json({ 
          error: "Tenant name already exists",
          message: "Please choose a different company name"
        });
      }
      
      const [tenant] = await db.insert(tenants).values({
        ...validatedData,
        slug,
        apiKey,
        status: "active"
      }).returning();
      
      // Don't return API key in response for security
      const { apiKey: _, ...tenantResponse } = tenant;
      
      res.status(201).json({
        tenant: tenantResponse,
        apiKey, // Only return once during creation
        message: "Tenant created successfully. Save your API key securely!"
      });
    } catch (error) {
      console.error("Create tenant error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ error: "Failed to create tenant" });
    }
  });
  
  // ======================
  // TENANT API ROUTES (Requires API Key)
  // ======================
  
  // Apply authentication and rate limiting to all tenant routes
  app.use("/api/tenant", authenticateApiKey, rateLimitByTier);
  
  // Get tenant info
  app.get("/api/tenant/info", (req, res) => {
    res.json({
      tenant: req.tenant?.tenant,
      limits: {
        maxHubs: req.tenant?.tenant.maxHubs,
        maxCameras: req.tenant?.tenant.maxCameras,
        subscriptionTier: req.tenant?.tenant.subscriptionTier
      }
    });
  });
  
  // Hub license management
  app.post("/api/tenant/hub-licenses", requireRole("admin"), async (req, res) => {
    try {
      const tenantId = req.tenant!.tenantId;
      const validatedData = insertHubLicenseSchema.parse(req.body);
      
      // Check hub limits
      const existingLicenses = await db
        .select({ count: sql<number>`count(*)` })
        .from(hubLicenses)
        .where(eq(hubLicenses.tenantId, tenantId));
      
      if (existingLicenses[0].count >= req.tenant!.tenant.maxHubs) {
        return res.status(400).json({ 
          error: "Hub limit exceeded",
          message: `Your subscription allows maximum ${req.tenant!.tenant.maxHubs} hubs`
        });
      }
      
      // Generate license key and hub serial
      const licenseKey = generateLicenseKey();
      const hubSerial = generateHubSerial(req.tenant!.tenant.slug, existingLicenses[0].count + 1);
      
      const [license] = await db.insert(hubLicenses).values({
        ...validatedData,
        tenantId,
        licenseKey,
        hubSerial,
        status: "active"
      }).returning();
      
      res.status(201).json({ license });
    } catch (error) {
      console.error("Create hub license error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation error",
          details: error.errors
        });
      }
      res.status(500).json({ error: "Failed to create hub license" });
    }
  });
  
  // List hub licenses
  app.get("/api/tenant/hub-licenses", async (req, res) => {
    try {
      const tenantId = req.tenant!.tenantId;
      const licenses = await db
        .select()
        .from(hubLicenses)
        .where(eq(hubLicenses.tenantId, tenantId))
        .orderBy(desc(hubLicenses.createdAt));
      
      res.json({ licenses });
    } catch (error) {
      console.error("List hub licenses error:", error);
      res.status(500).json({ error: "Failed to fetch hub licenses" });
    }
  });
  
  // Get tenant hubs
  app.get("/api/tenant/hubs", async (req, res) => {
    try {
      const tenantId = req.tenant!.tenantId;
      const hubs = await db
        .select()
        .from(tenantsHubs)
        .where(eq(tenantsHubs.tenantId, tenantId))
        .orderBy(desc(tenantsHubs.lastHeartbeat));
      
      res.json({ hubs });
    } catch (error) {
      console.error("List hubs error:", error);
      res.status(500).json({ error: "Failed to fetch hubs" });
    }
  });
  
  // Get tenant cameras
  app.get("/api/tenant/cameras", async (req, res) => {
    try {
      const tenantId = req.tenant!.tenantId;
      const cameras = await db
        .select()
        .from(tenantsCameras)
        .where(eq(tenantsCameras.tenantId, tenantId))
        .orderBy(tenantsCameras.name);
      
      res.json({ cameras });
    } catch (error) {
      console.error("List cameras error:", error);
      res.status(500).json({ error: "Failed to fetch cameras" });
    }
  });
  
  // Get tenant events
  app.get("/api/tenant/events", async (req, res) => {
    try {
      const tenantId = req.tenant!.tenantId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const severity = req.query.severity as string;
      
      let query = db
        .select()
        .from(tenantsEvents)
        .where(eq(tenantsEvents.tenantId, tenantId));
      
      if (severity) {
        query = query.where(and(
          eq(tenantsEvents.tenantId, tenantId),
          eq(tenantsEvents.severity, severity)
        ));
      }
      
      const events = await query
        .orderBy(desc(tenantsEvents.timestamp))
        .limit(limit)
        .offset(offset);
      
      res.json({ events });
    } catch (error) {
      console.error("List events error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });
  
  // Get API usage analytics
  app.get("/api/tenant/analytics/usage", requireSubscriptionTier("pro"), async (req, res) => {
    try {
      const tenantId = req.tenant!.tenantId;
      const startMonth = req.query.start_month as string || new Date().toISOString().slice(0, 7);
      const endMonth = req.query.end_month as string || startMonth;
      
      const usage = await db
        .select({
          endpoint: apiUsage.endpoint,
          method: apiUsage.method,
          totalRequests: sql<number>`sum(${apiUsage.requestCount})`,
          month: apiUsage.month
        })
        .from(apiUsage)
        .where(and(
          eq(apiUsage.tenantId, tenantId),
          gte(apiUsage.month, startMonth),
          lte(apiUsage.month, endMonth)
        ))
        .groupBy(apiUsage.endpoint, apiUsage.method, apiUsage.month)
        .orderBy(desc(apiUsage.month));
      
      res.json({ usage });
    } catch (error) {
      console.error("Usage analytics error:", error);
      res.status(500).json({ error: "Failed to fetch usage analytics" });
    }
  });
  
  // ======================
  // HUB API ROUTES (Requires License Key)
  // ======================
  
  // Apply hub authentication to hub routes
  app.use("/api/hub", authenticateHubLicense);
  
  // Hub registration/heartbeat
  app.post("/api/hub/heartbeat", async (req, res) => {
    try {
      const { status, ipAddress, version, configuration } = req.body;
      const licenseKey = req.headers['x-license-key'] as string;
      const hubSerial = req.headers['x-hub-serial'] as string;
      
      // Find or create hub record
      const [existingHub] = await db
        .select()
        .from(tenantsHubs)
        .where(and(
          eq(tenantsHubs.tenantId, req.tenant!.tenantId),
          eq(tenantsHubs.serialNumber, hubSerial)
        ));
      
      if (existingHub) {
        // Update existing hub
        const [updatedHub] = await db
          .update(tenantsHubs)
          .set({
            status: status || "online",
            lastHeartbeat: new Date(),
            ipAddress,
            version,
            configuration
          })
          .where(eq(tenantsHubs.id, existingHub.id))
          .returning();
        
        res.json({ hub: updatedHub, message: "Heartbeat received" });
      } else {
        // Create new hub record
        const [newHub] = await db
          .insert(tenantsHubs)
          .values({
            tenantId: req.tenant!.tenantId,
            name: `Hub-${hubSerial.split('-').pop()}`,
            serialNumber: hubSerial,
            status: status || "online",
            lastHeartbeat: new Date(),
            ipAddress,
            version,
            configuration: configuration || {}
          })
          .returning();
        
        res.status(201).json({ hub: newHub, message: "Hub registered" });
      }
    } catch (error) {
      console.error("Hub heartbeat error:", error);
      res.status(500).json({ error: "Failed to process heartbeat" });
    }
  });
  
  // Hub reports camera discovery
  app.post("/api/hub/cameras", async (req, res) => {
    try {
      const { cameras } = req.body;
      const hubSerial = req.headers['x-hub-serial'] as string;
      
      // Find hub
      const [hub] = await db
        .select()
        .from(tenantsHubs)
        .where(and(
          eq(tenantsHubs.tenantId, req.tenant!.tenantId),
          eq(tenantsHubs.serialNumber, hubSerial)
        ));
      
      if (!hub) {
        return res.status(404).json({ error: "Hub not found" });
      }
      
      // Check camera limits
      const existingCameras = await db
        .select({ count: sql<number>`count(*)` })
        .from(tenantsCameras)
        .where(eq(tenantsCameras.tenantId, req.tenant!.tenantId));
      
      if (existingCameras[0].count + cameras.length > req.tenant!.tenant.maxCameras) {
        return res.status(400).json({ 
          error: "Camera limit exceeded",
          message: `Your subscription allows maximum ${req.tenant!.tenant.maxCameras} cameras`
        });
      }
      
      // Add cameras
      const addedCameras = await db
        .insert(tenantsCameras)
        .values(cameras.map((camera: any) => ({
          ...camera,
          tenantId: req.tenant!.tenantId,
          hubId: hub.id
        })))
        .returning();
      
      res.status(201).json({ cameras: addedCameras });
    } catch (error) {
      console.error("Add cameras error:", error);
      res.status(500).json({ error: "Failed to add cameras" });
    }
  });
  
  // Hub reports events
  app.post("/api/hub/events", async (req, res) => {
    try {
      const { events } = req.body;
      const hubSerial = req.headers['x-hub-serial'] as string;
      
      // Find hub
      const [hub] = await db
        .select()
        .from(tenantsHubs)
        .where(and(
          eq(tenantsHubs.tenantId, req.tenant!.tenantId),
          eq(tenantsHubs.serialNumber, hubSerial)
        ));
      
      if (!hub) {
        return res.status(404).json({ error: "Hub not found" });
      }
      
      // Add events
      const addedEvents = await db
        .insert(tenantsEvents)
        .values(events.map((event: any) => ({
          ...event,
          tenantId: req.tenant!.tenantId,
          hubId: hub.id
        })))
        .returning();
      
      res.status(201).json({ events: addedEvents });
    } catch (error) {
      console.error("Add events error:", error);
      res.status(500).json({ error: "Failed to add events" });
    }
  });
}