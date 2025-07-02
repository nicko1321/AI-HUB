# Jetson Orin NX 16GB Deployment Guide

## Step 1: Prepare Your Jetson Device

### Flash JetPack 6.0 (Latest)
1. Download NVIDIA SDK Manager on your computer
2. Connect Jetson to computer via USB-C
3. Put Jetson in recovery mode (hold recovery button while powering on)
4. Flash JetPack 6.0 with all components
5. Complete initial Ubuntu setup

### Initial System Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl git build-essential
```

## Step 2: Install Node.js 20

```bash
# Install Node.js 20 (required for the app)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show latest npm
```

## Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE alert360;"
sudo -u postgres psql -c "CREATE USER alert360 WITH PASSWORD 'jetson2025';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE alert360 TO alert360;"
```

## Step 4: Deploy Alert 360 Video Shield

### Download and Extract
1. Download the project zip file from Replit
2. Extract to your home directory: `/home/[username]/alert360-video-shield/`

### Install Dependencies
```bash
cd /home/[username]/alert360-video-shield/
npm install
```

### Configure Environment
```bash
# Create environment file
cat > .env << EOF
DATABASE_URL=postgresql://alert360:jetson2025@localhost:5432/alert360
NODE_ENV=production
PORT=5000
EOF
```

### Build and Initialize Database
```bash
# Build the application
npm run build

# Initialize database with sample data
npm run db:push
```

## Step 5: Create Auto-Start Service

```bash
# Create systemd service file
sudo tee /etc/systemd/system/alert360.service > /dev/null << EOF
[Unit]
Description=Alert 360 Video Shield
After=network.target postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/alert360-video-shield
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable alert360
sudo systemctl start alert360
```

## Step 6: Verify Installation

### Check Service Status
```bash
# Check if service is running
sudo systemctl status alert360

# View logs
sudo journalctl -u alert360 -f
```

### Test Web Interface
1. Open browser on Jetson or another device on same network
2. Navigate to: `http://[jetson-ip]:5000`
3. You should see the Alert 360 Video Shield interface

### Find Jetson IP Address
```bash
hostname -I
```

## Step 7: Network Configuration

### Configure Firewall (if needed)
```bash
# Allow port 5000
sudo ufw allow 5000
```

### Static IP (Optional but Recommended)
Edit network settings in Ubuntu to set a static IP for reliable access.

## Step 8: Hardware Optimization

### Enable Maximum Performance
```bash
# Set performance mode
sudo nvpmodel -m 0  # Maximum performance mode
sudo jetson_clocks   # Max clock speeds
```

### Check Hardware Status
```bash
# Monitor system stats
sudo tegrastats

# Check GPU usage
nvidia-smi
```

## Troubleshooting

### Service Won't Start
```bash
# Check logs
sudo journalctl -u alert360 --no-pager

# Check if port is in use
sudo netstat -tlnp | grep :5000
```

### Database Connection Issues
```bash
# Test database connection
sudo -u postgres psql -d alert360 -c "SELECT 1;"

# Reset database if needed
sudo -u postgres dropdb alert360
sudo -u postgres createdb alert360
npm run db:push
```

### Performance Issues
```bash
# Check system resources
htop

# Monitor GPU usage
nvidia-smi -l 1
```

## Auto-Boot Ready Features

Once deployed, your Jetson will automatically:
- Start the Alert 360 service on boot
- Detect and use hardware acceleration
- Discover ONVIF cameras on the network
- Enable PTZ control for compatible cameras
- Process up to 8 camera streams with GPU acceleration

## Next Steps

1. Access the web interface at `http://[jetson-ip]:5000`
2. Go to Settings → User Management to invite users
3. Add cameras via Settings → Camera Management
4. Configure AI analytics in the Analytics section
5. Set up speakers for audio notifications

Your Jetson Orin NX is now ready for production AI video monitoring!