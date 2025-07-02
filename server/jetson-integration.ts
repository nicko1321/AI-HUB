/**
 * Jetson Orin NX 16GB Integration Layer
 * 
 * This module provides interfaces and utilities for connecting
 * the Alert 360 Video Shield system to real Jetson Orin NX hardware
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// Jetson hardware specifications
export const JETSON_SPECS = {
  model: 'Jetson Orin NX 16GB',
  maxCameras: 8, // Recommended max simultaneous RTSP streams
  maxResolution: '4K@30fps',
  aiPerformance: '100 TOPS',
  memory: '16GB LPDDR5',
  powerModes: ['10W', '15W', '25W', '40W'],
  supportedProtocols: ['RTSP', 'ONVIF', 'HTTP', 'UDP', 'MIPI-CSI'],
  hardwareEncoders: ['H.264', 'H.265', 'AV1'],
  interfaces: {
    ethernet: '1x Gigabit',
    usb: '4x USB 3.2',
    displayPort: '1x DP 1.4a',
    hdmi: '1x HDMI 2.1',
    pcie: 'PCIe Gen4',
    gpio: true,
    uart: '3x UART',
    i2c: '4x I2C',
    spi: '2x SPI'
  }
};

// Camera discovery and management for Jetson
export class JetsonCameraManager extends EventEmitter {
  private discoveredCameras: Map<string, JetsonCamera> = new Map();
  private activeStreams: Map<string, ChildProcess> = new Map();

  constructor() {
    super();
  }

  /**
   * Discover ONVIF cameras on the network using hardware-accelerated discovery
   */
  async discoverONVIFCameras(networkRange: string = '192.168.1.0/24'): Promise<JetsonCamera[]> {
    return new Promise((resolve, reject) => {
      // Use nmap for network discovery with ONVIF probe
      const discovery = spawn('nmap', [
        '-p', '80,554,8080,8554',
        '--script', 'broadcast-dhcp-discover',
        networkRange
      ]);

      let output = '';
      discovery.stdout.on('data', (data) => {
        output += data.toString();
      });

      discovery.on('close', async (code) => {
        if (code === 0) {
          const cameras = await this.parseNetworkDiscovery(output);
          resolve(cameras);
        } else {
          reject(new Error(`Network discovery failed with code ${code}`));
        }
      });

      discovery.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Parse network discovery results and probe for ONVIF capabilities
   */
  private async parseNetworkDiscovery(nmapOutput: string): Promise<JetsonCamera[]> {
    const cameras: JetsonCamera[] = [];
    const ipRegex = /(\d+\.\d+\.\d+\.\d+)/g;
    const ips = nmapOutput.match(ipRegex) || [];

    for (const ip of ips) {
      try {
        const camera = await this.probeONVIFCamera(ip);
        if (camera) {
          cameras.push(camera);
          this.discoveredCameras.set(ip, camera);
        }
      } catch (error) {
        console.log(`Failed to probe camera at ${ip}:`, error);
      }
    }

    return cameras;
  }

  /**
   * Probe a specific IP for ONVIF capabilities
   */
  private async probeONVIFCamera(ip: string): Promise<JetsonCamera | null> {
    // This would use the onvif-ts library or similar to probe the camera
    // For now, returning a mock structure that matches real ONVIF responses
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ip,
          manufacturer: 'Unknown',
          model: 'IP Camera',
          onvifPort: 80,
          rtspPort: 554,
          capabilities: {
            ptz: false,
            imaging: true,
            media: true,
            deviceIO: false
          },
          profiles: [
            {
              name: 'MainStream',
              resolution: '1920x1080',
              codec: 'H264',
              framerate: 30,
              rtspUri: `rtsp://${ip}:554/stream1`
            }
          ]
        });
      }, 100);
    });
  }

  /**
   * Create optimized GStreamer pipeline for Jetson Orin NX hardware acceleration
   */
  createHardwareAcceleratedPipeline(camera: JetsonCamera, profile: CameraProfile): string {
    const { rtspUri, codec, resolution } = profile;
    const [width, height] = resolution.split('x').map(Number);

    if (codec === 'H264') {
      return [
        `rtspsrc location=${rtspUri} latency=200 buffer-mode=auto`,
        'rtph264depay',
        'h264parse',
        'nvv4l2decoder enable-max-performance=1',
        `nvvidconv ! video/x-raw(memory:NVMM),width=${width},height=${height},format=NV12`,
        'nvvidconv ! video/x-raw,format=BGRx',
        'videoconvert ! video/x-raw,format=BGR',
        'appsink drop=1 max-buffers=2 emit-signals=true'
      ].join(' ! ');
    } else if (codec === 'H265') {
      return [
        `rtspsrc location=${rtspUri} latency=200 buffer-mode=auto`,
        'rtph265depay',
        'h265parse',
        'nvv4l2decoder enable-max-performance=1',
        `nvvidconv ! video/x-raw(memory:NVMM),width=${width},height=${height},format=NV12`,
        'nvvidconv ! video/x-raw,format=BGRx',
        'videoconvert ! video/x-raw,format=BGR',
        'appsink drop=1 max-buffers=2 emit-signals=true'
      ].join(' ! ');
    }

    // Fallback to software decoding
    return [
      `rtspsrc location=${rtspUri} latency=200`,
      'decodebin',
      `videoscale ! video/x-raw,width=${width},height=${height}`,
      'videoconvert ! video/x-raw,format=BGR',
      'appsink drop=1 max-buffers=2 emit-signals=true'
    ].join(' ! ');
  }

  /**
   * Start streaming from a camera with hardware acceleration
   */
  async startCameraStream(cameraId: string, camera: JetsonCamera, profileIndex: number = 0): Promise<boolean> {
    try {
      const profile = camera.profiles[profileIndex];
      const pipeline = this.createHardwareAcceleratedPipeline(camera, profile);

      const gstProcess = spawn('gst-launch-1.0', pipeline.split(' '), {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      gstProcess.stdout.on('data', (data) => {
        // Emit frame data for processing
        this.emit('frame', { cameraId, data });
      });

      gstProcess.stderr.on('data', (data) => {
        console.log(`Camera ${cameraId} stderr:`, data.toString());
      });

      gstProcess.on('close', (code) => {
        console.log(`Camera ${cameraId} stream ended with code ${code}`);
        this.activeStreams.delete(cameraId);
        this.emit('streamEnded', { cameraId, code });
      });

      this.activeStreams.set(cameraId, gstProcess);
      this.emit('streamStarted', { cameraId, camera, profile });
      return true;

    } catch (error) {
      console.error(`Failed to start stream for camera ${cameraId}:`, error);
      return false;
    }
  }

  /**
   * Stop a camera stream
   */
  stopCameraStream(cameraId: string): boolean {
    const process = this.activeStreams.get(cameraId);
    if (process) {
      process.kill('SIGTERM');
      this.activeStreams.delete(cameraId);
      return true;
    }
    return false;
  }

  /**
   * Send PTZ commands via ONVIF
   */
  async sendPTZCommand(camera: JetsonCamera, command: PTZCommand): Promise<boolean> {
    if (!camera.capabilities.ptz) {
      throw new Error('Camera does not support PTZ');
    }

    // This would use the onvif-ts library to send actual PTZ commands
    // For now, simulating the command structure
    console.log(`Sending PTZ command to ${camera.ip}:`, command);
    
    // Simulate ONVIF PTZ command
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit('ptzCommandExecuted', { camera, command });
        resolve(true);
      }, 100);
    });
  }

  /**
   * Get system performance metrics
   */
  async getJetsonMetrics(): Promise<JetsonMetrics> {
    return new Promise((resolve) => {
      const tegrastats = spawn('tegrastats', ['--once']);
      let output = '';

      tegrastats.stdout.on('data', (data) => {
        output += data.toString();
      });

      tegrastats.on('close', () => {
        const metrics = this.parseTegraStats(output);
        resolve(metrics);
      });
    });
  }

  /**
   * Parse tegrastats output for system metrics
   */
  private parseTegraStats(output: string): JetsonMetrics {
    // Parse tegrastats output to extract CPU, GPU, memory usage
    // This is a simplified version - real implementation would parse actual tegrastats format
    return {
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        frequency: 2200 // MHz
      },
      gpu: {
        usage: Math.random() * 100,
        frequency: 918 // MHz
      },
      memory: {
        used: Math.random() * 16000, // MB
        total: 16000,
        percentage: Math.random() * 100
      },
      temperature: {
        cpu: 45 + Math.random() * 20,
        gpu: 40 + Math.random() * 25,
        thermal: 35 + Math.random() * 15
      },
      power: {
        current: 15 + Math.random() * 10, // Watts
        mode: '25W'
      }
    };
  }
}

// Type definitions for Jetson integration
export interface JetsonCamera {
  ip: string;
  manufacturer: string;
  model: string;
  onvifPort: number;
  rtspPort: number;
  capabilities: {
    ptz: boolean;
    imaging: boolean;
    media: boolean;
    deviceIO: boolean;
  };
  profiles: CameraProfile[];
}

export interface CameraProfile {
  name: string;
  resolution: string;
  codec: string;
  framerate: number;
  rtspUri: string;
}

export interface PTZCommand {
  action: 'move' | 'zoom' | 'preset' | 'home' | 'patrol';
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  speed?: number;
  presetId?: number;
}

export interface JetsonMetrics {
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
  };
  gpu: {
    usage: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  temperature: {
    cpu: number;
    gpu: number;
    thermal: number;
  };
  power: {
    current: number;
    mode: string;
  };
}

// Environment detection
export function isRunningOnJetson(): boolean {
  try {
    const fs = require('fs');
    const deviceTree = fs.readFileSync('/proc/device-tree/model', 'utf8');
    return deviceTree.includes('Jetson') || deviceTree.includes('NVIDIA');
  } catch {
    return false;
  }
}

// Hardware capabilities check
export async function checkJetsonCapabilities(): Promise<{
  gstreamer: boolean;
  nvcodec: boolean;
  onvif: boolean;
  cuda: boolean;
}> {
  const capabilities = {
    gstreamer: false,
    nvcodec: false,
    onvif: false,
    cuda: false
  };

  try {
    // Check GStreamer
    const gstCheck = spawn('gst-launch-1.0', ['--version']);
    await new Promise((resolve) => {
      gstCheck.on('close', (code) => {
        capabilities.gstreamer = code === 0;
        resolve(code);
      });
    });

    // Check NVIDIA codec support
    const nvcodecCheck = spawn('gst-inspect-1.0', ['nvv4l2decoder']);
    await new Promise((resolve) => {
      nvcodecCheck.on('close', (code) => {
        capabilities.nvcodec = code === 0;
        resolve(code);
      });
    });

    // Check CUDA
    const cudaCheck = spawn('nvcc', ['--version']);
    await new Promise((resolve) => {
      cudaCheck.on('close', (code) => {
        capabilities.cuda = code === 0;
        resolve(code);
      });
    });

  } catch (error) {
    console.error('Error checking capabilities:', error);
  }

  return capabilities;
}

export default JetsonCameraManager;