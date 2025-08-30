import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setHasInitializedLocation, setViewState } from "../redux/slices/app";
import { useCoordinates } from "./use-coordinates";

export function useSetMapView() {
  const { latitude, longitude, error } = useCoordinates();
  const dispatch = useAppDispatch();

  // Get the current state to check if we've already initialized location
  const hasInitializedLocation = useAppSelector(
    (state) => state.app.hasInitializedLocation
  );
  const currentViewState = useAppSelector((state) => state.app.viewState);

  useEffect(() => {
    // Only set user location if we haven't initialized yet AND we don't have a meaningful persisted position
    const hasPersistedPosition =
      currentViewState.longitude !== -100 || currentViewState.latitude !== 40;

    if (
      !hasInitializedLocation &&
      !hasPersistedPosition &&
      latitude &&
      longitude
    ) {
      dispatch(
        setViewState({
          longitude,
          latitude,
          zoom: 15,
          bearing: 0,
          pitch: 0,
        })
      );
      dispatch(setHasInitializedLocation(true));
    } else if (!hasInitializedLocation && hasPersistedPosition) {
      // If we have persisted position, just mark as initialized
      dispatch(setHasInitializedLocation(true));
    } else if (error && !hasInitializedLocation && !hasPersistedPosition) {
      console.warn("Could not get user location:", error);
      // Even if we can't get location, mark as initialized to prevent retries
      dispatch(setHasInitializedLocation(true));
    }
  }, [
    latitude,
    longitude,
    dispatch,
    error,
    hasInitializedLocation,
    currentViewState,
  ]);
}
