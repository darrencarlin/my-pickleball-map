export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.mypickleballmap.com"
    : "http://localhost:3000";

export const COURTS_QUERY_KEY = "courts";

export const COURT_QUERY_KEY = "court";
