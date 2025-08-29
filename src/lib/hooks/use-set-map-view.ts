import { useEffect } from "react";
import { useAppDispatch } from "../redux/hooks";
import { setViewState } from "../redux/slices/app";
import { useCoordinates } from "./use-coordinates";

export function useSetMapView() {
  const { latitude, longitude, error } = useCoordinates();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (latitude && longitude) {
      dispatch(
        setViewState({
          longitude,
          latitude,
          zoom: 15,
          bearing: 0,
          pitch: 0,
        })
      );
    } else if (error) {
      console.warn("Could not get user location:", error);
    }
  }, [latitude, longitude, dispatch, error]);
}
