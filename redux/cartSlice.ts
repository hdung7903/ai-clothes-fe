import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { addItem as addServerCartItem, deleteItems as deleteServerCartItems, getCartItems as getServerCartItems } from '@/services/cartServices';
import type { RootState } from './index';
import type { CartItemResponse } from '@/types/cart';

export interface CartItem {
  id: string; // cartId for internal cart management
  productVariantId: string; // productVariantId for order creation
  productDesignId?: string | null; // productDesignId if custom design
  name: string;
  price: number; // unit price
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  // Voucher discount info
  discountAmount?: number; // Individual item discount amount
  totalAmount?: number; // Final amount after discount
  voucherCode?: string; // Applied voucher code
  voucherDiscountPercent?: number; // Discount percentage
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    updateItemQuantity(state, action: PayloadAction<{ cartItemId: string; quantity: number }>) {
      const item = state.items.find(item => item.id === action.payload.cartItemId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    updateItemDiscounts(state, action: PayloadAction<{ productVariantId: string; discountAmount: number; totalAmount: number; voucherCode: string; voucherDiscountPercent: number }[]>) {
      action.payload.forEach(discount => {
        const item = state.items.find(item => item.productVariantId === discount.productVariantId);
        if (item) {
          item.discountAmount = discount.discountAmount;
          item.totalAmount = discount.totalAmount;
          item.voucherCode = discount.voucherCode;
          item.voucherDiscountPercent = discount.voucherDiscountPercent;
        }
      });
    },
    clearDiscounts(state) {
      state.items.forEach(item => {
        item.discountAmount = undefined;
        item.totalAmount = undefined;
        item.voucherCode = undefined;
        item.voucherDiscountPercent = undefined;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart items
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart items';
      })
      // Add item
      .addCase(addItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Refresh cart items after adding
      })
      .addCase(addItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add item to cart';
      })
      // Delete items
      .addCase(deleteItemsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItemsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Remove deleted items from state
        state.items = state.items.filter(item => !action.payload.includes(item.id));
      })
      .addCase(deleteItemsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete items from cart';
      })

  },
});

// Helper function to convert CartItemResponse to CartItem
function convertCartItemResponse(response: CartItemResponse): CartItem {
  // Extract size and color from variant options
  const size = response.variantOptions.find(opt => opt.optionName.toLowerCase() === 'size')?.optionValue;
  const color = response.variantOptions.find(opt => opt.optionName.toLowerCase() === 'color')?.optionValue;
  
  return {
    id: response.cartId, // Use cartId as the unique identifier for cart management
    productVariantId: response.productVariantId, // Store productVariantId for order creation
    productDesignId: response.productDesignId, // Store productDesignId for custom designs
    name: response.productName,
    price: response.unitPrice,
    quantity: response.quantity,
    size: size,
    color: color,
    image: response.productImageUrl,
  };
}

// Async thunks
export const fetchCartItems = createAsyncThunk<
  CartItem[],
  void,
  { state: RootState }
>(
  'cart/fetchCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getServerCartItems();
      if (response.success && response.data) {
        return response.data.map(convertCartItemResponse);
      }
      throw new Error('Failed to fetch cart items');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cart items');
    }
  }
);

export const addItemAsync = createAsyncThunk<
  void,
  { productVariantId: string; productDesignId: string | null; quantity: number },
  { state: RootState }
>(
  'cart/addItemAsync',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await addServerCartItem(payload);
      // Refresh cart items after adding
      dispatch(fetchCartItems());
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  }
);

export const deleteItemsAsync = createAsyncThunk<
  string[],
  string[],
  { state: RootState }
>(
  'cart/deleteItemsAsync',
  async (cartItemIds, { rejectWithValue }) => {
    try {
      await deleteServerCartItems({ cartItemIds });
      return cartItemIds;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete items from cart');
    }
  }
);

// Update item quantity by deleting and re-adding with new quantity
export const updateItemQuantityAsync = createAsyncThunk<
  void,
  { cartItemId: string; productVariantId: string; productDesignId: string | null; quantity: number },
  { state: RootState }
>(
  'cart/updateItemQuantityAsync',
  async ({ cartItemId, productVariantId, productDesignId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      // Delete the old item first
      await deleteServerCartItems({ cartItemIds: [cartItemId] });
      // Add the item back with new quantity
      await addServerCartItem({ productVariantId, productDesignId, quantity });
      // Refresh cart to get updated data
      dispatch(fetchCartItems());
    } catch (error) {
      // If update fails, refresh cart to sync with server
      dispatch(fetchCartItems());
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update item quantity');
    }
  }
);

export const { clearError, setItems, updateItemQuantity, updateItemDiscounts, clearDiscounts } = cartSlice.actions;
export default cartSlice.reducer;
