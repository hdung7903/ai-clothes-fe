import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { addItem as addServerCartItem } from '@/services/cartServices';
import type { RootState } from './index';

export interface CartItem {
  id: string; // productId or variant id
  name: string;
  price: number; // unit price
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface CartState {
  items: CartItem[];
}

const STORAGE_KEY = 'cart.items.v1';

function isAuthenticatedByTokens(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('auth.tokens');
    return !!raw;
  } catch {
    return false;
  }
}

function getGuestStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}

function loadInitialState(): CartState {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const authed = isAuthenticatedByTokens();
    const storage = authed ? localStorage : getGuestStorage();
    const raw = storage ? storage.getItem(STORAGE_KEY) : null;
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return { items: parsed.items };
  } catch {
    return { items: [] };
  }
}

const initialState: CartState = loadInitialState();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      const next = loadInitialState();
      state.items = next.items;
    },
    addItem(state, action: PayloadAction<CartItem>) {
      const incoming = action.payload;
      const keyMatch = (it: CartItem) => it.id === incoming.id && it.size === incoming.size && it.color === incoming.color;
      const existing = state.items.find(keyMatch);
      if (existing) {
        existing.quantity += incoming.quantity;
      } else {
        state.items.push(incoming);
      }
      persist(state);
    },
    removeItem(state, action: PayloadAction<{ id: string; size?: string; color?: string }>) {
      const { id, size, color } = action.payload;
      state.items = state.items.filter((it) => !(it.id === id && it.size === size && it.color === color));
      persist(state);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; size?: string; color?: string; quantity: number }>) {
      const { id, size, color, quantity } = action.payload;
      const item = state.items.find((it) => it.id === id && it.size === size && it.color === color);
      if (!item) return;
      if (quantity <= 0) {
        state.items = state.items.filter((it) => !(it.id === id && it.size === size && it.color === color));
      } else {
        item.quantity = quantity;
      }
      persist(state);
    },
    clearCart(state) {
      state.items = [];
      persist(state);
    },
  },
});

function persist(state: CartState) {
  try {
    const authed = isAuthenticatedByTokens();
    const storage = authed ? localStorage : getGuestStorage();
    storage?.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
  } catch {}
}

export const addItemSmart = createAsyncThunk<
  void,
  CartItem,
  { state: RootState }
>(
  'cart/addItemSmart',
  async (item, { getState, dispatch }) => {
    const state = getState();
    const isAuthed = state.auth?.isAuthenticated;
    if (isAuthed) {
      try {
        await addServerCartItem({
          productVariantId: item.id,
          productDesignId: '',
          quantity: item.quantity,
        });
      } catch {
        // ignore server errors, still update local for UX
      }
    }
    dispatch(cartSlice.actions.addItem(item));
  }
);

export const { addItem, removeItem, updateQuantity, clearCart, hydrateFromStorage } = cartSlice.actions;
export default cartSlice.reducer;
