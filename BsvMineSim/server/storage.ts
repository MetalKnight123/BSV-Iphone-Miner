import { users, miningStats, miningActivity, poolSettings, type User, type InsertUser, type MiningStats, type InsertMiningStats, type MiningActivity, type InsertMiningActivity, type PoolSettings, type InsertPoolSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getMiningStats(userId: number): Promise<MiningStats | undefined>;
  updateMiningStats(userId: number, stats: Partial<InsertMiningStats>): Promise<MiningStats>;
  
  getMiningActivity(userId: number, limit?: number): Promise<MiningActivity[]>;
  addMiningActivity(activity: InsertMiningActivity): Promise<MiningActivity>;
  
  getPoolSettings(userId: number): Promise<PoolSettings | undefined>;
  updatePoolSettings(userId: number, settings: Partial<InsertPoolSettings>): Promise<PoolSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private miningStats: Map<number, MiningStats>;
  private miningActivity: Map<number, MiningActivity[]>;
  private poolSettings: Map<number, PoolSettings>;
  currentId: number;
  currentStatsId: number;
  currentActivityId: number;
  currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.miningStats = new Map();
    this.miningActivity = new Map();
    this.poolSettings = new Map();
    this.currentId = 1;
    this.currentStatsId = 1;
    this.currentActivityId = 1;
    this.currentSettingsId = 1;
    
    // Initialize default user and mining data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "miner1",
      password: "password123"
    };
    this.users.set(1, defaultUser);
    this.currentId = 2;

    // Create default mining stats
    const defaultStats: MiningStats = {
      id: 1,
      userId: 1,
      hashrate: 2.34,
      sharesSubmitted: 1247,
      sharesAccepted: 1231,
      sharesRejected: 16,
      bsvBalance: 0.00234567,
      earningsToday: 0.00045621,
      networkDifficulty: "423.8T",
      poolLatency: 45,
      cpuUsage: 67,
      temperature: 72,
      activeWorkers: 4,
      connectionStatus: "connected",
      timestamp: new Date()
    };
    this.miningStats.set(1, defaultStats);

    // Create default pool settings
    const defaultPoolSettings: PoolSettings = {
      id: 1,
      userId: 1,
      poolUrl: "pool.bsvmining.com:4334",
      workerName: "worker1",
      workerPassword: "x",
      bsvAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      miningIntensity: "high",
      cpuThreads: 4,
      isActive: true
    };
    this.poolSettings.set(1, defaultPoolSettings);

    // Create default mining activity
    const defaultActivity: MiningActivity[] = [
      {
        id: 1,
        userId: 1,
        activityType: "share_accepted",
        message: "Share accepted",
        timestamp: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
      },
      {
        id: 2,
        userId: 1,
        activityType: "share_accepted",
        message: "Share accepted",
        timestamp: new Date(Date.now() - 1000 * 60 * 3) // 3 minutes ago
      },
      {
        id: 3,
        userId: 1,
        activityType: "pool_connected",
        message: "Pool reconnected",
        timestamp: new Date(Date.now() - 1000 * 60 * 4) // 4 minutes ago
      }
    ];
    this.miningActivity.set(1, defaultActivity);
    this.currentActivityId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMiningStats(userId: number): Promise<MiningStats | undefined> {
    return this.miningStats.get(userId);
  }

  async updateMiningStats(userId: number, stats: Partial<InsertMiningStats>): Promise<MiningStats> {
    const existing = this.miningStats.get(userId);
    const updated: MiningStats = {
      id: existing?.id || this.currentStatsId++,
      userId,
      hashrate: stats.hashrate ?? existing?.hashrate ?? 0,
      sharesSubmitted: stats.sharesSubmitted ?? existing?.sharesSubmitted ?? 0,
      sharesAccepted: stats.sharesAccepted ?? existing?.sharesAccepted ?? 0,
      sharesRejected: stats.sharesRejected ?? existing?.sharesRejected ?? 0,
      bsvBalance: stats.bsvBalance ?? existing?.bsvBalance ?? 0,
      earningsToday: stats.earningsToday ?? existing?.earningsToday ?? 0,
      networkDifficulty: stats.networkDifficulty ?? existing?.networkDifficulty ?? "0",
      poolLatency: stats.poolLatency ?? existing?.poolLatency ?? 0,
      cpuUsage: stats.cpuUsage ?? existing?.cpuUsage ?? 0,
      temperature: stats.temperature ?? existing?.temperature ?? 0,
      activeWorkers: stats.activeWorkers ?? existing?.activeWorkers ?? 0,
      connectionStatus: stats.connectionStatus ?? existing?.connectionStatus ?? "disconnected",
      timestamp: new Date()
    };
    this.miningStats.set(userId, updated);
    return updated;
  }

  async getMiningActivity(userId: number, limit: number = 10): Promise<MiningActivity[]> {
    const activities = this.miningActivity.get(userId) || [];
    return activities.slice(0, limit).sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  async addMiningActivity(activity: InsertMiningActivity): Promise<MiningActivity> {
    const newActivity: MiningActivity = {
      id: this.currentActivityId++,
      ...activity,
      timestamp: new Date()
    };
    
    const existing = this.miningActivity.get(activity.userId) || [];
    existing.unshift(newActivity);
    // Keep only last 50 activities
    if (existing.length > 50) {
      existing.splice(50);
    }
    this.miningActivity.set(activity.userId, existing);
    
    return newActivity;
  }

  async getPoolSettings(userId: number): Promise<PoolSettings | undefined> {
    return this.poolSettings.get(userId);
  }

  async updatePoolSettings(userId: number, settings: Partial<InsertPoolSettings>): Promise<PoolSettings> {
    const existing = this.poolSettings.get(userId);
    const updated: PoolSettings = {
      id: existing?.id || this.currentSettingsId++,
      userId,
      poolUrl: settings.poolUrl ?? existing?.poolUrl ?? "pool.bsvmining.com:4334",
      workerName: settings.workerName ?? existing?.workerName ?? "worker1",
      workerPassword: settings.workerPassword ?? existing?.workerPassword ?? "x",
      bsvAddress: settings.bsvAddress ?? existing?.bsvAddress ?? "",
      miningIntensity: settings.miningIntensity ?? existing?.miningIntensity ?? "high",
      cpuThreads: settings.cpuThreads ?? existing?.cpuThreads ?? 4,
      isActive: settings.isActive ?? existing?.isActive ?? false
    };
    this.poolSettings.set(userId, updated);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getMiningStats(userId: number): Promise<MiningStats | undefined> {
    const [stats] = await db.select().from(miningStats).where(eq(miningStats.userId, userId));
    return stats || undefined;
  }

  async updateMiningStats(userId: number, stats: Partial<InsertMiningStats>): Promise<MiningStats> {
    // Check if stats exist for this user
    const existing = await this.getMiningStats(userId);
    
    if (existing) {
      // Update existing record
      const updateData: Partial<InsertMiningStats & { timestamp: Date }> = {
        timestamp: new Date()
      };
      
      // Ensure all numeric fields are properly typed
      if (stats.hashrate !== undefined) updateData.hashrate = Number(stats.hashrate);
      if (stats.sharesSubmitted !== undefined) updateData.sharesSubmitted = Math.round(Number(stats.sharesSubmitted));
      if (stats.sharesAccepted !== undefined) updateData.sharesAccepted = Math.round(Number(stats.sharesAccepted));
      if (stats.sharesRejected !== undefined) updateData.sharesRejected = Math.round(Number(stats.sharesRejected));
      if (stats.bsvBalance !== undefined) updateData.bsvBalance = Number(stats.bsvBalance);
      if (stats.earningsToday !== undefined) updateData.earningsToday = Number(stats.earningsToday);
      if (stats.poolLatency !== undefined) updateData.poolLatency = Math.round(Number(stats.poolLatency));
      if (stats.cpuUsage !== undefined) updateData.cpuUsage = Math.round(Number(stats.cpuUsage));
      if (stats.temperature !== undefined) updateData.temperature = Math.round(Number(stats.temperature));
      if (stats.activeWorkers !== undefined) updateData.activeWorkers = Math.round(Number(stats.activeWorkers));
      if (stats.networkDifficulty !== undefined) updateData.networkDifficulty = String(stats.networkDifficulty);
      if (stats.connectionStatus !== undefined) updateData.connectionStatus = String(stats.connectionStatus);
      
      const [updated] = await db
        .update(miningStats)
        .set(updateData)
        .where(eq(miningStats.userId, userId))
        .returning();
      return updated;
    } else {
      // Insert new record
      const [created] = await db
        .insert(miningStats)
        .values({
          userId,
          hashrate: Number(stats.hashrate ?? 0),
          sharesSubmitted: Math.round(Number(stats.sharesSubmitted ?? 0)),
          sharesAccepted: Math.round(Number(stats.sharesAccepted ?? 0)),
          sharesRejected: Math.round(Number(stats.sharesRejected ?? 0)),
          bsvBalance: Number(stats.bsvBalance ?? 0),
          earningsToday: Number(stats.earningsToday ?? 0),
          networkDifficulty: String(stats.networkDifficulty ?? "0"),
          poolLatency: Math.round(Number(stats.poolLatency ?? 0)),
          cpuUsage: Math.round(Number(stats.cpuUsage ?? 0)),
          temperature: Math.round(Number(stats.temperature ?? 0)),
          activeWorkers: Math.round(Number(stats.activeWorkers ?? 0)),
          connectionStatus: String(stats.connectionStatus ?? "disconnected"),
          timestamp: new Date()
        })
        .returning();
      return created;
    }
  }

  async getMiningActivity(userId: number, limit: number = 10): Promise<MiningActivity[]> {
    const activities = await db
      .select()
      .from(miningActivity)
      .where(eq(miningActivity.userId, userId))
      .orderBy(desc(miningActivity.timestamp))
      .limit(limit);
    return activities;
  }

  async addMiningActivity(activity: InsertMiningActivity): Promise<MiningActivity> {
    const [newActivity] = await db
      .insert(miningActivity)
      .values({
        ...activity,
        timestamp: new Date()
      })
      .returning();
    return newActivity;
  }

  async getPoolSettings(userId: number): Promise<PoolSettings | undefined> {
    const [settings] = await db.select().from(poolSettings).where(eq(poolSettings.userId, userId));
    return settings || undefined;
  }

  async updatePoolSettings(userId: number, settings: Partial<InsertPoolSettings>): Promise<PoolSettings> {
    // Check if settings exist for this user
    const existing = await this.getPoolSettings(userId);
    
    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(poolSettings)
        .set(settings)
        .where(eq(poolSettings.userId, userId))
        .returning();
      return updated;
    } else {
      // Insert new record
      const [created] = await db
        .insert(poolSettings)
        .values({
          userId,
          poolUrl: String(settings.poolUrl ?? "pool.bsvmining.com:4334"),
          workerName: String(settings.workerName ?? "worker1"),
          workerPassword: String(settings.workerPassword ?? "x"),
          bsvAddress: String(settings.bsvAddress ?? ""),
          miningIntensity: String(settings.miningIntensity ?? "high"),
          cpuThreads: Math.round(Number(settings.cpuThreads ?? 4)),
          isActive: Boolean(settings.isActive ?? false)
        })
        .returning();
      return created;
    }
  }
}

// Initialize database storage with seed data
async function initializeDatabase() {
  const dbStorage = new DatabaseStorage();
  
  try {
    // Check if default user exists
    let defaultUser = await dbStorage.getUser(1);
    
    if (!defaultUser) {
      // Create default user
      defaultUser = await dbStorage.createUser({
        username: "miner1",
        password: "password123"
      });
      
      // Create default mining stats
      await dbStorage.updateMiningStats(defaultUser.id, {
        hashrate: 2.34,
        sharesSubmitted: 1247,
        sharesAccepted: 1231,
        sharesRejected: 16,
        bsvBalance: 0.00234567,
        earningsToday: 0.00045621,
        networkDifficulty: "423.8T",
        poolLatency: 45,
        cpuUsage: 67,
        temperature: 72,
        activeWorkers: 4,
        connectionStatus: "connected"
      });
      
      // Create default pool settings
      await dbStorage.updatePoolSettings(defaultUser.id, {
        poolUrl: "pool.bsvmining.com:4334",
        workerName: "worker1",
        workerPassword: "x",
        bsvAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        miningIntensity: "high",
        cpuThreads: 4,
        isActive: true
      });
      
      // Create some initial activity
      const activities = [
        { activityType: "share_accepted", message: "Share accepted" },
        { activityType: "share_accepted", message: "Share accepted" },
        { activityType: "pool_connected", message: "Pool reconnected" }
      ];
      
      for (const activity of activities) {
        await dbStorage.addMiningActivity({
          userId: defaultUser.id,
          ...activity
        });
      }
      
      console.log('Database initialized with default data');
    }
    
    return dbStorage;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export const storage = await initializeDatabase();
