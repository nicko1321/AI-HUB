# Alert 360 Video Shield - Multi-Tenant SaaS Deployment Guide

## Architecture Overview

Alert 360 Video Shield now operates as a **multi-tenant SaaS platform** where:

- **Customers** sign up and get their own isolated environment
- **Jetson Orin NX hubs** are licensed to specific customers
- **Complete data isolation** between customers
- **Scalable pricing** based on hub/camera count and usage

## Customer Onboarding Flow

### 1. Customer Registration
```bash
curl -X POST https://your-domain.com/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Security Inc",
    "subscriptionTier": "pro",
    "maxHubs": 10,
    "maxCameras": 100,
    "billingEmail": "billing@acme.com",
    "contactPhone": "+1-555-0123"
  }'
```

**Response:**
```json
{
  "tenant": {
    "id": 1,
    "name": "Acme Security Inc",
    "slug": "acme-security-inc",
    "subscriptionTier": "pro",
    "maxHubs": 10,
    "maxCameras": 100,
    "status": "active"
  },
  "apiKey": "ak_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "message": "Tenant created successfully. Save your API key securely!"
}
```

### 2. Hub License Generation
```bash
curl -X POST https://your-domain.com/api/tenant/hub-licenses \
  -H "X-API-Key: ak_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" \
  -H "Content-Type: application/json" \
  -d '{
    "hubName": "Main Office Hub",
    "deploymentLocation": "123 Main St, Anytown USA",
    "maxCameras": 16
  }'
```

**Response:**
```json
{
  "license": {
    "id": 1,
    "hubSerial": "AO-ACME-SECURITY-INC-001-abc123",
    "licenseKey": "lk_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6",
    "hubName": "Main Office Hub",
    "deploymentLocation": "123 Main St, Anytown USA",
    "status": "active",
    "maxCameras": 16
  }
}
```

## Jetson Orin NX Hub Deployment

### 1. Physical Hub Setup
Each customer receives a Jetson Orin NX hub with:
- Pre-installed Alert 360 Video Shield software
- Unique hub serial number
- License key for activation

### 2. Hub Configuration
Create `/etc/alert360/config.env` on the Jetson:
```bash
# Customer Authentication
CUSTOMER_API_KEY=ak_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
HUB_SERIAL=AO-ACME-SECURITY-INC-001-abc123
HUB_LICENSE_KEY=lk_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6

# Cloud Connection
ALERT360_CLOUD_URL=https://your-domain.com
DATABASE_URL=postgresql://customer-specific-db-url

# Hub Configuration
NODE_ENV=production
HUB_NAME="Main Office Hub"
DEPLOYMENT_LOCATION="123 Main St, Anytown USA"
```

### 3. Hub Activation
When the Jetson starts, it automatically:
1. Validates license key with cloud platform
2. Registers with customer's tenant
3. Starts camera discovery
4. Begins sending heartbeats

```bash
# Hub sends heartbeat every 30 seconds
curl -X POST https://your-domain.com/api/hub/heartbeat \
  -H "X-License-Key: lk_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6" \
  -H "X-Hub-Serial: AO-ACME-SECURITY-INC-001-abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "online",
    "ipAddress": "192.168.1.100",
    "version": "1.0.0",
    "configuration": {
      "cameraCount": 4,
      "aiModelsLoaded": ["weapon-detection", "license-plate", "person-detection"]
    }
  }'
```

## Customer Dashboard Access

### 1. Customer API Usage
Customers access their data using their API key:

```bash
# Get customer info
curl -H "X-API-Key: ak_..." https://your-domain.com/api/tenant/info

# List customer's hubs
curl -H "X-API-Key: ak_..." https://your-domain.com/api/tenant/hubs

# List customer's cameras  
curl -H "X-API-Key: ak_..." https://your-domain.com/api/tenant/cameras

# Get security events
curl -H "X-API-Key: ak_..." https://your-domain.com/api/tenant/events
```

### 2. Multi-Location Management
Customers can deploy multiple hubs across different locations:

```
Customer: Acme Security Inc
├── Hub-001: Main Office (123 Main St)
│   ├── Camera-001: Front Entrance
│   ├── Camera-002: Parking Lot
│   └── Camera-003: Loading Dock
├── Hub-002: Warehouse (456 Industrial Blvd)
│   ├── Camera-004: Gate Entry
│   ├── Camera-005: Storage Area
│   └── Camera-006: Shipping Bay
└── Hub-003: Retail Store (789 Shopping Center)
    ├── Camera-007: Store Front
    └── Camera-008: Cash Register Area
```

## Subscription Tiers & Billing

### Basic Tier ($99/month)
- Up to 3 hubs
- Up to 25 cameras total
- Basic AI analytics
- 1000 API calls/month
- Email support

### Pro Tier ($299/month) 
- Up to 10 hubs
- Up to 100 cameras total
- Advanced AI analytics
- 10,000 API calls/month
- Phone + email support
- Usage analytics dashboard

### Enterprise Tier ($999/month)
- Unlimited hubs
- Unlimited cameras
- Custom AI models
- Unlimited API calls
- Dedicated support manager
- White-label options

## Mobile Surveillance Fleet Integration

For your own mobile surveillance units:

### 1. Internal Tenant Setup
```bash
# Create internal tenant for your fleet
curl -X POST https://your-domain.com/api/tenants \
  -d '{
    "name": "Alert 360 Mobile Fleet",
    "subscriptionTier": "enterprise",
    "maxHubs": 1000,
    "maxCameras": 10000
  }'
```

### 2. Mobile Unit Configuration
Each surveillance trailer/vehicle gets:
```bash
# Mobile unit environment
CUSTOMER_API_KEY=ak_internal_fleet_key
HUB_SERIAL=AO-MOBILE-FLEET-001-xyz789
DEPLOYMENT_TYPE=mobile
GPS_TRACKING=enabled
CELLULAR_BACKUP=enabled
```

## Scaling Architecture

### Database Scaling Options

**Option 1: Tenant-per-Database**
- Separate PostgreSQL database per customer
- Complete isolation and compliance
- Easy customer data migration/backup

**Option 2: Shared Database with Tenant ID**
- Single database with tenant_id column
- Row-level security (RLS) for isolation
- More cost-effective for smaller customers

**Option 3: Schema-per-Tenant**
- Separate schema per customer in same database
- Balance of isolation and cost efficiency

### Hub Communication
```
Cloud Platform (Vercel/AWS)
├── Customer A Data
├── Customer B Data  
└── Customer C Data

        ↕ Secure API

Jetson Hub A1 → Customer A Cameras
Jetson Hub A2 → Customer A Cameras
Jetson Hub B1 → Customer B Cameras
Mobile Unit M1 → Your Fleet Cameras
```

## Security & Compliance

### Data Isolation
- **API Key Authentication**: Every request requires valid customer API key
- **License Key Validation**: Hubs authenticate with unique license keys
- **Database Isolation**: Customer data completely separated
- **Rate Limiting**: API usage limits based on subscription tier

### Compliance Features
- **SOC 2 Type II**: Data security and availability controls
- **GDPR Ready**: Data portability and deletion capabilities
- **Audit Logging**: Complete API and hub activity tracking
- **Encryption**: Data encrypted in transit and at rest

This architecture transforms Alert 360 Video Shield into a scalable SaaS platform that serves both external customers and your internal mobile surveillance fleet with complete data isolation and professional-grade security.