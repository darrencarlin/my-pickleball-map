"use client";

import { MapProvider as MapboxMapProvider } from "react-map-gl/mapbox";

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  return <MapboxMapProvider>{children}</MapboxMapProvider>;
};
