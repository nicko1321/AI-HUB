import { 
  type Hub, type InsertHub,
  type Camera, type InsertCamera,
  type Event, type InsertEvent,
  type Speaker, type InsertSpeaker,
  type AITrigger, type InsertAITrigger,
  type WatchListEntry, type InsertWatchListEntry
} from "@shared/schema";

// Simplified in-memory data store
class DataStore {
  public hubs: Map<number, Hub> = new Map();
  public cameras: Map<number, Camera> = new Map();
  public events: Map<number, Event> = new Map();
  public speakers: Map<number, Speaker> = new Map();
  public aiTriggers: Map<number, AITrigger> = new Map();
  public watchList: Map<number, WatchListEntry> = new Map();
  private currentId = { hubs: 1, cameras: 1, events: 1, speakers: 1, aiTriggers: 1, watchList: 1 };

  constructor() {
    this.hubs = new Map();
    this.cameras = new Map();
    this.events = new Map();
    this.speakers = new Map();
    this.aiTriggers = new Map();
    this.watchList = new Map();
    this.currentId = { hubs: 1, cameras: 1, events: 1, speakers: 1, aiTriggers: 1, watchList: 1 };
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample hubs
    const sampleHubs: Hub[] = [
      {
        id: 1,
        name: "Hub-01",
        location: "Main Building",
        serialNumber: "AO-HUB-001-2024",
        status: "online",
        systemArmed: true,
        lastHeartbeat: new Date(),
        configuration: { zones: 4, maxCameras: 16 }
      },
      {
        id: 2,
        name: "Hub-02",
        location: "Parking Lot",
        serialNumber: "AO-HUB-002-2024",
        status: "online",
        systemArmed: false,
        lastHeartbeat: new Date(),
        configuration: { zones: 2, maxCameras: 8 }
      },
      {
        id: 3,
        name: "Hub-03",
        location: "Perimeter",
        serialNumber: "AO-HUB-003-2024",
        status: "offline",
        systemArmed: false,
        lastHeartbeat: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        configuration: { zones: 3, maxCameras: 12 }
      }
    ];

    sampleHubs.forEach(hub => this.hubs.set(hub.id, hub));
    this.currentId.hubs = 4;

    // Create sample cameras
    const sampleCameras: Camera[] = [
      { id: 1, hubId: 1, name: "Camera 01", location: "Entrance", ipAddress: "192.168.1.100", status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.100/stream", thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: 2, hubId: 1, name: "Camera 02", location: "Lobby", ipAddress: "192.168.1.101", status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.101/stream", thumbnailUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: 3, hubId: 1, name: "Camera 03", location: "Server Room", ipAddress: "192.168.1.102", status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.102/stream", thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: 4, hubId: 2, name: "Camera 04", location: "Parking Garage", ipAddress: "192.168.1.200", status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.200/stream", thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: 5, hubId: 2, name: "Camera 05", location: "Parking Exit", ipAddress: "192.168.1.201", status: "online", isRecording: true, streamUrl: "rtsp://192.168.1.201/stream", thumbnailUrl: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: 6, hubId: 3, name: "Camera 06", location: "Perimeter North", ipAddress: "192.168.1.300", status: "offline", isRecording: false, streamUrl: "rtsp://192.168.1.300/stream", thumbnailUrl: null },
    ];

    sampleCameras.forEach(camera => this.cameras.set(camera.id, camera));
    this.currentId.cameras = 7;

    // Create sample events
    const sampleEvents: Event[] = [
      { 
        id: 1, 
        hubId: 1, 
        cameraId: 2, 
        type: "person_detection", 
        severity: "medium", 
        title: "Unauthorized Person Detected", 
        description: "Person detected in restricted area after hours", 
        timestamp: new Date(Date.now() - 2 * 60 * 1000), 
        acknowledged: false, 
        metadata: { 
          confidence: 0.92,
          person_count: 1,
          location: "restricted_zone",
          alert_reason: "after_hours_access"
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
        hubId: 1,
        cameraId: 1,
        type: "license_plate",
        severity: "medium",
        title: "License Plate Detected",
        description: "License plate ABC-1234 detected at main entrance",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        acknowledged: false,
        metadata: { vehicle_type: "sedan", color: "blue" },
        licensePlate: "ABC-1234",
        licensePlateThumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/2gA",
        licensePlateConfidence: 0.92
      },
      {
        id: 5,
        hubId: 2,
        cameraId: 4,
        type: "weapon_detection",
        severity: "critical",
        title: "Weapon Detected",
        description: "Potential weapon detected in main entrance area",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false,
        metadata: { 
          weapon_type: "handgun",
          confidence: 0.94,
          person_count: 1,
          alert_reason: "security_threat"
        },
        licensePlate: null,
        licensePlateThumbnail: null,
        licensePlateConfidence: null
      },
      {
        id: 6,
        hubId: 1,
        cameraId: 1,
        type: "license_plate",
        severity: "critical",
        title: "Watch List Vehicle Detected",
        description: "Vehicle on stolen watch list detected: ABC-1234",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        acknowledged: false,
        metadata: { 
          vehicle_type: "sedan",
          color: "black",
          alert_reason: "stolen_vehicle",
          case_number: "CASE-2024-001"
        },
        licensePlate: "ABC-1234",
        licensePlateThumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/2gA",
        licensePlateConfidence: 0.96
      },
      {
        id: 7,
        hubId: 3,
        cameraId: 5,
        type: "suspicious_behavior",
        severity: "high",
        title: "Loitering Detected",
        description: "Person loitering near emergency exit for extended period",
        timestamp: new Date(Date.now() - 75 * 60 * 1000),
        acknowledged: false,
        metadata: { 
          behavior_type: "loitering",
          duration_minutes: 15,
          location: "emergency_exit",
          person_count: 1,
          confidence: 0.89
        },
        licensePlate: null,
        licensePlateThumbnail: null,
        licensePlateConfidence: null
      }
    ];

    sampleEvents.forEach(event => this.events.set(event.id, event));
    this.currentId.events = 8;

    // Create sample speakers
    const sampleSpeakers: Speaker[] = [
      { id: 1, hubId: 1, name: "Main Speaker", zone: "Zone 1", ipAddress: "192.168.1.150", status: "online", volume: 75, isActive: true },
      { id: 2, hubId: 2, name: "Parking Speaker", zone: "Zone 2", ipAddress: "192.168.1.250", status: "online", volume: 50, isActive: false },
    ];

    sampleSpeakers.forEach(speaker => this.speakers.set(speaker.id, speaker));
    this.currentId.speakers = 3;

    // Create sample AI triggers
    const sampleTriggers: AITrigger[] = [
      {
        id: 1,
        name: "Weapon Detection",
        description: "Alert when weapons are detected in camera feeds",
        prompt: "Analyze this image for any weapons including guns, knives, or other dangerous objects. Alert if confidence is above 80%.",
        severity: "critical",
        enabled: true,
        confidence: 80,
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

    sampleTriggers.forEach(trigger => this.aiTriggers.set(trigger.id, trigger));
    this.currentId.aiTriggers = 3;

    // Create sample watch list entries
    const sampleWatchList: WatchListEntry[] = [
      {
        id: 1,
        licensePlate: "ABC-1234",
        reason: "stolen",
        description: "Black sedan reported stolen from downtown area",
        severity: "critical",
        addedBy: "Officer Johnson",
        isActive: true,
        vehicleDetails: JSON.stringify({
          make: "Honda",
          model: "Civic",
          year: "2020",
          color: "Black"
        }),
        caseNumber: "CASE-2024-001",
        contactInfo: "Detective Smith - ext. 4455",
        expiresAt: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        licensePlate: "XYZ-9876",
        reason: "suspect",
        description: "Vehicle of interest in armed robbery investigation",
        severity: "high",
        addedBy: "Detective Williams",
        isActive: true,
        vehicleDetails: JSON.stringify({
          make: "Ford",
          model: "F-150",
          year: "2019",
          color: "White"
        }),
        caseNumber: "CASE-2024-025",
        contactInfo: "Detective Williams - ext. 3322",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleWatchList.forEach(entry => this.watchList.set(entry.id, entry));
    this.currentId.watchList = 3;
  }

  // Hub operations
  async getHubs(): Promise<Hub[]> {
    return Array.from(this.hubs.values());
  }

  async getHub(id: number): Promise<Hub | undefined> {
    return this.hubs.get(id);
  }

  async createHub(hub: InsertHub): Promise<Hub> {
    const id = this.currentId.hubs++;
    const newHub: Hub = { 
      ...hub, 
      id, 
      status: hub.status || "offline",
      systemArmed: hub.systemArmed || false,
      lastHeartbeat: new Date(),
      configuration: hub.configuration || null
    };
    this.hubs.set(id, newHub);
    return newHub;
  }

  async updateHub(id: number, updates: Partial<Hub>): Promise<Hub | undefined> {
    const hub = this.hubs.get(id);
    if (!hub) return undefined;
    
    const updatedHub = { ...hub, ...updates };
    this.hubs.set(id, updatedHub);
    return updatedHub;
  }

  async deleteHub(id: number): Promise<boolean> {
    return this.hubs.delete(id);
  }

  // Camera operations
  async getCameras(): Promise<Camera[]> {
    return Array.from(this.cameras.values());
  }

  async getCamerasByHub(hubId: number): Promise<Camera[]> {
    return Array.from(this.cameras.values()).filter(camera => camera.hubId === hubId);
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    return this.cameras.get(id);
  }

  async createCamera(camera: InsertCamera): Promise<Camera> {
    const id = this.currentId.cameras++;
    const newCamera: Camera = { 
      ...camera, 
      id,
      status: camera.status || "offline",
      isRecording: camera.isRecording || false,
      streamUrl: camera.streamUrl || null,
      thumbnailUrl: camera.thumbnailUrl || null
    };
    this.cameras.set(id, newCamera);
    return newCamera;
  }

  async updateCamera(id: number, updates: Partial<Camera>): Promise<Camera | undefined> {
    const camera = this.cameras.get(id);
    if (!camera) return undefined;
    
    const updatedCamera = { ...camera, ...updates };
    this.cameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async deleteCamera(id: number): Promise<boolean> {
    return this.cameras.delete(id);
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getEventsByHub(hubId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.hubId === hubId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentEvents(limit: number = 10): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentId.events++;
    const newEvent: Event = { 
      id, 
      hubId: event.hubId,
      cameraId: event.cameraId ?? null,
      type: event.type,
      severity: event.severity,
      title: event.title,
      description: event.description ?? null,
      timestamp: new Date(),
      acknowledged: event.acknowledged ?? false,
      metadata: event.metadata ?? null,
      licensePlate: event.licensePlate ?? null,
      licensePlateThumbnail: event.licensePlateThumbnail ?? null,
      licensePlateConfidence: event.licensePlateConfidence ?? null
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async acknowledgeEvent(id: number): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, acknowledged: true };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Speaker operations
  async getSpeakers(): Promise<Speaker[]> {
    return Array.from(this.speakers.values());
  }

  async getSpeakersByHub(hubId: number): Promise<Speaker[]> {
    return Array.from(this.speakers.values()).filter(speaker => speaker.hubId === hubId);
  }

  async getSpeaker(id: number): Promise<Speaker | undefined> {
    return this.speakers.get(id);
  }

  async createSpeaker(speaker: InsertSpeaker): Promise<Speaker> {
    const id = this.currentId.speakers++;
    const newSpeaker: Speaker = { 
      ...speaker, 
      id,
      status: speaker.status || "offline",
      volume: speaker.volume || 50,
      isActive: speaker.isActive || false
    };
    this.speakers.set(id, newSpeaker);
    return newSpeaker;
  }

  async updateSpeaker(id: number, updates: Partial<Speaker>): Promise<Speaker | undefined> {
    const speaker = this.speakers.get(id);
    if (!speaker) return undefined;
    
    const updatedSpeaker = { ...speaker, ...updates };
    this.speakers.set(id, updatedSpeaker);
    return updatedSpeaker;
  }

  async deleteSpeaker(id: number): Promise<boolean> {
    return this.speakers.delete(id);
  }

  // AI Trigger operations
  async getAITriggers(): Promise<AITrigger[]> {
    return Array.from(this.aiTriggers.values());
  }

  async getAITrigger(id: number): Promise<AITrigger | undefined> {
    return this.aiTriggers.get(id);
  }

  async createAITrigger(trigger: InsertAITrigger): Promise<AITrigger> {
    const id = this.currentId.aiTriggers++;
    const newTrigger: AITrigger = {
      ...trigger,
      id,
      description: trigger.description || null,
      enabled: trigger.enabled ?? true,
      confidence: trigger.confidence ?? 70,
      hubIds: trigger.hubIds ?? null,
      cameraIds: trigger.cameraIds ?? null,
      actions: trigger.actions ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.aiTriggers.set(id, newTrigger);
    return newTrigger;
  }

  async updateAITrigger(id: number, updates: Partial<AITrigger>): Promise<AITrigger | undefined> {
    const trigger = this.aiTriggers.get(id);
    if (!trigger) return undefined;

    const updatedTrigger = { 
      ...trigger, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.aiTriggers.set(id, updatedTrigger);
    return updatedTrigger;
  }

  async deleteAITrigger(id: number): Promise<boolean> {
    return this.aiTriggers.delete(id);
  }

  // Watch List operations
  async getWatchList(): Promise<WatchListEntry[]> {
    return Array.from(this.watchList.values())
      .filter(entry => entry.isActive && (!entry.expiresAt || entry.expiresAt > new Date()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getWatchListEntry(id: number): Promise<WatchListEntry | undefined> {
    return this.watchList.get(id);
  }

  async createWatchListEntry(entry: InsertWatchListEntry): Promise<WatchListEntry> {
    const id = this.currentId.watchList++;
    const newEntry: WatchListEntry = {
      id,
      licensePlate: entry.licensePlate.toUpperCase(),
      reason: entry.reason,
      description: entry.description ?? null,
      severity: entry.severity ?? "medium",
      addedBy: entry.addedBy,
      isActive: entry.isActive ?? true,
      vehicleDetails: entry.vehicleDetails ?? null,
      caseNumber: entry.caseNumber ?? null,
      contactInfo: entry.contactInfo ?? null,
      expiresAt: entry.expiresAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.watchList.set(id, newEntry);
    return newEntry;
  }

  async updateWatchListEntry(id: number, updates: Partial<WatchListEntry>): Promise<WatchListEntry | undefined> {
    const entry = this.watchList.get(id);
    if (!entry) return undefined;

    const updatedEntry = { 
      ...entry, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.watchList.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteWatchListEntry(id: number): Promise<boolean> {
    return this.watchList.delete(id);
  }

  async checkLicensePlateWatch(licensePlate: string): Promise<WatchListEntry | null> {
    const normalizedPlate = licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    for (const entry of Array.from(this.watchList.values())) {
      if (!entry.isActive || (entry.expiresAt && entry.expiresAt < new Date())) {
        continue;
      }
      
      const entryPlate = entry.licensePlate.replace(/[^A-Z0-9]/g, '');
      if (entryPlate === normalizedPlate) {
        return entry;
      }
    }
    
    return null;
  }
}

export const storage = new DataStore();
