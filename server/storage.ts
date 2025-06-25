import { 
  hubs, cameras, events, speakers,
  type Hub, type InsertHub,
  type Camera, type InsertCamera,
  type Event, type InsertEvent,
  type Speaker, type InsertSpeaker
} from "@shared/schema";

export interface IStorage {
  // Hub operations
  getHubs(): Promise<Hub[]>;
  getHub(id: number): Promise<Hub | undefined>;
  createHub(hub: InsertHub): Promise<Hub>;
  updateHub(id: number, updates: Partial<Hub>): Promise<Hub | undefined>;
  deleteHub(id: number): Promise<boolean>;

  // Camera operations
  getCameras(): Promise<Camera[]>;
  getCamerasByHub(hubId: number): Promise<Camera[]>;
  getCamera(id: number): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, updates: Partial<Camera>): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEventsByHub(hubId: number): Promise<Event[]>;
  getRecentEvents(limit?: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  acknowledgeEvent(id: number): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Speaker operations
  getSpeakers(): Promise<Speaker[]>;
  getSpeakersByHub(hubId: number): Promise<Speaker[]>;
  getSpeaker(id: number): Promise<Speaker | undefined>;
  createSpeaker(speaker: InsertSpeaker): Promise<Speaker>;
  updateSpeaker(id: number, updates: Partial<Speaker>): Promise<Speaker | undefined>;
  deleteSpeaker(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private hubs: Map<number, Hub>;
  private cameras: Map<number, Camera>;
  private events: Map<number, Event>;
  private speakers: Map<number, Speaker>;
  private currentId: { hubs: number; cameras: number; events: number; speakers: number };

  constructor() {
    this.hubs = new Map();
    this.cameras = new Map();
    this.events = new Map();
    this.speakers = new Map();
    this.currentId = { hubs: 1, cameras: 1, events: 1, speakers: 1 };
    
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
        ipAddress: "192.168.1.10",
        status: "online",
        systemArmed: true,
        lastHeartbeat: new Date(),
        configuration: { zones: 4, maxCameras: 16 }
      },
      {
        id: 2,
        name: "Hub-02",
        location: "Parking Lot",
        ipAddress: "192.168.1.11",
        status: "online",
        systemArmed: false,
        lastHeartbeat: new Date(),
        configuration: { zones: 2, maxCameras: 8 }
      },
      {
        id: 3,
        name: "Hub-03",
        location: "Perimeter",
        ipAddress: "192.168.1.12",
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
      { id: 1, hubId: 1, cameraId: 2, type: "motion", severity: "medium", title: "Motion Detected", description: "Motion detected in lobby area", timestamp: new Date(Date.now() - 2 * 60 * 1000), acknowledged: false, metadata: { confidence: 0.85 } },
      { id: 2, hubId: 1, cameraId: null, type: "system", severity: "low", title: "System Armed", description: "Security system armed by admin user", timestamp: new Date(Date.now() - 15 * 60 * 1000), acknowledged: true, metadata: { user: "admin" } },
      { id: 3, hubId: 3, cameraId: 6, type: "connection", severity: "high", title: "Connection Lost", description: "Camera connection lost", timestamp: new Date(Date.now() - 60 * 60 * 1000), acknowledged: false, metadata: { lastPing: "2024-01-25T14:30:00Z" } },
    ];

    sampleEvents.forEach(event => this.events.set(event.id, event));
    this.currentId.events = 4;

    // Create sample speakers
    const sampleSpeakers: Speaker[] = [
      { id: 1, hubId: 1, name: "Main Speaker", zone: "Zone 1", ipAddress: "192.168.1.150", status: "online", volume: 75, isActive: true },
      { id: 2, hubId: 2, name: "Parking Speaker", zone: "Zone 2", ipAddress: "192.168.1.250", status: "online", volume: 50, isActive: false },
    ];

    sampleSpeakers.forEach(speaker => this.speakers.set(speaker.id, speaker));
    this.currentId.speakers = 3;
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
      ...event, 
      id, 
      timestamp: new Date(),
      cameraId: event.cameraId || null,
      description: event.description || null,
      acknowledged: event.acknowledged || false,
      metadata: event.metadata || null
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
}

export const storage = new MemStorage();
