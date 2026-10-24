import type { itemsProps, OrderItem, TablesProps } from "@/type";
import { proxy, subscribe } from "valtio";

interface OrderState {
  items: OrderItem[];
  total: number;
  type: "dine-in" | "take-away";
  table?: TablesProps | null;
}

const calculateTotal = (items: OrderItem[]) => {
  return items.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0,
  );
};

const createOrderStore = (storageKey: string) => {
  const getInitialState = (): OrderState => {
    // SSR satety
    if (typeof window === "undefined")
      return { items: [], total: 0, type: "dine-in", table: null };

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return { items: [], total: 0, type: "dine-in", table: null };

      const parsed = JSON.parse(saved) as OrderState;
      // Ensure items is always an array to prevent .map crashes
      return {
        ...parsed,
        items: Array.isArray(parsed.items) ? parsed.items : [],
        total: parsed.total,
        type: parsed.type || "dine-in",
        table: parsed.table || null,
      };
    } catch (error) {
      return { items: [], total: 0, type: "dine-in", table: null };
    }
  };

  const state = proxy<OrderState>(getInitialState());

  const actions = {
    addItem: (product: itemsProps) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
      state.total = calculateTotal(state.items);
    },
    updateQuantity: (id: string, amount: number) => {
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
          if (item.quantity <= 0) {
            state.items = state.items.filter((i) => i.id !== id);
          }
        }
      }
      state.total = calculateTotal(state.items);
    },
    removeItem: (index: number) => {
      state.items.splice(index, 1);
      state.total = calculateTotal(state.items);
    },
    setType: (type: "dine-in" | "take-away") => {
      state.type = type;
    },
    setTable: (table: TablesProps | null) => {
      state.table = table;
    },
    reset: () => {
      state.items = [];
      state.total = 0;
      state.type = "dine-in";
      state.table = null;
    },
  };
  subscribe(state, () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  });

  return { state, actions };
};

export const homeCart = createOrderStore("homeCart");
export const posCart = createOrderStore("posCart");
