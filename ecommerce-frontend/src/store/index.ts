import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import addressReducer from './slices/addressSlice';
import paymentReducer from './slices/paymentSlice';
import userCheckoutReducer from './slices/userCheckoutSlice';
import giftRegistryReducer from './slices/giftRegistrySlice';
import giftCardReducer from './slices/giftCardSlice';
import notificationReducer from './slices/notificationSlice';  


const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items', 'totalAmount', 'totalItems'],
  serialize: true,
  debug: process.env.NODE_ENV === 'development'
};

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'],
  debug: process.env.NODE_ENV === 'development'
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({  
  reducer: {  
    auth: persistedAuthReducer,  
    categories: categoryReducer,  
    products: productReducer,  
    cart: persistedCartReducer,  
    orders: orderReducer,  
    addresses: addressReducer,  
    payments: paymentReducer,  
    userCheckout: userCheckoutReducer,
    giftRegistry: giftRegistryReducer,
    giftCard: giftCardReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

//export type RootState = ReturnType<typeof store.getState>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
