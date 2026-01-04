import { db } from "./db";
import { 
  menuItems, orders, orderItems, settings,
  type MenuItem, type InsertMenuItem, 
  type Order, type InsertOrder, 
  type OrderItem, type InsertOrderItem,
  type AppSettings, type InsertAppSettings
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Menu
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<(Order & { items: OrderItem[] })[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order & { items: OrderItem[] }>;

  // Settings
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: InsertAppSettings): Promise<AppSettings>;
}

export class DatabaseStorage implements IStorage {
  // Menu
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems).orderBy(menuItems.name);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updated] = await db.update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Orders
  async getOrders(): Promise<(Order & { items: OrderItem[] })[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    
    // Fetch items for each order (could be optimized with join)
    const ordersWithItems = await Promise.all(allOrders.map(async (order) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    }));
    
    return ordersWithItems;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order & { items: OrderItem[] }> {
    // Transaction ideally
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    const itemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));

    if (itemsWithOrderId.length > 0) {
      await db.insert(orderItems).values(itemsWithOrderId);
    }
    
    const insertedItems = await db.select().from(orderItems).where(eq(orderItems.orderId, newOrder.id));
    return { ...newOrder, items: insertedItems };
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    const [current] = await db.select().from(settings).limit(1);
    if (!current) {
      // Create default if not exists
      const [defaults] = await db.insert(settings).values({
        shopName: "Kiosk POS",
        chefNumber: "",
      }).returning();
      return defaults;
    }
    return current;
  }

  async updateSettings(newSettings: InsertAppSettings): Promise<AppSettings> {
    const current = await this.getSettings();
    const [updated] = await db.update(settings)
      .set(newSettings)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
