import {combineReducers, configureStore} from '@reduxjs/toolkit';
import userReducer from './slides/userSlide';
import roleReducer from './slides/roleSlide';
import userListReducer from './slides/userListSlide';
import notiReducer from './slides/notiSlide';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import {PersistGate} from 'redux-persist/integration/react';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof windows !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Những cái không muốn sau khi reload vẫn được lưu lại ví dụ phần search trong product
  //   blacklist: ["product", "user"],
};

const rootReducer = combineReducers({
  user: userReducer,
  role: roleReducer,
  users: userListReducer,
  notifications: notiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);
