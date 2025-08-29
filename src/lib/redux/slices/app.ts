import { createSlice } from "@reduxjs/toolkit";
import type { Court } from "@/lib/db/schema";
import type { MapViewState } from "@/lib/types";

interface AppState {
  court: Court | null;
  viewState: MapViewState;
  isSelectingLocation: boolean;
  customCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

const initialState: AppState = {
  court: null,
  viewState: {
    longitude: -100,
    latitude: 40,
    zoom: 3.5,
  },
  isSelectingLocation: false,
  customCoordinates: null,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCourt: (state, action) => {
      state.court = action.payload;
    },
    setViewState: (state, action) => {
      state.viewState = action.payload;
    },
    setIsSelectingLocation: (state, action) => {
      state.isSelectingLocation = action.payload;
    },
    setCustomCoordinates: (state, action) => {
      state.customCoordinates = action.payload;
    },
    clearCustomCoordinates: (state) => {
      state.customCoordinates = null;
      state.isSelectingLocation = false;
    },
  },
});

export const {
  setCourt,
  setViewState,
  setIsSelectingLocation,
  setCustomCoordinates,
  clearCustomCoordinates,
} = appSlice.actions;

export default appSlice.reducer;
