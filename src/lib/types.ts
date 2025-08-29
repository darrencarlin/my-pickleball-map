import type { MapEventOf } from "mapbox-gl";
import type { RefObject } from "react";
import type { MapRef, ViewState } from "react-map-gl/mapbox";

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

export interface Payload<T> {
  payload: T;
}

export type ViewStateChangeEvent = MapEventOf<
  | "movestart"
  | "move"
  | "moveend"
  | "zoomstart"
  | "zoom"
  | "zoomend"
  | "rotatestart"
  | "rotate"
  | "rotateend"
  | "dragstart"
  | "drag"
  | "dragend"
  | "pitchstart"
  | "pitch"
  | "pitchend"
> & {
  viewState: ViewState;
};

export type MapReference = RefObject<MapRef | null> | null;

// ======================
// Geometry Types
// ======================
export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
