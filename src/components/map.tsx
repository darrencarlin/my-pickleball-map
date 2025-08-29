"use client";

import { MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setCourt,
  setCustomCoordinates,
  setIsSelectingLocation,
  setViewState,
} from "@/lib/redux/slices/app";
import { useCourts } from "@/lib/tanstack/hooks/courts";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import MapboxMap, {
  GeolocateControl,
  type MapMouseEvent,
  type MapRef,
  Marker,
} from "react-map-gl/mapbox";
import { Pickball } from "./icons/pickleball";

export const MyMap = () => {
  const geoControlRef = useRef<mapboxgl.GeolocateControl>(null);
  const mapRef = useRef<MapRef>(null);

  const { data: courts } = useCourts();

  const dispatch = useAppDispatch();

  const viewState = useAppSelector((state) => state.app.viewState);

  const isSelectingLocation = useAppSelector(
    (state) => state.app.isSelectingLocation
  );

  const customCoordinates = useAppSelector(
    (state) => state.app.customCoordinates
  );

  const handleMapClick = (event: MapMouseEvent) => {
    if (isSelectingLocation) {
      const { lng, lat } = event.lngLat;
      dispatch(setCustomCoordinates({ longitude: lng, latitude: lat }));
      dispatch(setIsSelectingLocation(false));
    }
  };

  useEffect(() => {
    geoControlRef?.current?.trigger();
  }, []);

  return (
    <div className="w-screen h-[100dvh] relative">
      <MapboxMap
        id="map"
        ref={mapRef}
        {...viewState}
        onMove={(evt) => dispatch(setViewState(evt.viewState))}
        onClick={handleMapClick}
        cursor={isSelectingLocation ? "crosshair" : "grab"}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/mypickleballmap/cmen5jrii01bh01s48hzp5non"
        projection={"globe"}
        reuseMaps
        attributionControl={false}
      >
        {courts?.map((court) => (
          <Marker
            className="cursor-pointer"
            key={court.id}
            longitude={court.longitude}
            latitude={court.latitude}
            onClick={() => dispatch(setCourt(court))}
          >
            <div className="flex items-center justify-center bg-primary rounded-full w-8 h-8 shadow-lg">
              <Pickball />
            </div>
          </Marker>
        ))}

        {/* Show custom location marker when coordinates are selected */}
        {customCoordinates && (
          <Marker
            longitude={customCoordinates.longitude}
            latitude={customCoordinates.latitude}
          >
            <div className="flex items-center justify-center bg-red-500 rounded-full w-8 h-8 border border-white">
              <MapPin className="text-white" size={18} />
            </div>
          </Marker>
        )}

        <GeolocateControl
          ref={geoControlRef}
          position="bottom-right"
          showUserHeading
          showUserLocation
          showAccuracyCircle={false}
        />
      </MapboxMap>
    </div>
  );
};
