import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BASE_URL } from "./constants";
import type { MapReference, Rect } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom Fetch

const isLocalhost =
  typeof window !== "undefined" && window.location.hostname === "localhost";

const log = (message: string, data?: unknown) => {
  if (isLocalhost) {
    console.info(message, data);
  }
};

const logError = (message: string, data?: unknown) => {
  if (isLocalhost) {
    console.error(message, data);
  }
};

const logDebug = (message: string, data?: unknown) => {
  if (isLocalhost) {
    console.debug(message, data);
  }
};

type FetchOptions = RequestInit & {
  next?: NextFetchRequestConfig;
};

export async function fetchApi<T>(
  url: string,
  options?: FetchOptions
): Promise<T> {
  const fullUrl = `${BASE_URL}${url}`;

  log(`Initiating API call to: ${fullUrl}`, { options });

  try {
    const response = await fetch(fullUrl, {
      ...options,
    });

    log(`Received response from: ${fullUrl}`, {
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      logError(`HTTP error for: ${fullUrl}`, {
        status: response.status,
        statusText: response.statusText,
      });
      // Try to get error message from response body
      try {
        const errorData = await response.json();
        return {
          success: false,
          message:
            errorData.message || "Something went wrong. Please try again.",
          data: null,
        } as unknown as T;
      } catch {
        // If we can't parse the error response, return a generic error
        return {
          success: false,
          message: "Something went wrong. Please try again.",
          data: null,
        } as unknown as T;
      }
    }

    const data = await response.json();
    logDebug(`Parsed JSON response from: ${fullUrl}`, { data });

    return data;
  } catch (error) {
    logError(`Error in API call to: ${fullUrl}`, {
      error,
      message: (error as Error).message,
      cause: (error as Error).cause,
      stack: (error as Error).stack,
    });

    // Return a structured error response instead of null
    return {
      success: false,
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
      data: null,
    } as unknown as T;
  }
}

// ======================
// Geometry Utilities
// ======================
/**
 * Checks if two rectangles intersect. Used to determine if a location is visible on the map.
 * @param r1 - The first rectangle
 * @param r2 - The second rectangle
 * @returns Boolean indicating if the rectangles intersect
 */
const intersectRect = (r1: Rect, r2: Rect): boolean => {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
};

/**
 * Gets IDs of locations currently visible in the map viewport
 * @param map - Reference to the Mapbox map instance
 * @returns Array of visible location IDs
 */
export const getVisibleMapLocations = (map: MapReference) => {
  if (!map || !map.current) return [];

  const container = map.current.getContainer();

  console.log("Map container:", container);
  const markers = container.getElementsByClassName("marker");
  console.log("Map markers:", markers);
  const containerRect = container.getBoundingClientRect();

  console.log("Container rect:", containerRect);

  const visibles: Element[] = [];

  for (let i = 0; i < markers.length; i++) {
    const marker = markers.item(i) as Element;
    const markerRect = marker.getBoundingClientRect();
    if (intersectRect(containerRect, markerRect)) {
      visibles.push(marker);
    }
  }

  console.log("Visible markers:", visibles);

  return visibles.length > 0
    ? Array.from(visibles).map((el) => el.getAttribute("data-id"))
    : [];
};
