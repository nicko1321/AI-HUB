# Alert 360 Video Shield

## Overview

Alert 360 Video Shield is a full-stack web application for managing security systems with multiple Jetson Orin Alert 360 AI Hubs, cameras, events, and speakers. The application provides advanced AI-powered video monitoring with license plate detection, behavioral analysis, weapon detection, comprehensive security management capabilities, and full PTZ (Pan/Tilt/Zoom) control for IP cameras via RTSP and ONVIF protocols.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with conventional HTTP methods
- **Development Server**: Custom Vite integration for hot module replacement
- **Build Process**: ESBuild for server bundling

### Hardware Integration Layer
- **Target Platform**: NVIDIA Jetson Orin NX 16GB AI Hub
- **Hardware Detection**: Automatic Jetson device tree detection
- **Video Processing**: GStreamer with NVIDIA hardware acceleration (nvv4l2decoder, nvvidconv)
- **Camera Protocols**: RTSP, ONVIF, HTTP, UDP, MIPI-CSI support
- **AI Performance**: Up to 100 TOPS for real-time video analytics
- **Network Discovery**: Automated ONVIF camera discovery with nmap
- **PTZ Control**: Hardware-accelerated PTZ commands via ONVIF protocol

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured via environment variables)
- **Schema**: Strongly typed schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Core Entities
1. **Hubs**: Main security system controllers with status monitoring
2. **Cameras**: Video surveillance devices with streaming capabilities
3. **Events**: Security events with severity levels and acknowledgment
4. **Speakers**: Audio devices for zone-based communication

### Frontend Components
- **Dashboard**: Overview of system status with interactive controls
- **Video Wall**: Multi-camera view with customizable grid layouts
- **Events**: Event management with filtering and acknowledgment
- **Settings**: System configuration and hub management
- **Sidebar Navigation**: Persistent navigation with hub selection

### Backend Services
- **Storage Interface**: Abstracted data layer with in-memory implementation
- **Route Handlers**: Express middleware for API endpoints
- **Validation**: Zod schemas for request/response validation

## Data Flow

### Client-Server Communication
1. React components use TanStack Query hooks for data fetching
2. Custom `apiRequest` utility handles HTTP requests with error handling
3. Server responds with JSON data following RESTful conventions
4. Real-time updates through query invalidation and refetching

### Database Operations
1. Drizzle ORM provides type-safe database queries
2. Schema definitions ensure data consistency
3. Connection pooling through Neon Database serverless driver
4. Environment-based configuration for different deployment stages

## External Dependencies

### Core Libraries
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database queries and migrations
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **wouter**: Lightweight React routing
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Type-safe styling variants

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- Replit-optimized development server on port 5000
- Hot module replacement for both client and server code
- PostgreSQL module integrated through Replit modules
- Environment variables managed through Replit secrets

### Production Build
1. **Client Build**: Vite bundles React application to `dist/public`
2. **Server Build**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `npm run db:push`
4. **Deployment**: 
   - **Full-Stack (Recommended)**: Use Autoscale deployment for complete client+server application
   - **Client-Only**: Use Static deployment with `build:client` script for frontend-only hosting

### Multi-Platform Deployment Support

The system is configured for deployment on multiple platforms:

#### Vercel Deployment (Production Ready)
- **Configuration**: `vercel.json` with optimized routing
- **Build Process**: Automatic detection and building
- **API Routes**: Serverless functions under `/api/*`
- **Static Assets**: Served from `/dist/public`
- **Database**: Compatible with Vercel Postgres and Neon
- **Deploy Command**: `vercel` or GitHub integration

#### Replit Deployment (Development/Testing)
- **Type**: Autoscale deployment (full-stack)
- **Build Command**: `npm run build`
- **Run Command**: `npm run start`
- **Port**: Auto-configured for Replit environment

#### Jetson Deployment (Edge/Hardware)
- **Platform**: NVIDIA Jetson Orin NX 16GB
- **Installation**: Direct npm install and build
- **Features**: Hardware acceleration automatically enabled
- **Performance**: Up to 8 camera streams with GPU acceleration

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- `REPL_ID`: Replit-specific identifier for development features

### Jetson Orin NX 16GB Deployment

#### Auto-Boot Ready System
- **NVIDIA Jetson Orin NX 16GB AI Hub**: Pre-configured and auto-boot ready
- **Automatic Hardware Detection**: System automatically detects and optimizes for Jetson hardware
- **Zero-Configuration Deployment**: No manual setup required - simply deploy and run
- **Network Auto-Discovery**: Automatically discovers ONVIF cameras on network
- **Hardware Acceleration**: Automatically enables GPU acceleration when Jetson hardware detected

#### Deployment Features
- **One-Click Deployment**: Deploy directly to Jetson hardware without configuration
- **Automatic Optimization**: System auto-configures power modes and performance settings
- **Instant Camera Discovery**: ONVIF cameras automatically detected and configured
- **Real-Time Processing**: Up to 8 simultaneous camera streams with hardware acceleration
- **AI Analytics Ready**: All AI models pre-loaded and optimized for immediate use

#### Hardware Features Enabled on Jetson
- **Automatic Hardware Detection**: System detects Jetson device tree and enables hardware acceleration
- **GStreamer Hardware Acceleration**: Uses nvv4l2decoder, nvvidconv for efficient video processing
- **ONVIF Camera Discovery**: Network scanning and automatic camera detection
- **PTZ Hardware Control**: Real-time PTZ commands via ONVIF protocol
- **System Monitoring**: CPU, GPU, memory, and thermal monitoring via tegrastats
- **Multi-Stream Processing**: Up to 8 simultaneous camera streams with hardware acceleration

#### Performance Optimizations
- Hardware-accelerated H.264/H.265 decoding
- Zero-copy memory operations with NVMM
- Configurable power modes (10W-40W)
- Real-time AI inference up to 100 TOPS
- Low-latency RTSP streaming with buffer optimization

## Changelog

```
Changelog:
- July 2, 2025. Implemented simple email invitation system for hub-specific user management like CHekT platform
- July 2, 2025. Created hub-specific user access control with three role levels: admin, operator, viewer
- July 2, 2025. Added email invitation workflow - users click link to create password and use email as username
- July 2, 2025. Completed comprehensive IP speaker management system with network discovery and audio zone configuration
- July 2, 2025. Enhanced event system with sophisticated AI intelligence terminology replacing basic security terms
- July 2, 2025. Updated UI to hide hardware specifications from end users - removed Jetson Orin references from interface
- July 2, 2025. Implemented multi-tenant SaaS architecture for customer deployments and mobile surveillance fleet
- July 2, 2025. Added complete customer isolation with API key authentication and hub licensing system
- July 2, 2025. Created tenant management system with subscription tiers and usage billing
- July 2, 2025. Deployed production system to Vercel with PostgreSQL database connectivity
- June 30, 2025. Added comprehensive PTZ (Pan/Tilt/Zoom) control functionality for IP cameras with live view integration
- June 30, 2025. Enhanced camera management with RTSP/ONVIF support and network discovery capabilities
- June 30, 2025. Implemented advanced alert categorization system distinguishing safety alerts from normal notifications
- June 28, 2025. Updated hub management to use serial numbers instead of IP addresses for Jetson Orin devices
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```