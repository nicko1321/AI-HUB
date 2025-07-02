import type { Express } from "express";
import { z } from "zod";
import { db } from "./db";
import { tenants, tenantUsers, hubLicenses, tenantsHubs } from "../shared/tenant-schema";
import { eq, and, count, sql } from "drizzle-orm";
import crypto from "crypto";

const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  subscriptionTier: z.enum(["basic", "pro", "enterprise"]).default("basic"),
  maxHubs: z.number().min(1).max(100).default(5),
  maxCameras: z.number().min(1).max(500).default(50),
});

// Middleware to verify dealer permissions
const requireDealerAuth = (req: any, res: any, next: any) => {
  // For now, we'll assume all authenticated users are dealers
  // In production, you'd check user role/permissions
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export function registerDealerRoutes(app: Express) {
  // Get dealer statistics
  app.get("/api/dealer/stats", requireDealerAuth, async (req, res) => {
    try {
      // Get total customers count
      const [totalCustomersResult] = await db
        .select({ count: count() })
        .from(tenants);
      
      // Get total hubs count
      const [totalHubsResult] = await db
        .select({ count: count() })
        .from(tenantsHubs);
      
      // Get total users count
      const [totalUsersResult] = await db
        .select({ count: count() })
        .from(tenantUsers);
      
      // Get online hubs count
      const [onlineHubsResult] = await db
        .select({ count: count() })
        .from(tenantsHubs)
        .where(eq(tenantsHubs.status, "online"));

      // Calculate stats (in production, you'd have more sophisticated metrics)
      const stats = {
        totalCustomers: totalCustomersResult.count,
        totalHubs: totalHubsResult.count,
        totalUsers: totalUsersResult.count,
        onlineHubs: onlineHubsResult.count,
        newCustomersThisMonth: Math.floor(totalCustomersResult.count * 0.1), // Mock
        monthlyRevenue: totalCustomersResult.count * 199, // Mock calculation
        revenueGrowth: 15, // Mock
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dealer stats:", error);
      res.status(500).json({ message: "Failed to fetch dealer statistics" });
    }
  });

  // Get all customers for dealer
  app.get("/api/dealer/customers", requireDealerAuth, async (req, res) => {
    try {
      const customers = await db
        .select({
          id: tenants.id,
          name: tenants.name,
          slug: tenants.slug,
          billingEmail: tenants.billingEmail,
          subscriptionTier: tenants.subscriptionTier,
          maxHubs: tenants.maxHubs,
          maxCameras: tenants.maxCameras,
          status: tenants.status,
          createdAt: tenants.createdAt,
          hubCount: sql<number>`(
            SELECT COUNT(*) 
            FROM ${tenantsHubs} 
            WHERE ${tenantsHubs.tenantId} = ${tenants.id}
          )`,
        })
        .from(tenants)
        .orderBy(tenants.createdAt);

      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Create new customer
  app.post("/api/dealer/customers", requireDealerAuth, async (req, res) => {
    try {
      const customerData = createCustomerSchema.parse(req.body);
      
      // Generate unique slug and API key
      const slug = customerData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const apiKey = crypto.randomBytes(32).toString('hex');
      
      // Create customer tenant
      const [customer] = await db
        .insert(tenants)
        .values({
          name: customerData.name,
          slug: `${slug}-${Date.now()}`, // Ensure uniqueness
          apiKey,
          subscriptionTier: customerData.subscriptionTier,
          maxHubs: customerData.maxHubs,
          maxCameras: customerData.maxCameras,
          billingEmail: customerData.email,
          contactPhone: customerData.phone,
          status: "active",
          address: customerData.address ? {
            street: customerData.address,
            city: customerData.city,
            state: customerData.state,
            zip: customerData.zipCode,
          } : null,
        })
        .returning();

      // Create default admin user for the customer
      await db
        .insert(tenantUsers)
        .values({
          tenantId: customer.id,
          email: customerData.email,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          permissions: ["*"], // Full permissions
          isActive: true,
        });

      res.json({ 
        customer, 
        apiKey,
        message: "Customer created successfully. Provide them with their API key for hub setup." 
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Get customer details
  app.get("/api/dealer/customers/:id", requireDealerAuth, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      
      const [customer] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, customerId));

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Get customer's hubs
      const hubs = await db
        .select()
        .from(tenantsHubs)
        .where(eq(tenantsHubs.tenantId, customerId));

      // Get customer's users
      const users = await db
        .select()
        .from(tenantUsers)
        .where(eq(tenantUsers.tenantId, customerId));

      // Get customer's licenses
      const licenses = await db
        .select()
        .from(hubLicenses)
        .where(eq(hubLicenses.tenantId, customerId));

      res.json({ customer, hubs, users, licenses });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      res.status(500).json({ message: "Failed to fetch customer details" });
    }
  });

  // Generate hub license for customer
  app.post("/api/dealer/customers/:id/licenses", requireDealerAuth, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const { hubSerial, hubName, deploymentLocation, maxCameras } = req.body;
      
      // Verify customer exists
      const [customer] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, customerId));

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Check if customer has reached hub limit
      const [hubCountResult] = await db
        .select({ count: count() })
        .from(hubLicenses)
        .where(eq(hubLicenses.tenantId, customerId));

      if (hubCountResult.count >= customer.maxHubs) {
        return res.status(400).json({ 
          message: `Customer has reached their hub limit of ${customer.maxHubs}` 
        });
      }

      // Generate license key
      const licenseKey = crypto.randomBytes(32).toString('hex');
      
      // Create license
      const [license] = await db
        .insert(hubLicenses)
        .values({
          tenantId: customerId,
          hubSerial,
          licenseKey,
          hubName,
          deploymentLocation,
          maxCameras: maxCameras || customer.maxCameras,
          status: "active",
          features: {
            aiAnalytics: true,
            licenseRecognition: true,
            behaviorAnalysis: true,
            multiCamera: true,
          },
        })
        .returning();

      res.json({ license, message: "Hub license generated successfully" });
    } catch (error) {
      console.error("Error generating license:", error);
      res.status(500).json({ message: "Failed to generate hub license" });
    }
  });

  // Update customer
  app.patch("/api/dealer/customers/:id", requireDealerAuth, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const updates = req.body;
      
      const [customer] = await db
        .update(tenants)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, customerId))
        .returning();

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json({ customer, message: "Customer updated successfully" });
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Suspend/reactivate customer
  app.patch("/api/dealer/customers/:id/status", requireDealerAuth, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["active", "suspended", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const [customer] = await db
        .update(tenants)
        .set({ status, updatedAt: new Date() })
        .where(eq(tenants.id, customerId))
        .returning();

      res.json({ customer, message: `Customer ${status} successfully` });
    } catch (error) {
      console.error("Error updating customer status:", error);
      res.status(500).json({ message: "Failed to update customer status" });
    }
  });
}