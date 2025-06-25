import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHubSchema, insertCameraSchema, insertEventSchema, insertSpeakerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Hub routes
  app.get("/api/hubs", async (req, res) => {
    try {
      const hubs = await storage.getHubs();
      res.json(hubs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hubs" });
    }
  });

  app.get("/api/hubs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hub = await storage.getHub(id);
      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }
      res.json(hub);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hub" });
    }
  });

  app.post("/api/hubs", async (req, res) => {
    try {
      const validatedData = insertHubSchema.parse(req.body);
      const hub = await storage.createHub(validatedData);
      res.status(201).json(hub);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create hub" });
    }
  });

  app.patch("/api/hubs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hub = await storage.updateHub(id, req.body);
      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }
      res.json(hub);
    } catch (error) {
      res.status(500).json({ message: "Failed to update hub" });
    }
  });

  app.post("/api/hubs/:id/arm", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hub = await storage.updateHub(id, { systemArmed: true });
      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }
      
      // Create event for system armed
      await storage.createEvent({
        hubId: id,
        type: "system",
        severity: "low",
        title: "System Armed",
        description: `Security system armed for ${hub.name}`,
        acknowledged: false,
        metadata: { action: "arm", timestamp: new Date() }
      });
      
      res.json(hub);
    } catch (error) {
      res.status(500).json({ message: "Failed to arm system" });
    }
  });

  app.post("/api/hubs/:id/disarm", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hub = await storage.updateHub(id, { systemArmed: false });
      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }
      
      // Create event for system disarmed
      await storage.createEvent({
        hubId: id,
        type: "system",
        severity: "low",
        title: "System Disarmed",
        description: `Security system disarmed for ${hub.name}`,
        acknowledged: false,
        metadata: { action: "disarm", timestamp: new Date() }
      });
      
      res.json(hub);
    } catch (error) {
      res.status(500).json({ message: "Failed to disarm system" });
    }
  });

  // Camera routes
  app.get("/api/cameras", async (req, res) => {
    try {
      const hubId = req.query.hubId ? parseInt(req.query.hubId as string) : undefined;
      const cameras = hubId 
        ? await storage.getCamerasByHub(hubId)
        : await storage.getCameras();
      res.json(cameras);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cameras" });
    }
  });

  app.get("/api/cameras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const camera = await storage.getCamera(id);
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      res.json(camera);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch camera" });
    }
  });

  app.post("/api/cameras", async (req, res) => {
    try {
      const validatedData = insertCameraSchema.parse(req.body);
      const camera = await storage.createCamera(validatedData);
      res.status(201).json(camera);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create camera" });
    }
  });

  app.patch("/api/cameras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const camera = await storage.updateCamera(id, req.body);
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      res.json(camera);
    } catch (error) {
      res.status(500).json({ message: "Failed to update camera" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const hubId = req.query.hubId ? parseInt(req.query.hubId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      let events;
      if (hubId) {
        events = await storage.getEventsByHub(hubId);
      } else if (limit) {
        events = await storage.getRecentEvents(limit);
      } else {
        events = await storage.getEvents();
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id/acknowledge", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.acknowledgeEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to acknowledge event" });
    }
  });

  // Speaker routes
  app.get("/api/speakers", async (req, res) => {
    try {
      const hubId = req.query.hubId ? parseInt(req.query.hubId as string) : undefined;
      const speakers = hubId 
        ? await storage.getSpeakersByHub(hubId)
        : await storage.getSpeakers();
      res.json(speakers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch speakers" });
    }
  });

  app.patch("/api/speakers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const speaker = await storage.updateSpeaker(id, req.body);
      if (!speaker) {
        return res.status(404).json({ message: "Speaker not found" });
      }
      res.json(speaker);
    } catch (error) {
      res.status(500).json({ message: "Failed to update speaker" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
