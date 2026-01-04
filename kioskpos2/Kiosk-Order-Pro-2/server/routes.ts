import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // --- Menu Routes ---
  app.get(api.menu.list.path, async (req, res) => {
    const items = await storage.getMenuItems();
    res.json(items);
  });

  app.post(api.menu.create.path, async (req, res) => {
    try {
      const input = api.menu.create.input.parse(req.body);
      const item = await storage.createMenuItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.menu.update.path, async (req, res) => {
    try {
      const input = api.menu.update.input.parse(req.body);
      const item = await storage.updateMenuItem(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
       res.status(400).json({ message: "Invalid update" });
    }
  });

  app.delete(api.menu.delete.path, async (req, res) => {
    await storage.deleteMenuItem(Number(req.params.id));
    res.sendStatus(204);
  });

  // --- Order Routes ---
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      
      // Calculate total if not provided correctly (trust backend calculation in real app)
      const orderData = {
        totalAmount: input.totalAmount,
        paymentMode: input.paymentMode,
        notes: input.notes,
      };

      const itemsData = input.items.map(item => ({
        menuItemId: item.menuItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        orderId: 0, // Placeholder, set in storage
      }));

      const order = await storage.createOrder(orderData, itemsData);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Settings Routes ---
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const updated = await storage.updateSettings(input);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Invalid settings" });
    }
  });

  return httpServer;
}

// Seed function to populate data if empty
async function seedDatabase() {
  const items = await storage.getMenuItems();
  if (items.length === 0) {
    console.log("Seeding database...");
    await storage.createMenuItem({ name: "Burger", price: 50, category: "Food" });
    await storage.createMenuItem({ name: "Tea", price: 10, category: "Drinks" });
    await storage.createMenuItem({ name: "Coffee", price: 20, category: "Drinks" });
    await storage.createMenuItem({ name: "Sandwich", price: 40, category: "Food" });
    
    // Default settings
    await storage.updateSettings({
      shopName: "Kiosk POS",
      chefNumber: "+919501614511" 
    });
  }
}

// Run seed strictly after DB connection is ready (handled by storage init usually, but here we call it safely)
setTimeout(seedDatabase, 1000);
