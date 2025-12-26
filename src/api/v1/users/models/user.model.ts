import {
    pgTable,
    serial,
    text,
    varchar,
    boolean,
    timestamp,
    jsonb,
    uuid,

} from "drizzle-orm/pg-core";

import { ISocialLinks, IUserPreferences } from "./user.entity";

export const users = pgTable("users", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    fullName: text("full_name").notNull(),
    avatar: text("avatar"),
    bio: varchar("bio", { length: 500 }).default(""),

    socialLinks: jsonb("social_links")
        .$type<ISocialLinks>()
        .default({
            twitter: null,
            linkedin: null,
            github: null,
            website: null,
        }),

    followers: jsonb("followers")
        .$type<string[]>()
        .default([]),

    following: jsonb("following")
        .$type<string[]>()
        .default([]),


    preferences: jsonb("preferences")
        .$type<IUserPreferences>()
        .default({
            emailNotifications: true,
            marketingUpdates: false,
            twoFactorAuth: false,
        }),

    /** ----- TIMESTAMPS ----- */
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
