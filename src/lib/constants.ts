export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.mypickleballmap.com"
    : "http://localhost:3000";

// Query Keys

export const COURT_QUERY_KEY = "court";
export const COURTS_QUERY_KEY = "courts";

export const CHECKIN_QUERY_KEY = "checkin";
export const CHECKINS_QUERY_KEY = "checkins";
