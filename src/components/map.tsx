"use client";

import { MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setBounds,
  setCourt,
  setCustomCoordinates,
  setIsSelectingLocation,
  setViewState,
  setVisibleCourts,
} from "@/lib/redux/slices/app";
import { useCourts } from "@/lib/tanstack/hooks/courts";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef } from "react";
import MapboxMap, {
  GeolocateControl,
  type MapMouseEvent,
  type MapRef,
  Marker,
} from "react-map-gl/mapbox";
import type { ViewStateChangeEvent } from "@/lib/types";
import { getVisibleMapLocations } from "@/lib/utils";
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

  const updateVisibleLocations = useCallback(() => {
    // Get visible locations on the map
    const mapLocations = getVisibleMapLocations(mapRef);

    console.log("Visible map locations:", mapLocations);

    // Filter locations to only include those that are visible on the map
    const filteredLocations = courts?.filter((court) =>
      mapLocations.includes(court.id)
    );

    console.log("Filtered locations:", filteredLocations);

    // Sort locations by name
    filteredLocations?.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);

    // Set visible locations
    dispatch(setVisibleCourts(filteredLocations ?? []));
  }, [courts, dispatch]);

  const updateBounds = useCallback(() => {
    const boundsArray = mapRef?.current
      ?.getMap()
      ?.getBounds()
      ?.toArray()
      ?.flat();

    if (boundsArray) {
      dispatch(setBounds(boundsArray as [number, number, number, number]));
    }
  }, [dispatch]);

  const handleMove = (evt: ViewStateChangeEvent) => {
    dispatch(setViewState(evt.viewState));
  };

  const handleMoveEnd = useCallback(
    async (evt: ViewStateChangeEvent) => {
      updateBounds();
      dispatch(setViewState(evt.viewState));
      updateVisibleLocations();
    },
    [dispatch, updateVisibleLocations, updateBounds]
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
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
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
            <div
              data-id={String(court.id)}
              className="flex items-center justify-center bg-primary rounded-full w-8 h-8 shadow-lg marker"
            >
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
          position="top-left"
          showUserHeading
          showUserLocation
          showAccuracyCircle={false}
        />
      </MapboxMap>
    </div>
  );
};
