export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.mypickleballmap.com"
    : "http://localhost:3000";

export const CLOUDFLARE_BUCKET = "my-pickleball-map";

export const CLOUDFLARE_URL =
  "https://pub-d36b4370ca3844a7b3b8f11ba32dbe39.r2.dev";

// Query Keys

export const COURT_QUERY_KEY = "court";
export const COURTS_QUERY_KEY = "courts";

export const CHECKIN_QUERY_KEY = "checkin";
export const CHECKINS_QUERY_KEY = "checkins";

export const IMAGE_QUERY_KEY = "image";
export const IMAGES_QUERY_KEY = "images";
