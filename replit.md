# Alert 360 Video Shield

## Overview

Alert 360 Video Shield is a full-stack web application for managing security systems with multiple Jetson Orin Alert 360 AI Hubs, cameras, events, and speakers. The application provides advanced AI-powered video monitoring with license plate detection, behavioral analysis, weapon detection, and comprehensive security management capabilities.

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
4. **Deployment**: Autoscale deployment target with health checks

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- `REPL_ID`: Replit-specific identifier for development features

## Changelog

```
Changelog:
- June 28, 2025. Updated hub management to use serial numbers instead of IP addresses for Jetson Orin devices
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```