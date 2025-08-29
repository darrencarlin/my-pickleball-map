import { useEffect } from "react";

export function useTriggerGeoControl(
  geoControlRef: React.RefObject<mapboxgl.GeolocateControl | null>,
  delay: number = 1500
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      geoControlRef.current?.trigger();
    }, delay);

    return () => clearTimeout(timer);
  }, [geoControlRef, delay]);
}
