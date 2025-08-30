import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const court = pgTable(
  "court",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    playCount: doublePrecision("play_count").notNull().default(0),
    image: text("image"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    // Index for geospatial queries (latitude, longitude together)
    locationIdx: index("court_location_idx").on(
      table.latitude,
      table.longitude
    ),
    // Index for user's courts
    userIdIdx: index("court_user_id_idx").on(table.userId),
    // Index for sorting by creation date
    createdAtIdx: index("court_created_at_idx").on(table.createdAt),
    // Index for play count ordering
    playCountIdx: index("court_play_count_idx").on(table.playCount),
  })
);

export const checkIn = pgTable(
  "check_in",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courtId: uuid("court_id")
      .notNull()
      .references(() => court.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    notes: text("notes"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    // Index for finding user's check-ins
    userIdIdx: index("check_in_user_id_idx").on(table.userId),
    // Index for finding court's check-ins
    courtIdIdx: index("check_in_court_id_idx").on(table.courtId),
    // Composite index for user's check-ins at specific court
    userCourtIdx: index("check_in_user_court_idx").on(
      table.userId,
      table.courtId
    ),
    // Index for chronological sorting
    createdAtIdx: index("check_in_created_at_idx").on(table.createdAt),
  })
);

export type NewCourt = Omit<Court, "id" | "createdAt" | "updatedAt">;
export type Court = typeof court.$inferSelect;
export type Courts = Court[];
export type CourtWithCheckIns = Court & { checkIns: CheckIn[] };

export type NewCheckIn = Omit<CheckIn, "id" | "createdAt" | "updatedAt">;
export type CheckIn = typeof checkIn.$inferSelect;
export type PartialCheckIn = Partial<CheckIn>;
export type CheckIns = CheckIn[];

export type NewImage = Omit<Image, "id" | "createdAt" | "updatedAt">;
export type Image = typeof image.$inferSelect;
export type Images = Image[];

export const image = pgTable(
  "image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    imageId: text("image_id").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    userId: text("user_id") // Changed from uuid to text to match user.id
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courtId: uuid("court_id").references(() => court.id, {
      onDelete: "cascade",
    }),
    checkinId: uuid("checkin_id").references(() => checkIn.id, {
      onDelete: "cascade",
    }),
  },
  (table) => ({
    courtIdIdx: index("image_court_id_idx").on(table.courtId),
    checkinIdIdx: index("image_checkin_id_idx").on(table.checkinId),
    userIdIdx: index("image_user_id_idx").on(table.userId), // Added missing user index
  })
);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    // Index for email lookups (already unique, but explicit index for performance)
    emailIdx: index("user_email_idx").on(table.email),
    // Index for sorting by registration date
    createdAtIdx: index("user_created_at_idx").on(table.createdAt),
  })
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    // Index for token lookups (already unique, but explicit index)
    tokenIdx: index("session_token_idx").on(table.token),
    // Index for finding user sessions
    userIdIdx: index("session_user_id_idx").on(table.userId),
    // Index for cleaning up expired sessions
    expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt),
  })
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    // Index for finding user's accounts
    userIdIdx: index("account_user_id_idx").on(table.userId),
    // Composite index for provider + account lookups
    providerAccountIdx: index("account_provider_account_idx").on(
      table.providerId,
      table.accountId
    ),
    // Index for token expiration cleanup
    accessTokenExpiresIdx: index("account_access_token_expires_idx").on(
      table.accessTokenExpiresAt
    ),
  })
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
  },
  (table) => ({
    // Index for identifier lookups (email verification, etc.)
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
    // Index for cleaning up expired verifications
    expiresAtIdx: index("verification_expires_at_idx").on(table.expiresAt),
    // Composite index for identifier + value verification
    identifierValueIdx: index("verification_identifier_value_idx").on(
      table.identifier,
      table.value
    ),
  })
);

// Relations
export const courtRelations = relations(court, ({ one, many }) => ({
  user: one(user, { fields: [court.userId], references: [user.id] }),
  checkIns: many(checkIn),
  images: many(image), // Added images relation
}));

export const checkInRelations = relations(checkIn, ({ one, many }) => ({
  court: one(court, { fields: [checkIn.courtId], references: [court.id] }),
  user: one(user, { fields: [checkIn.userId], references: [user.id] }),
  images: many(image), // Added images relation
}));

export const userRelations = relations(user, ({ many }) => ({
  courts: many(court),
  checkIns: many(checkIn),
  sessions: many(session),
  accounts: many(account),
  images: many(image), // Added images relation
}));

export const imageRelations = relations(image, ({ one }) => ({
  user: one(user, { fields: [image.userId], references: [user.id] }),
  court: one(court, { fields: [image.courtId], references: [court.id] }),
  checkIn: one(checkIn, {
    fields: [image.checkinId],
    references: [checkIn.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));
