import { hubs, cameras, events, speakers } from "./shared/schema.js";

// Simple initialization for demo
const sampleHubs = [
  { name: "Hub-01", location: "Main Building", serialNumber: "AO-HUB-001-2024", status: "online", systemArmed: true, lastHeartbeat: new Date(), configuration: { zones: 4, maxCameras: 16 } },
  { name: "Hub-02", location: "Parking Lot", serialNumber: "AO-HUB-002-2024", status: "online", systemArmed: false, lastHeartbeat: new Date(), configuration: { zones: 2, maxCameras: 8 } }
];

const sampleCameras = [
  { hubId: 1, name: "Front Entrance", location: "Main Lobby", ipAddress: "192.168.1.101", status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.101:554/stream1", thumbnailUrl: "https://via.placeholder.com/320x240/333/fff?text=Front+Entrance", protocol: "RTSP", port: 554, username: "admin", password: "password123", onvifPath: "/onvif/device_service", manufacturer: "Hikvision", model: "DS-2CD2385FWD-I", resolution: "3840x2160", nightVision: true, ptzCapable: true, motionDetection: true },
  { hubId: 1, name: "Parking Overview", location: "North Parking", ipAddress: "192.168.1.102", status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.102:554/stream1", thumbnailUrl: "https://via.placeholder.com/320x240/333/fff?text=Parking+Overview", protocol: "RTSP", port: 554, username: "admin", password: "password123", onvifPath: "/onvif/device_service", manufacturer: "Dahua", model: "IPC-HFW4431R-Z", resolution: "2688x1520", nightVision: true, ptzCapable: false, motionDetection: true }
];

console.log("Sample data prepared");
