import { db } from "./db";
import { hubs, cameras, events, speakers, aiTriggers, watchList } from "@shared/schema";

export async function initializeDatabaseWithSampleData() {
  try {
    // Check if data already exists
    const existingHubs = await db.select().from(hubs).limit(1);
    if (existingHubs.length > 0) {
      console.log("Database already contains data, skipping initialization");
      return;
    }

    console.log("Initializing database with sample data...");

    // Create sample hubs
    const [hub1, hub2] = await db.insert(hubs).values([
      {
        name: "Hub-01",
        location: "Main Building",
        serialNumber: "AO-HUB-001-2024",
        status: "online",
        systemArmed: true,
        lastHeartbeat: new Date(),
        configuration: { zones: 4, maxCameras: 16 }
      },
      {
        name: "Hub-02", 
        location: "Parking Lot",
        serialNumber: "AO-HUB-002-2024",
        status: "online",
        systemArmed: false,
        lastHeartbeat: new Date(),
        configuration: { zones: 2, maxCameras: 8 }
      }
    ]).returning();

    // Create sample cameras
    await db.insert(cameras).values([
      {
        hubId: hub1.id,
        name: "Front Entrance",
        location: "Main Lobby",
        ipAddress: "192.168.1.101",
        status: "online",
        isRecording: true,
        streamUrl: "rtsp://192.168.1.101:554/stream1",
        thumbnailUrl: "https://via.placeholder.com/320x240/333/fff?text=Front+Entrance",
        protocol: "RTSP",
        port: 554,
        username: "admin",
        password: "password123",
        onvifPath: "/onvif/device_service",
        manufacturer: "Hikvision",
        model: "DS-2CD2385FWD-I",
        resolution: "3840x2160",
        nightVision: true,
        ptzCapable: true,
        motionDetection: true
      },
      {
        hubId: hub1.id,
        name: "Parking Overview",
        location: "North Parking",
        ipAddress: "192.168.1.102", 
        status: "online",
        isRecording: true,
        streamUrl: "rtsp://192.168.1.102:554/stream1",
        thumbnailUrl: "https://via.placeholder.com/320x240/333/fff?text=Parking+Overview",
        protocol: "RTSP",
        port: 554,
        username: "admin",
        password: "password123",
        onvifPath: "/onvif/device_service",
        manufacturer: "Dahua",
        model: "IPC-HFW4431R-Z",
        resolution: "2688x1520",
        nightVision: true,
        ptzCapable: false,
        motionDetection: true
      },
      {
        hubId: hub2.id,
        name: "Loading Dock",
        location: "Rear Building",
        ipAddress: "192.168.1.103",
        status: "online",
        isRecording: true,
        streamUrl: "rtsp://192.168.1.103:554/stream1",
        thumbnailUrl: "https://via.placeholder.com/320x240/333/fff?text=Loading+Dock",
        protocol: "RTSP",
        port: 554,
        username: "admin",
        password: "password123",
        onvifPath: "/onvif/device_service",
        manufacturer: "Axis",
        model: "P3245-LVE",
        resolution: "1920x1080",
        nightVision: true,
        ptzCapable: true,
        motionDetection: true
      }
    ]);

    // Create sample speakers
    await db.insert(speakers).values([
      {
        hubId: hub1.id,
        name: "Main Lobby Speaker",
        location: "Reception Area",
        ipAddress: "192.168.1.201",
        status: "online",
        volume: 75,
        isActive: false
      },
      {
        hubId: hub2.id,
        name: "Parking Speaker",
        location: "Parking Lot",
        ipAddress: "192.168.1.202",
        status: "online",
        volume: 50,
        isActive: false
      }
    ]);

    // Create sample events
    await db.insert(events).values([
      {
        hubId: hub1.id,
        cameraId: 1,
        type: "motion_detected",
        severity: "low",
        title: "Motion Detected",
        description: "Motion detected in main lobby area",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        acknowledged: false,
        metadata: { zone: "lobby", confidence: 0.95 }
      },
      {
        hubId: hub1.id,
        cameraId: 2,
        type: "license_plate_detected", 
        severity: "medium",
        title: "Vehicle Detected",
        description: "License plate ABC-123 detected",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        acknowledged: false,
        licensePlate: "ABC-123",
        licensePlateConfidence: 0.92,
        metadata: { vehicleType: "sedan", color: "blue" }
      }
    ]);

    // Create sample AI triggers
    await db.insert(aiTriggers).values([
      {
        name: "Weapon Detection",
        description: "Detect weapons in camera feeds",
        prompt: "Detect any visible weapons, firearms, knives, or dangerous objects",
        severity: "critical",
        enabled: true,
        hubIds: [hub1.id, hub2.id],
        cameraIds: [1, 2, 3],
        confidence: 0.8,
        actions: ["alert", "record", "notify_security"]
      },
      {
        name: "Unauthorized Access",
        description: "Detect unauthorized personnel in restricted areas",
        prompt: "Identify people in restricted or secure areas during off-hours",
        severity: "high",
        enabled: true,
        hubIds: [hub1.id],
        cameraIds: [1],
        confidence: 0.7,
        actions: ["alert", "record"]
      }
    ]);

    console.log("Database initialized with sample data successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}