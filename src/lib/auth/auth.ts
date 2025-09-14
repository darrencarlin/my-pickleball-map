import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { adminClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import * as schema from "@/lib/db/schema";
import { db } from "../db";

export const auth = betterAuth({
  appName: "My Pickleball Map",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
    },
  }),
  trustedOrigins: ["http://localhost:3000", "https://www.mypickleballmap.com"],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [nextCookies(), admin(), adminClient()],
});
