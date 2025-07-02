import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { tenants, hubLicenses, apiUsage } from "@shared/tenant-schema";
import { eq, and } from "drizzle-orm";

// Generate secure API keys and license keys
export function generateApiKey(): string {
  return `ak_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateLicenseKey(): string {
  return `lk_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateHubSerial(tenantSlug: string, sequence: number): string {
  const timestamp = Date.now().toString(36);
  return `AO-${tenantSlug.toUpperCase()}-${sequence.toString().padStart(3, '0')}-${timestamp}`;
}

// Tenant context for requests
export interface TenantContext {
  tenantId: number;
  tenant: {
    id: number;
    name: string;
    slug: string;
    subscriptionTier: string;
    maxHubs: number;
    maxCameras: number;
    status: string;
  };
  user?: {
    id: number;
    email: string;
    role: string;
    permissions: string[];
  };
}

// Extend Express Request to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

// Middleware to authenticate API requests using API key
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string || req.query.api_key as string;
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: "API key required", 
        message: "Provide API key in X-API-Key header or api_key query parameter" 
      });
    }

    // Find tenant by API key
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(and(
        eq(tenants.apiKey, apiKey),
        eq(tenants.status, "active")
      ));

    if (!tenant) {
      return res.status(401).json({ 
        error: "Invalid API key",
        message: "API key not found or tenant is inactive"
      });
    }

    // Add tenant context to request
    req.tenant = {
      tenantId: tenant.id,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subscriptionTier: tenant.subscriptionTier,
        maxHubs: tenant.maxHubs,
        maxCameras: tenant.maxCameras,
        status: tenant.status
      }
    };

    // Track API usage for billing
    await trackApiUsage(req, tenant.id);
    
    next();
  } catch (error) {
    console.error("API authentication error:", error);
    res.status(500).json({ 
      error: "Authentication failed",
      message: "Internal server error during authentication"
    });
  }
};

// Middleware to authenticate hub connections using license key
export const authenticateHubLicense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const licenseKey = req.headers['x-license-key'] as string;
    const hubSerial = req.headers['x-hub-serial'] as string;
    
    if (!licenseKey || !hubSerial) {
      return res.status(401).json({ 
        error: "Hub authentication required",
        message: "Provide X-License-Key and X-Hub-Serial headers"
      });
    }

    // Find valid license
    const [license] = await db
      .select({
        id: hubLicenses.id,
        tenantId: hubLicenses.tenantId,
        hubSerial: hubLicenses.hubSerial,
        status: hubLicenses.status,
        maxCameras: hubLicenses.maxCameras,
        features: hubLicenses.features,
        expiresAt: hubLicenses.expiresAt,
        tenant: {
          id: tenants.id,
          name: tenants.name,
          slug: tenants.slug,
          subscriptionTier: tenants.subscriptionTier,
          maxHubs: tenants.maxHubs,
          maxCameras: tenants.maxCameras,
          status: tenants.status
        }
      })
      .from(hubLicenses)
      .innerJoin(tenants, eq(hubLicenses.tenantId, tenants.id))
      .where(and(
        eq(hubLicenses.licenseKey, licenseKey),
        eq(hubLicenses.hubSerial, hubSerial),
        eq(hubLicenses.status, "active"),
        eq(tenants.status, "active")
      ));

    if (!license) {
      return res.status(401).json({ 
        error: "Invalid hub license",
        message: "License key/serial combination not found or inactive"
      });
    }

    // Check license expiration
    if (license.expiresAt && new Date() > license.expiresAt) {
      return res.status(401).json({ 
        error: "License expired",
        message: "Hub license has expired, please renew"
      });
    }

    // Add tenant context to request
    req.tenant = {
      tenantId: license.tenantId,
      tenant: license.tenant
    };

    // Track API usage for billing
    await trackApiUsage(req, license.tenantId);
    
    next();
  } catch (error) {
    console.error("Hub license authentication error:", error);
    res.status(500).json({ 
      error: "Authentication failed",
      message: "Internal server error during hub authentication"
    });
  }
};

// Track API usage for billing purposes
async function trackApiUsage(req: Request, tenantId: number) {
  try {
    const endpoint = req.route?.path || req.path;
    const method = req.method;
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    await db.insert(apiUsage).values({
      tenantId,
      endpoint,
      method,
      month,
      requestCount: 1
    }).onConflictDoUpdate({
      target: [apiUsage.tenantId, apiUsage.endpoint, apiUsage.method, apiUsage.month],
      set: {
        requestCount: apiUsage.requestCount + 1
      }
    });
  } catch (error) {
    // Don't fail requests if usage tracking fails
    console.error("Failed to track API usage:", error);
  }
}

// Role-based permission checking
export const requireRole = (minRole: string) => {
  const roleHierarchy = ['viewer', 'user', 'manager', 'admin'];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant?.user) {
      return res.status(403).json({ 
        error: "User authentication required",
        message: "This endpoint requires user-level authentication"
      });
    }

    const userRoleIndex = roleHierarchy.indexOf(req.tenant.user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(minRole);
    
    if (userRoleIndex < requiredRoleIndex) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        message: `This action requires ${minRole} role or higher`
      });
    }
    
    next();
  };
};

// Permission checking
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant?.user) {
      return res.status(403).json({ 
        error: "User authentication required",
        message: "This endpoint requires user-level authentication"
      });
    }

    if (!req.tenant.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: "Permission denied",
        message: `This action requires '${permission}' permission`
      });
    }
    
    next();
  };
};

// Subscription tier checking
export const requireSubscriptionTier = (minTier: string) => {
  const tierHierarchy = ['basic', 'pro', 'enterprise'];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(403).json({ 
        error: "Authentication required",
        message: "Tenant authentication required"
      });
    }

    const tenantTierIndex = tierHierarchy.indexOf(req.tenant.tenant.subscriptionTier);
    const requiredTierIndex = tierHierarchy.indexOf(minTier);
    
    if (tenantTierIndex < requiredTierIndex) {
      return res.status(403).json({ 
        error: "Subscription upgrade required",
        message: `This feature requires ${minTier} subscription or higher`
      });
    }
    
    next();
  };
};

// Rate limiting based on subscription tier
export const rateLimitByTier = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return next();
  }

  // Rate limits per subscription tier (requests per minute)
  const rateLimits = {
    basic: 100,
    pro: 500,
    enterprise: 2000
  };

  const tierLimit = rateLimits[req.tenant.tenant.subscriptionTier as keyof typeof rateLimits] || 100;
  
  // In production, implement actual rate limiting logic here
  // For now, just add the limit to response headers
  res.setHeader('X-RateLimit-Limit', tierLimit);
  res.setHeader('X-RateLimit-Tier', req.tenant.tenant.subscriptionTier);
  
  next();
};