import { 
  type Hub, type InsertHub,
  type Camera, type InsertCamera,
  type Event, type InsertEvent,
  type Speaker, type InsertSpeaker,
  type AITrigger, type InsertAITrigger
} from "@shared/schema";

// Simple in-memory data store
export const data = {
  hubs: new Map<number, Hub>(),
  cameras: new Map<number, Camera>(),
  events: new Map<number, Event>(),
  speakers: new Map<number, Speaker>(),
  aiTriggers: new Map<number, AITrigger>(),
  nextId: { hubs: 1, cameras: 1, events: 1, speakers: 1, aiTriggers: 1 }
};

// Initialize with sample data
function initializeSampleData() {
  // Create sample hubs
  const sampleHubs: Hub[] = [
    {
      id: 1,
      name: "Alert 360 AI Hub-01",
      location: "Main Building",
      serialNumber: "AO-HUB-001-2024",
      status: "online",
      systemArmed: true,
      lastHeartbeat: new Date(),
      configuration: { zones: 4, maxCameras: 16 }
    },
    {
      id: 2,
      name: "Alert 360 AI Hub-02",
      location: "Parking Lot",
      serialNumber: "AO-HUB-002-2024",
      status: "online",
      systemArmed: false,
      lastHeartbeat: new Date(),
      configuration: { zones: 2, maxCameras: 8 }
    },
    {
      id: 3,
      name: "Alert 360 AI Hub-03",
      location: "Perimeter",
      serialNumber: "AO-HUB-003-2024",
      status: "offline",
      systemArmed: false,
      lastHeartbeat: new Date(Date.now() - 30 * 60 * 1000),
      configuration: { zones: 3, maxCameras: 12 }
    }
  ];

  sampleHubs.forEach(hub => data.hubs.set(hub.id, hub));
  data.nextId.hubs = 4;

  // Create sample cameras
  const sampleCameras: Camera[] = [
    { 
      id: 1, hubId: 1, name: "Camera 01", location: "Entrance", ipAddress: "192.168.1.100", 
      status: "online", isRecording: true, streamUrl: "rtsp://admin:password@192.168.1.100:554/stream", 
      thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      protocol: "rtsp", port: 554, username: "admin", password: "password", streamPath: "/stream",
      onvifPort: 80, resolution: "1920x1080", fps: 30, codec: "H.264", ptzCapable: false,
      audioEnabled: true, nightVision: true, aiAnalyticsEnabled: true
    },
    { 
      id: 2, hubId: 1, name: "Camera 02", location: "Lobby", ipAddress: "192.168.1.101", 
      status: "online", isRecording: true, streamUrl: "rtsp://admin:password@192.168.1.101:554/stream", 
      thumbnailUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      protocol: "rtsp", port: 554, username: "admin", password: "password", streamPath: "/stream",
      onvifPort: 80, resolution: "1920x1080", fps: 30, codec: "H.264", ptzCapable: true,
      audioEnabled: false, nightVision: false, aiAnalyticsEnabled: true
    },
    { 
      id: 3, hubId: 1, name: "Camera 03", location: "Server Room", ipAddress: "192.168.1.102", 
      status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.102:554/stream", 
      thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      protocol: "rtsp", port: 554, username: null, password: null, streamPath: "/stream",
      onvifPort: 80, resolution: "1280x720", fps: 15, codec: "H.264", ptzCapable: false,
      audioEnabled: false, nightVision: true, aiAnalyticsEnabled: true
    },
    { 
      id: 4, hubId: 2, name: "Camera 04", location: "Parking Garage", ipAddress: "192.168.1.200", 
      status: "online", isRecording: true, streamUrl: "rtsp://user:pass123@192.168.1.200:554/cam1", 
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      protocol: "rtsp", port: 554, username: "user", password: "pass123", streamPath: "/cam1",
      onvifPort: 80, resolution: "1920x1080", fps: 25, codec: "H.265", ptzCapable: true,
      audioEnabled: true, nightVision: true, aiAnalyticsEnabled: true
    },
    { 
      id: 5, hubId: 2, name: "Camera 05", location: "Parking Exit", ipAddress: "192.168.1.201", 
      status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.201:8554/live", 
      thumbnailUrl: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      protocol: "rtsp", port: 8554, username: null, password: null, streamPath: "/live",
      onvifPort: 8080, resolution: "2560x1440", fps: 30, codec: "H.264", ptzCapable: false,
      audioEnabled: false, nightVision: true, aiAnalyticsEnabled: true
    },
    { 
      id: 6, hubId: 3, name: "Camera 06", location: "Perimeter North", ipAddress: "192.168.1.300", 
      status: "offline", isRecording: false, streamUrl: "rtsp://192.168.1.300:554/stream", 
      thumbnailUrl: null,
      protocol: "rtsp", port: 554, username: null, password: null, streamPath: "/stream",
      onvifPort: 80, resolution: "1920x1080", fps: 30, codec: "H.264", ptzCapable: false,
      audioEnabled: false, nightVision: false, aiAnalyticsEnabled: true
    },
  ];

  sampleCameras.forEach(camera => data.cameras.set(camera.id, camera));
  data.nextId.cameras = 7;

  // Create sample AI intelligence insights (no basic security events)
  const sampleEvents: Event[] = [
    { 
      id: 1, 
      hubId: 1, 
      cameraId: 2, 
      type: "behavioral_pattern_analysis", 
      severity: "medium", 
      title: "Behavioral Pattern Analysis Alert", 
      description: "Advanced AI behavioral analysis detected two individuals in business attire exhibiting normal social interaction patterns. Body language indicates professional conversation, with positive postural alignment and appropriate spatial positioning.", 
      timestamp: new Date(Date.now() - 2 * 60 * 1000), 
      acknowledged: false, 
      metadata: { 
        ai_analysis_type: "behavioral_pattern_recognition", 
        subject_count: 2, 
        interaction_category: "professional_conversation", 
        attire_classification: "business_formal", 
        detected_objects: ["briefcase", "ID badges"],
        behavior_risk_score: 12,
        social_dynamics: "collaborative",
        stress_indicators: "none_detected",
        ai_confidence: 94,
        processing_time_ms: 78
      },
      licensePlate: null,
      licensePlateThumbnail: null,
      licensePlateConfidence: null
    },
    { 
      id: 2, 
      hubId: 1, 
      cameraId: null, 
      type: "system", 
      severity: "low", 
      title: "System Armed", 
      description: "Security system armed by admin user", 
      timestamp: new Date(Date.now() - 15 * 60 * 1000), 
      acknowledged: true, 
      metadata: { user: "admin" },
      licensePlate: null,
      licensePlateThumbnail: null,
      licensePlateConfidence: null
    },
    { 
      id: 3, 
      hubId: 3, 
      cameraId: 6, 
      type: "connection", 
      severity: "high", 
      title: "Connection Lost", 
      description: "Camera connection lost", 
      timestamp: new Date(Date.now() - 60 * 60 * 1000), 
      acknowledged: false, 
      metadata: { lastPing: "2024-01-25T14:30:00Z" },
      licensePlate: null,
      licensePlateThumbnail: null,
      licensePlateConfidence: null
    },
    { 
      id: 4, 
      hubId: 2, 
      cameraId: 4, 
      type: "license_plate", 
      severity: "low", 
      title: "License Plate Detected", 
      description: "Vehicle license plate captured at parking garage entrance", 
      timestamp: new Date(Date.now() - 5 * 60 * 1000), 
      acknowledged: false, 
      metadata: { vehicle_type: "sedan", color: "blue", status: "normal" },
      licensePlate: "ABC-1234",
      licensePlateThumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
      licensePlateConfidence: 94
    },
    { 
      id: 5, 
      hubId: 2, 
      cameraId: 5, 
      type: "license_plate", 
      severity: "medium", 
      title: "Unknown Vehicle", 
      description: "Unrecognized license plate detected at parking exit", 
      timestamp: new Date(Date.now() - 20 * 60 * 1000), 
      acknowledged: false, 
      metadata: { vehicle_type: "truck", color: "white", status: "unknown" },
      licensePlate: "XYZ-9876",
      licensePlateThumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
      licensePlateConfidence: 89
    },
    { 
      id: 6, 
      hubId: 1, 
      cameraId: 1, 
      type: "blacklisted_vehicle", 
      severity: "high", 
      title: "Blacklisted Vehicle Alert", 
      description: "Vehicle on security watch list detected at main entrance", 
      timestamp: new Date(Date.now() - 45 * 60 * 1000), 
      acknowledged: false, 
      metadata: { vehicle_type: "suv", color: "black", blacklist_reason: "suspicious activity", watchlist_match: true },
      licensePlate: "DEF-5555",
      licensePlateThumbnail: "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
      licensePlateConfidence: 97
    },
    { 
      id: 7, 
      hubId: 1, 
      cameraId: 3, 
      type: "unauthorized_access", 
      severity: "high", 
      title: "Unauthorized Access Attempt", 
      description: "Person attempting to access server room multiple times with failed keycard swipes. Individual appears agitated, looking around frequently, and trying door handle repeatedly.", 
      timestamp: new Date(Date.now() - 8 * 60 * 1000), 
      acknowledged: false, 
      metadata: { 
        person_count: 1,
        activity: "unauthorized access attempt",
        keycard_attempts: 5,
        behavior_indicators: ["agitation", "repeated door attempts", "looking around"],
        duration_minutes: 3,
        threat_level: "high",
        confidence: 88
      },
      licensePlate: null,
      licensePlateThumbnail: null,
      licensePlateConfidence: null
    },
    { 
      id: 8, 
      hubId: 2, 
      cameraId: 4, 
      type: "weapon_detection", 
      severity: "critical", 
      title: "Weapon Detection Alert", 
      description: "Individual carrying what appears to be a firearm concealed under jacket. Person walking toward main building entrance with suspicious body language.", 
      timestamp: new Date(Date.now() - 12 * 60 * 1000), 
      acknowledged: false, 
      metadata: { 
        object_detected: "potential firearm",
        concealment_location: "under jacket",
        person_direction: "toward main entrance",
        threat_level: "critical",
        confidence: 94
      },
      licensePlate: null,
      licensePlateThumbnail: null,
      licensePlateConfidence: null
    },
    { 
      id: 9, 
      hubId: 1, 
      cameraId: 2, 
      type: "stolen_plate", 
      severity: "critical", 
      title: "Stolen Vehicle Alert", 
      description: "Vehicle with stolen license plate detected in lobby area. Plate reported stolen 3 days ago.", 
      timestamp: new Date(Date.now() - 3 * 60 * 1000), 
      acknowledged: false, 
      metadata: { 
        vehicle_type: "motorcycle",
        color: "red",
        status: "stolen",
        stolen_date: "2024-06-27",
        alert_level: "critical"
      },
      licensePlate: "STL-999",
      licensePlateThumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
      licensePlateConfidence: 96
    },
    { 
      id: 10, 
      hubId: 2, 
      cameraId: 5, 
      type: "person_detection", 
      severity: "medium", 
      title: "Person Detected", 
      description: "AI-powered person detection at parking exit - individual identified with 92% confidence", 
      timestamp: new Date(Date.now() - 1 * 60 * 1000), 
      acknowledged: false, 
      metadata: { 
        ai_confidence: 92,
        detection_method: "neural_network",
        person_attributes: {
          height: "average",
          clothing: "casual",
          posture: "normal"
        },
        behavior_analysis: "walking_normal_pace",
        threat_level: "none"
      },
      licensePlate: null,
      licensePlateThumbnail: null,
      licensePlateConfidence: null
    }
  ];

  sampleEvents.forEach(event => data.events.set(event.id, event));
  data.nextId.events = 11;

  // Create sample speakers
  const sampleSpeakers: Speaker[] = [
    { id: 1, hubId: 1, name: "Main Speaker", zone: "Zone 1", ipAddress: "192.168.1.150", status: "online", volume: 75, isActive: true },
    { id: 2, hubId: 2, name: "Parking Speaker", zone: "Zone 2", ipAddress: "192.168.1.250", status: "online", volume: 50, isActive: false },
  ];

  sampleSpeakers.forEach(speaker => data.speakers.set(speaker.id, speaker));
  data.nextId.speakers = 3;

  // Create sample AI triggers
  const sampleTriggers: AITrigger[] = [
    {
      id: 1,
      name: "Weapon Detection",
      description: "Detect weapons like guns, knives, or other dangerous objects",
      prompt: "Look for weapons such as guns, knives, or other dangerous objects. Alert if any person is carrying or holding a weapon.",
      severity: "critical",
      enabled: true,
      confidence: 85,
      hubIds: ["1", "2"],
      cameraIds: [],
      actions: ["email", "notification", "sms"],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: "Suspicious Behavior",
      description: "Detect loitering, running, or unusual movement patterns",
      prompt: "Look for suspicious behavior such as loitering near entrances, people running in non-emergency situations, or unusual movement patterns.",
      severity: "medium",
      enabled: true,
      confidence: 70,
      hubIds: ["1"],
      cameraIds: ["1", "2"],
      actions: ["notification"],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  sampleTriggers.forEach(trigger => data.aiTriggers.set(trigger.id, trigger));
  data.nextId.aiTriggers = 3;
}

// Initialize the data
initializeSampleData();