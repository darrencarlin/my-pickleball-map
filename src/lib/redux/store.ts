import { configureStore } from "@reduxjs/toolkit";
import { appSlice } from "./slices/app";
import { modalSlice } from "./slices/modal";

export const makeStore = () => {
  return configureStore({
    reducer: {
      app: appSlice.reducer,
      modal: modalSlice.reducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
