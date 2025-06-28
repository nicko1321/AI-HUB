import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHubSchema, insertCameraSchema, insertEventSchema, insertSpeakerSchema, insertAITriggerSchema, insertWatchListSchema } from "@shared/schema";
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

  // Camera routes
  app.get("/api/cameras", async (req, res) => {
    try {
      const hubId = req.query.hubId ? parseInt(req.query.hubId as string) : undefined;
      if (hubId) {
        const cameras = await storage.getCamerasByHub(hubId);
        res.json(cameras);
      } else {
        const cameras = await storage.getCameras();
        res.json(cameras);
      }
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

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const hubId = req.query.hubId ? parseInt(req.query.hubId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (hubId) {
        const events = await storage.getEventsByHub(hubId);
        res.json(events.slice(0, limit));
      } else if (limit) {
        const events = await storage.getRecentEvents(limit);
        res.json(events);
      } else {
        const events = await storage.getEvents();
        res.json(events);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event" });
      }
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
      if (hubId) {
        const speakers = await storage.getSpeakersByHub(hubId);
        res.json(speakers);
      } else {
        const speakers = await storage.getSpeakers();
        res.json(speakers);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch speakers" });
    }
  });

  app.patch("/api/speakers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const speaker = await storage.updateSpeaker(id, updates);
      if (!speaker) {
        return res.status(404).json({ message: "Speaker not found" });
      }
      res.json(speaker);
    } catch (error) {
      res.status(500).json({ message: "Failed to update speaker" });
    }
  });

  // AI Trigger routes
  app.get("/api/ai-triggers", async (req, res) => {
    try {
      const triggers = await storage.getAITriggers();
      res.json(triggers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI triggers" });
    }
  });

  app.post("/api/ai-triggers", async (req, res) => {
    try {
      const triggerData = insertAITriggerSchema.parse(req.body);
      const trigger = await storage.createAITrigger(triggerData);
      res.status(201).json(trigger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid trigger data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create AI trigger" });
      }
    }
  });

  app.patch("/api/ai-triggers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const trigger = await storage.updateAITrigger(id, updates);
      if (!trigger) {
        return res.status(404).json({ message: "AI trigger not found" });
      }
      res.json(trigger);
    } catch (error) {
      res.status(500).json({ message: "Failed to update AI trigger" });
    }
  });

  app.delete("/api/ai-triggers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAITrigger(id);
      if (!success) {
        return res.status(404).json({ message: "AI trigger not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete AI trigger" });
    }
  });

  // Hub arm/disarm routes
  app.post("/api/hubs/:id/arm", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hub = await storage.getHub(id);
      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }
      
      const updatedHub = await storage.updateHub(id, { 
        systemArmed: true,
        lastHeartbeat: new Date()
      });
      
      res.json(updatedHub);
    } catch (error) {
      res.status(500).json({ message: "Failed to arm hub" });
    }
  });

  app.post("/api/hubs/:id/disarm", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hub = await storage.getHub(id);
      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }
      
      const updatedHub = await storage.updateHub(id, { 
        systemArmed: false,
        lastHeartbeat: new Date()
      });
      
      res.json(updatedHub);
    } catch (error) {
      res.status(500).json({ message: "Failed to disarm hub" });
    }
  });

  // Watch List routes
  app.get("/api/watchlist", async (req, res) => {
    try {
      const watchList = await storage.getWatchList();
      res.json(watchList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watch list" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const validatedData = insertWatchListSchema.parse(req.body);
      const newEntry = await storage.createWatchListEntry(validatedData);
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create watch list entry" });
      }
    }
  });

  app.put("/api/watchlist/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedEntry = await storage.updateWatchListEntry(id, updates);
      
      if (!updatedEntry) {
        res.status(404).json({ message: "Watch list entry not found" });
        return;
      }
      
      res.json(updatedEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update watch list entry" });
    }
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWatchListEntry(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Watch list entry not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete watch list entry" });
    }
  });

  app.post("/api/watchlist/check", async (req, res) => {
    try {
      const { licensePlate } = req.body;
      if (!licensePlate) {
        res.status(400).json({ message: "License plate is required" });
        return;
      }
      
      const match = await storage.checkLicensePlateWatch(licensePlate);
      res.json({ match });
    } catch (error) {
      res.status(500).json({ message: "Failed to check license plate" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}