import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BASE_URL } from "./constants";

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
