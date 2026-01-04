import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Menu Items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  category: text("category").default("General"),
  available: boolean("available").default(true),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  totalAmount: real("total_amount").notNull(),
  paymentMode: text("payment_mode").notNull(), // Cash, UPI, Card
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order Items (Line items)
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id"), // Optional link to source item
  itemName: text("item_name").notNull(), // Snapshot of name
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(), // Snapshot of price
});

// App Settings (Shop Name, Chef Number)
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  shopName: text("shop_name").notNull().default("Kiosk POS System"),
  chefNumber: text("chef_number").notNull().default(""), // Format: +919999999999
  address: text("address"),
});

// Schemas
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

// Types
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type AppSettings = typeof settings.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertSettingsSchema>;

import { boolean } from "drizzle-orm/pg-core";
