import {
    pgTable,
    uuid,
    text,
    varchar,
    timestamp,
    boolean
} from "drizzle-orm/pg-core";
import { AuthStatus, UserRole } from "./auth.entity";

export const authUsers = pgTable("auth_users", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    username: varchar("username", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: text("password").notNull(),

    role: text("role")
        .$type<UserRole>()
        .default(UserRole.USER)
        .notNull(),

    status: text("status")
        .$type<AuthStatus>()
        .default(AuthStatus.ACTIVE)
        .notNull(),

    isVerified: boolean("is_verified")
        .default(false)
        .notNull(),

    refreshToken: text("refresh_token"),

    /** ----- TIMESTAMPS ----- */
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
