import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from '@/redux/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



