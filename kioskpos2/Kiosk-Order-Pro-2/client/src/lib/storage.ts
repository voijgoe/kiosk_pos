import { 
  type MenuItem, type InsertMenuItem, 
  type Order, type InsertOrder, 
  type OrderItem, type InsertOrderItem,
  type AppSettings, type InsertAppSettings
} from "@shared/schema";

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

// Browser-compatible LocalStorage implementation
export class LocalStorageManager implements IStorage {
  private prefix = "kiosk_pos_";

  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const data = localStorage.getItem(this.prefix + key);
    if (!data) return defaultValue;
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private set(key: string, value: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  async getMenuItems(): Promise<MenuItem[]> {
    const items = this.get<MenuItem[]>("menu_items", []);
    if (items.length === 0) {
      // Seed default items if empty
      const defaultItems: MenuItem[] = [
        { id: 1, name: "Burger", price: 50, category: "Food", available: true },
        { id: 2, name: "Tea", price: 10, category: "Drinks", available: true },
        { id: 3, name: "Coffee", price: 20, category: "Drinks", available: true },
        { id: 4, name: "Sandwich", price: 40, category: "Food", available: true },
      ];
      this.set("menu_items", defaultItems);
      return defaultItems;
    }
    return items;
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const items = await this.getMenuItems();
    return items.find(i => i.id === id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const items = await this.getMenuItems();
    const newItem: MenuItem = { ...item, id: Date.now(), available: item.available ?? true };
    this.set("menu_items", [...items, newItem]);
    return newItem;
  }

  async updateMenuItem(id: number, updates: Partial<InsertMenuItem>): Promise<MenuItem> {
    const items = await this.getMenuItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Item not found");
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    this.set("menu_items", items);
    return updated;
  }

  async deleteMenuItem(id: number): Promise<void> {
    const items = await this.getMenuItems();
    this.set("menu_items", items.filter(i => i.id !== id));
  }

  async getOrders(): Promise<(Order & { items: OrderItem[] })[]> {
    const orders = this.get<Order[]>("orders", []);
    const allItems = this.get<OrderItem[]>("order_items", []);
    return orders.map(order => ({
      ...order,
      items: allItems.filter(item => item.orderId === order.id)
    })).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order & { items: OrderItem[] }> {
    const orders = this.get<Order[]>("orders", []);
    const orderItemsList = this.get<OrderItem[]>("order_items", []);
    
    const newOrder: Order = { 
      ...order, 
      id: Date.now(), 
      createdAt: new Date() 
    };
    
    const newItems: OrderItem[] = items.map(item => ({
      ...item,
      id: Math.floor(Math.random() * 1000000),
      orderId: newOrder.id
    }));

    this.set("orders", [...orders, newOrder]);
    this.set("order_items", [...orderItemsList, ...newItems]);

    return { ...newOrder, items: newItems };
  }

  async getSettings(): Promise<AppSettings> {
    const defaults: AppSettings = {
      id: 1,
      shopName: "Kiosk POS",
      chefNumber: "+919501614511",
      address: ""
    };
    return this.get<AppSettings>("settings", defaults);
  }

  async updateSettings(settings: InsertAppSettings): Promise<AppSettings> {
    const updated = { ...settings, id: 1 };
    this.set("settings", updated);
    return updated;
  }
}

export const localStorageManager = new LocalStorageManager();
