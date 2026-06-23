// SERVER ONLY. Admin inventory reads (Task 4.1). RLS "Admin full access
// inventory / stock_movements" gates these. Returns null/[]/empty gracefully.

import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

export type InventoryRow = Database['public']['Tables']['inventory']['Row'];
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];

export async function fetchInventory(productId: string): Promise<InventoryRow | null> {
  const sb = getServerSupabase();
  const { data } = await sb.from('inventory').select('*').eq('product_id', productId).maybeSingle();
  return data ?? null;
}

// Compact map for the products list stock column.
export interface InventorySummary {
  total: number;
  reserved: number;
  available: number;
  lowThreshold: number;
}

export async function fetchInventoryMap(productIds: string[]): Promise<Map<string, InventorySummary>> {
  const map = new Map<string, InventorySummary>();
  if (productIds.length === 0) return map;
  const sb = getServerSupabase();
  const { data } = await sb
    .from('inventory')
    .select('product_id, quantity_total, quantity_reserved, quantity_available, low_stock_threshold')
    .in('product_id', productIds);
  for (const r of data ?? []) {
    map.set(r.product_id, {
      total: r.quantity_total,
      reserved: r.quantity_reserved,
      available: r.quantity_available ?? 0,
      lowThreshold: r.low_stock_threshold,
    });
  }
  return map;
}

export async function fetchStockMovements(productId: string): Promise<StockMovement[]> {
  const sb = getServerSupabase();
  const { data } = await sb
    .from('stock_movements')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data ?? [];
}

// RO labels for stock_movements.type (CHECK in migration 20260522090008).
export const STOCK_MOVEMENT_LABELS: Record<string, string> = {
  restock: 'Reaprovizionare',
  adjustment: 'Ajustare',
  order_reserved: 'Rezervare comandă',
  order_fulfilled: 'Onorare comandă',
  order_cancelled: 'Anulare comandă',
  damaged: 'Deteriorat',
  return: 'Retur',
};
