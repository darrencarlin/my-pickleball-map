import { useEffect, useState } from "react";

export const useCoordinates = () => {
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    error?: string;
  }>({ latitude: null, longitude: null });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    const geoSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const geoError = (error: GeolocationPositionError) => {
      setLocation((prev) => ({
        ...prev,
        error: error.message,
      }));
    };

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
      enableHighAccuracy: true,
    });
  }, []);

  return location;
};
