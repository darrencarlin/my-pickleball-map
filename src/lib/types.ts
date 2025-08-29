import type { ViewState } from "react-map-gl/mapbox";

export interface CheckIn {
  userId: string;
  timestamp: string;
}

export type MapViewState = Omit<ViewState, "padding" | "bearing" | "pitch">;

export interface ResponseObject<T> {
  success: boolean;
  data: T;
  message: string;
}
