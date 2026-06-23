import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Cart store (Task 3.2). Persisted to localStorage; only `items` is persisted
// (partialize) so the drawer never reopens itself on load. Money is snapshot
// bani at add time (D2) — re-validated at checkout (Task 3.4).

export interface CartEngraving {
  text: string;
  priceRon: number; // bani
}

export interface CartItem {
  lineId: string;
  productId: string;
  slug: string;
  name_ro: string;
  name_en: string;
  priceRon: number; // snapshot, bani
  quantity: number;
  heroImageUrl: string | null;
  engraving?: CartEngraving;
}

export const MAX_QTY = 99; // D7 — real stock validated at checkout, not here

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'lineId' | 'quantity'>, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

// Same product + same engraving text = one line (increment). Different engraving
// text = a separate line (D4).
function makeLineId(productId: string, engraving?: CartEngraving): string {
  return engraving?.text ? `${productId}:${engraving.text}` : productId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const lineId = makeLineId(item.productId, item.engraving);
          const existing = state.items.find((i) => i.lineId === lineId);
          const items = existing
            ? state.items.map((i) =>
                i.lineId === lineId
                  ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) }
                  : i,
              )
            : [...state.items, { ...item, lineId, quantity: Math.min(MAX_QTY, quantity) }];
          return { items, isOpen: true }; // D6 — auto-open the drawer
        }),

      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

      updateQuantity: (lineId, quantity) =>
        set((state) =>
          quantity <= 0
            ? { items: state.items.filter((i) => i.lineId !== lineId) }
            : {
                items: state.items.map((i) =>
                  i.lineId === lineId ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i,
                ),
              },
        ),

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
    }),
    {
      name: 'oak-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// Derived helpers (call with the items array from a component subscription).
export function cartTotalItems(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + (i.priceRon + (i.engraving?.priceRon ?? 0)) * i.quantity, 0);
}
