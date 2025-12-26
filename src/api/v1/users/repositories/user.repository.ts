import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { getDB } from "../../../../app/db/connectDB";
import { users } from "../models/user.model";
import { IUserRepository } from "./user.repository.interface";
import { IUserEntity } from "../models/user.entity";
import { IFollowCount, IFollowUser, IUpdateUser, IUserDashboard } from "../models/user.dto";
import { IQueryParams, PaginatedData } from "../../common/models/common.dto";
import logger from "../../../../app/utils/logger";

export class UserRepository implements IUserRepository {

    private normalizeUser(u: any): IUserDashboard {
        return {
            id: u.id,
            fullName: u.fullName,
            avatar: u.avatar ?? null,
            bio: u.bio ?? "",
            socialLinks: u.socialLinks ?? { twitter: null, linkedin: null, github: null, website: null },
            preferences: u.preferences ?? { emailNotifications: true, marketingUpdates: false, twoFactorAuth: false },
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        };
    }

    async create(data: IUserEntity): Promise<IUserDashboard | null> {
        try {
            const [createdUser] = await getDB().insert(users).values(data).returning();
            return createdUser ? this.normalizeUser(createdUser) : null;
        } catch (error) {
            logger.error("Error creating user: %o", error);
            return null;
        }
    }

    async findAll(params: IQueryParams): Promise<PaginatedData<IUserDashboard>> {
        try {
            const { page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" } = params;
            const offset = (page - 1) * limit;
            const db = getDB();

            const conditions = [];
            if (search.trim()) conditions.push(ilike(users.fullName, `%${search}%`));
            const where = conditions.length ? and(...conditions) : undefined;

            const orderByColumn = sortBy === "fullName" ? users.fullName : users.createdAt;
            const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

            const rawData = await db
                .select({
                    id: users.id,
                    fullName: users.fullName,
                    avatar: users.avatar,
                    bio: users.bio,
                    socialLinks: users.socialLinks,
                    preferences: users.preferences,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                })
                .from(users)
                .where(where)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);

            const data: IUserDashboard[] = rawData.map(this.normalizeUser);

            const [{ count }] = await db.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(users).where(where);

            return { data, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
        } catch (error) {
            logger.error("Error fetching users: %o", error);
            return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
        }
    }

    async findById(id: string): Promise<IUserDashboard | null> {
        try {
            const [user] = await getDB().select({
                id: users.id,
                fullName: users.fullName,
                avatar: users.avatar,
                bio: users.bio,
                socialLinks: users.socialLinks,
                preferences: users.preferences,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            }).from(users).where(eq(users.id, id));
            return user ? this.normalizeUser(user) : null;
        } catch (error) {
            logger.error("Error finding user by id %s: %o", id, error);
            return null;
        }
    }

    async updateAccountById(userId: string, updates: Partial<IUpdateUser>): Promise<Partial<IUpdateUser> | null> {
        try {
            const [updated] = await getDB().update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
            return updated ? updates : null;
        } catch (error) {
            logger.error("Error updating user %s: %o", userId, error);
            return null;
        }
    }

    async deleteById(userId: string): Promise<boolean> {
        try {
            const [deleted] = await getDB().delete(users).where(eq(users.id, userId)).returning();
            return !!deleted;
        } catch (error) {
            logger.error("Error deleting user %s: %o", userId, error);
            return false;
        }
    }

    async addFollower(targetUserId: string, followerId: string): Promise<boolean> {
        try {
            const result = await getDB()
                .update(users)
                .set({ followers: sql`${users.followers} || ${followerId}`, updatedAt: new Date() })
                .where(eq(users.id, targetUserId))
                .returning({ id: users.id });
            return result.length > 0;
        } catch (error) {
            logger.error("Error adding follower %s to user %s: %o", followerId, targetUserId, error);
            return false;
        }
    }

    async addFollowing(userId: string, targetUserId: string): Promise<boolean> {
        try {
            const result = await getDB()
                .update(users)
                .set({ following: sql`${users.following} || ${targetUserId}`, updatedAt: new Date() })
                .where(eq(users.id, userId))
                .returning({ id: users.id });
            return result.length > 0;
        } catch (error) {
            logger.error("Error adding following %s for user %s: %o", targetUserId, userId, error);
            return false;
        }
    }

    async removeFollower(targetUserId: string, followerId: string): Promise<boolean> {
        try {
            const result = await getDB()
                .update(users)
                .set({ followers: sql`array_remove(${users.followers}, ${followerId})`, updatedAt: new Date() })
                .where(eq(users.id, targetUserId))
                .returning({ id: users.id });
            return result.length > 0;
        } catch (error) {
            logger.error("Error removing follower %s from user %s: %o", followerId, targetUserId, error);
            return false;
        }
    }

    async removeFollowing(userId: string, targetUserId: string): Promise<boolean> {
        try {
            const result = await getDB()
                .update(users)
                .set({ following: sql`array_remove(${users.following}, ${targetUserId})`, updatedAt: new Date() })
                .where(eq(users.id, userId))
                .returning({ id: users.id });
            return result.length > 0;
        } catch (error) {
            logger.error("Error removing following %s for user %s: %o", targetUserId, userId, error);
            return false;
        }
    }

    async findFollowers(userId: string): Promise<IFollowUser[]> {
        try {
            const db = getDB();
            const [row] = await db.select({ followers: users.followers }).from(users).where(eq(users.id, userId));
            const followers = row?.followers ?? [];
            if (followers.length === 0) return [];
            return db.select({ id: users.id, fullName: users.fullName, avatar: users.avatar }).from(users).where(sql`${users.id} = ANY(${followers})`);
        } catch (error) {
            logger.error("Error fetching followers for user %s: %o", userId, error);
            return [];
        }
    }

    async findFollowing(userId: string): Promise<IFollowUser[]> {
        try {
            const db = getDB();
            const [row] = await db.select({ following: users.following }).from(users).where(eq(users.id, userId));
            const following = row?.following ?? [];
            if (following.length === 0) return [];
            return db.select({ id: users.id, fullName: users.fullName, avatar: users.avatar }).from(users).where(sql`${users.id} = ANY(${following})`);
        } catch (error) {
            logger.error("Error fetching following for user %s: %o", userId, error);
            return [];
        }
    }

    /**
 * Check if a user is following a target user
 * @param userId - ID of the follower
 * @param targetUserId - ID of the target user
 * @returns true if userId is already following targetUserId
 */
    async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
        try {
            const db = getDB();
            const [row] = await db
                .select({ followers: users.followers })
                .from(users)
                .where(eq(users.id, targetUserId));

            if (!row || !row.followers) return false;
            return row.followers.includes(userId);
        } catch (error) {
            logger.error("Error checking if user %s is following %s: %o", userId, targetUserId, error);
            return false;
        }
    }


    async getFollowCounts(userId: string): Promise<IFollowCount | null> {
        try {
            const [result] = await getDB()
                .select({
                    followerCount: sql<number>`jsonb_array_length(${users.followers})`,
                    followingCount: sql<number>`jsonb_array_length(${users.following})`,
                })
                .from(users)
                .where(eq(users.id, userId));
            if (!result) return null;
            return { followerCount: Number(result.followerCount ?? 0), followingCount: Number(result.followingCount ?? 0) };
        } catch (error) {
            logger.error("Error fetching follow counts for user %s: %o", userId, error);
            return null;
        }
    }
}
