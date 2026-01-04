import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateOrderInput } from "@shared/routes";
import { insertMenuItemSchema, insertSettingsSchema } from "@shared/schema";
import type { InsertMenuItem, InsertAppSettings } from "@shared/schema";
import { localStorageManager } from "@/lib/storage";

// === MENU HOOKS ===
export function useMenu() {
  return useQuery({
    queryKey: [api.menu.list.path],
    queryFn: () => localStorageManager.getMenuItems(),
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      const validated = insertMenuItemSchema.parse(data);
      return localStorageManager.createMenuItem(validated);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.menu.list.path] }),
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertMenuItem>) => {
      return localStorageManager.updateMenuItem(id, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.menu.list.path] }),
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return localStorageManager.deleteMenuItem(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.menu.list.path] }),
  });
}

// === ORDER HOOKS ===
export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: () => localStorageManager.getOrders(),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const orderData = {
        totalAmount: data.totalAmount,
        paymentMode: data.paymentMode,
        notes: data.notes,
      };
      const itemsData = data.items.map(item => ({
        menuItemId: item.menuItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        orderId: 0,
      }));
      return localStorageManager.createOrder(orderData, itemsData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

// === SETTINGS HOOKS ===
export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: () => localStorageManager.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAppSettings) => {
      const validated = insertSettingsSchema.parse(data);
      return localStorageManager.updateSettings(validated);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.settings.get.path] }),
  });
}
