"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { BASE_URL } from "../constants";
import type { auth } from "./auth";

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
} = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
  baseURL: BASE_URL,
});
