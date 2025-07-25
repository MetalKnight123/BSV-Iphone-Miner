import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMiningStatsSchema, insertMiningActivitySchema, insertPoolSettingsSchema } from "@shared/schema";

interface MiningWebSocket extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server for mining connections
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track mining connections and intervals
  const miningConnections = new Set<MiningWebSocket>();
  let miningStatsInterval: NodeJS.Timeout;
  
  // API Routes
  app.get("/api/mining/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getMiningStats(userId);
      if (!stats) {
        return res.status(404).json({ message: "Mining stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mining stats" });
    }
  });

  app.post("/api/mining/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const validatedStats = insertMiningStatsSchema.parse({
        ...req.body,
        userId
      });
      const stats = await storage.updateMiningStats(userId, validatedStats);
      
      // Broadcast updated stats to connected clients
      broadcastMiningUpdate(stats);
      
      res.json(stats);
    } catch (error) {
      res.status(400).json({ message: "Invalid mining stats data" });
    }
  });

  app.get("/api/mining/activity/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getMiningActivity(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mining activity" });
    }
  });

  app.post("/api/mining/activity", async (req, res) => {
    try {
      const validatedActivity = insertMiningActivitySchema.parse(req.body);
      const activity = await storage.addMiningActivity(validatedActivity);
      
      // Broadcast new activity to connected clients
      broadcastActivityUpdate(activity);
      
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.get("/api/mining/pool-settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getPoolSettings(userId);
      if (!settings) {
        return res.status(404).json({ message: "Pool settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pool settings" });
    }
  });

  app.post("/api/mining/pool-settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const validatedSettings = insertPoolSettingsSchema.parse({
        ...req.body,
        userId
      });
      const settings = await storage.updatePoolSettings(userId, validatedSettings);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid pool settings data" });
    }
  });

  app.post("/api/mining/start/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Update pool settings to active
      await storage.updatePoolSettings(userId, { isActive: true });
      
      // Update connection status
      await storage.updateMiningStats(userId, { connectionStatus: "connected" });
      
      // Add activity log
      await storage.addMiningActivity({
        userId,
        activityType: "mining_started",
        message: "Mining started"
      });
      
      res.json({ message: "Mining started successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start mining" });
    }
  });

  app.post("/api/mining/stop/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Update pool settings to inactive
      await storage.updatePoolSettings(userId, { isActive: false });
      
      // Update connection status
      await storage.updateMiningStats(userId, { connectionStatus: "disconnected" });
      
      // Add activity log
      await storage.addMiningActivity({
        userId,
        activityType: "mining_stopped",
        message: "Mining stopped"
      });
      
      res.json({ message: "Mining stopped successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to stop mining" });
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws: MiningWebSocket, req) => {
    console.log('New mining WebSocket connection established');
    
    ws.isAlive = true;
    miningConnections.add(ws);
    
    // Handle authentication (simplified for demo)
    ws.userId = 1; // In production, extract from auth token
    
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'ping':
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'pong' }));
            }
            break;
            
          case 'update_stats':
            if (ws.userId && message.stats) {
              await storage.updateMiningStats(ws.userId, message.stats);
              broadcastMiningUpdate(message.stats);
            }
            break;
            
          case 'share_submitted':
            if (ws.userId) {
              const currentStats = await storage.getMiningStats(ws.userId);
              if (currentStats) {
                const updatedStats = await storage.updateMiningStats(ws.userId, {
                  sharesSubmitted: currentStats.sharesSubmitted + 1,
                  sharesAccepted: message.accepted ? currentStats.sharesAccepted + 1 : currentStats.sharesAccepted,
                  sharesRejected: message.accepted ? currentStats.sharesRejected : currentStats.sharesRejected + 1
                });
                
                await storage.addMiningActivity({
                  userId: ws.userId,
                  activityType: message.accepted ? "share_accepted" : "share_rejected",
                  message: message.accepted ? "Share accepted" : "Share rejected"
                });
                
                broadcastMiningUpdate(updatedStats);
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Mining WebSocket connection closed');
      miningConnections.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      miningConnections.delete(ws);
    });
  });

  // Heartbeat to detect broken connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: MiningWebSocket) => {
      if (!ws.isAlive) {
        miningConnections.delete(ws);
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Simulate mining data updates
  miningStatsInterval = setInterval(async () => {
    try {
      miningConnections.forEach(async (ws) => {
        if (ws.userId && ws.readyState === WebSocket.OPEN) {
          const currentStats = await storage.getMiningStats(ws.userId);
          if (currentStats) {
            // Simulate realistic mining variations
            const hashrateVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
            const newHashrate = Math.max(0, currentStats.hashrate + hashrateVariation);
            
            const updatedStats = await storage.updateMiningStats(ws.userId, {
              hashrate: Number(newHashrate.toFixed(2)),
              cpuUsage: Math.round(Math.min(100, Math.max(50, currentStats.cpuUsage + (Math.random() - 0.5) * 10))),
              temperature: Math.round(Math.min(90, Math.max(60, currentStats.temperature + (Math.random() - 0.5) * 5))),
              poolLatency: Math.round(Math.max(20, currentStats.poolLatency + (Math.random() - 0.5) * 20))
            });
            
            // Occasionally add share submissions
            if (Math.random() < 0.3) { // 30% chance
              const accepted = Math.random() > 0.02; // 98% acceptance rate
              const shareStats = await storage.updateMiningStats(ws.userId, {
                sharesSubmitted: updatedStats.sharesSubmitted + 1,
                sharesAccepted: accepted ? updatedStats.sharesAccepted + 1 : updatedStats.sharesAccepted,
                sharesRejected: accepted ? updatedStats.sharesRejected : updatedStats.sharesRejected + 1
              });
              
              await storage.addMiningActivity({
                userId: ws.userId,
                activityType: accepted ? "share_accepted" : "share_rejected",
                message: accepted ? "Share accepted" : "Share rejected"
              });
              
              broadcastMiningUpdate(shareStats);
            } else {
              broadcastMiningUpdate(updatedStats);
            }
          }
        }
      });
    } catch (error) {
      console.error('Mining stats update error:', error);
    }
  }, 3000); // Update every 3 seconds

  function broadcastMiningUpdate(stats: any) {
    const message = JSON.stringify({
      type: 'mining_stats_update',
      data: stats
    });
    
    miningConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  function broadcastActivityUpdate(activity: any) {
    const message = JSON.stringify({
      type: 'mining_activity_update',
      data: activity
    });
    
    miningConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Cleanup on server shutdown
  httpServer.on('close', () => {
    clearInterval(heartbeatInterval);
    clearInterval(miningStatsInterval);
  });

  return httpServer;
}
