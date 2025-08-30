import { useEffect } from "react";
import { useAppSelector } from "../redux/hooks";

export function useTriggerGeoControl(
  geoControlRef: React.RefObject<mapboxgl.GeolocateControl | null>,
  delay: number = 1500
) {
  const hasInitializedLocation = useAppSelector(
    (state) => state.app.hasInitializedLocation
  );
  const currentViewState = useAppSelector((state) => state.app.viewState);

  useEffect(() => {
    // Only trigger geo control if we haven't initialized location AND don't have persisted position
    const hasPersistedPosition =
      currentViewState.longitude !== -100 || currentViewState.latitude !== 40;

    if (!hasInitializedLocation && !hasPersistedPosition) {
      const timer = setTimeout(() => {
        geoControlRef.current?.trigger();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [geoControlRef, delay, hasInitializedLocation, currentViewState]);
}
