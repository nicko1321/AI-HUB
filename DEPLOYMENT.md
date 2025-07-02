# Alert 360 Video Shield - Deployment Guide

## Quick Vercel Deployment

### Prerequisites
- Vercel account
- PostgreSQL database (recommend Vercel Postgres or Neon)
- GitHub repository

### 1. Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/alert360-video-shield)

#### Option B: Manual Deploy
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Vercel will auto-detect the framework and build settings

### 2. Environment Variables

Set these in Vercel dashboard under **Settings → Environment Variables**:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

Optional for enhanced features:
```env
OPENAI_API_KEY=your_openai_key_for_ai_analytics
```

### 3. Database Setup

#### Using Vercel Postgres (Recommended)
1. Go to Vercel dashboard → Storage tab
2. Create Postgres database
3. Copy connection string to `DATABASE_URL`

#### Using Neon (Alternative)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `DATABASE_URL`

### 4. Deployment Configuration

The project includes:
- ✅ `vercel.json` - Vercel configuration
- ✅ Build scripts optimized for production
- ✅ Automatic API routing
- ✅ Static file serving
- ✅ Environment variable support

### 5. Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 6. Jetson Hardware Integration

When deploying the same codebase to Jetson Orin NX:

```bash
# On Jetson device
git clone https://github.com/yourusername/alert360-video-shield.git
cd alert360-video-shield
npm install
npm run build
npm start
```

The system automatically detects Jetson hardware and enables:
- Hardware-accelerated video processing
- ONVIF camera discovery
- Real-time system monitoring
- PTZ camera control

## Build Commands

The project uses these build commands:
- **Install**: `npm install`
- **Build**: `npm run build`
- **Start**: `npm start`
- **Dev**: `npm run dev`

## Architecture

### Frontend
- React 18 with TypeScript
- Vite build system
- Static files served from `/dist/public`

### Backend
- Node.js Express API
- TypeScript with ES modules
- API routes under `/api/*`

### Database
- PostgreSQL with Drizzle ORM
- Automatic schema management
- Environment-based configuration

## Troubleshooting

### Build Issues
- Ensure Node.js 18+ is used
- Check environment variables are set
- Verify database connection string

### Runtime Issues
- Check Vercel function logs
- Verify database connectivity
- Ensure all environment variables are set

### Performance
- Uses edge functions for optimal performance
- Automatic caching for static assets
- Database connection pooling

## Production Features

- ✅ Full-stack TypeScript application
- ✅ PostgreSQL database integration
- ✅ Real-time video monitoring
- ✅ PTZ camera control
- ✅ AI-powered analytics
- ✅ License plate detection
- ✅ Event management
- ✅ System monitoring
- ✅ Jetson hardware support
- ✅ ONVIF/RTSP camera integration

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Review API endpoints

The system is production-ready and optimized for both cloud deployment (Vercel) and edge deployment (Jetson Orin NX).