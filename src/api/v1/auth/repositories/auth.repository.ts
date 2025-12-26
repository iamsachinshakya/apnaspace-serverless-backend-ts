import mongoose from "mongoose";
import { IAuthRepository } from "./auth.repository.interface";
import { IAuthEntity } from "../models/auth.entity";
import logger from "../../../../app/utils/logger";
import AuthUser from "../models/auth.model";
import User from "../../users/models/user.model";

export class AuthRepository implements IAuthRepository {

    /**
     * Convert mongoose document → domain entity
     */
    private normalize(user: any): IAuthEntity {
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified,
            refreshToken: user.refreshToken ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }


    async create(data: IAuthEntity): Promise<IAuthEntity | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create auth user
            const authUser = await AuthUser.create(
                [
                    {
                        username: data.username,
                        email: data.email,
                        password: data.password,
                        role: data.role,
                        status: data.status,
                        isVerified: data.isVerified,
                        refreshToken: data.refreshToken ?? null,
                    },
                ],
                { session }
            );

            const auth = authUser[0];

            // Create user profile
            await User.create(
                [
                    {
                        _id: auth._id,
                        fullName: data.username,
                        avatar: null,
                        bio: "",
                        socialLinks: {
                            twitter: null,
                            linkedin: null,
                            github: null,
                            website: null,
                        },
                        followers: [],
                        following: [],
                        preferences: {
                            emailNotifications: true,
                            marketingUpdates: false,
                            twoFactorAuth: false,
                        },
                    },
                ],
                { session }
            );

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            return this.normalize(auth);

        } catch (err) {
            // 🔥 Rollback everything
            await session.abortTransaction();
            session.endSession();

            logger.error("❌ Failed to create auth + user transaction", err);
            return null;
        }
    }



    async findByEmail(email: string): Promise<IAuthEntity | null> {
        try {
            const user = await AuthUser.findOne({ email })
                .lean();

            return user ? this.normalize(user) : null;
        } catch (err) {
            logger.error(`❌ Failed to find user by email: ${email}`, err);
            return null;
        }
    }

    async findByUsername(username: string): Promise<IAuthEntity | null> {
        try {
            const normalized = username.trim().toLowerCase();

            const user = await AuthUser.findOne({ username: normalized })
                .lean();

            return user ? this.normalize(user) : null;
        } catch (err) {
            logger.error(`❌ Failed to find user by username: ${username}`, err);
            return null;
        }
    }

    async findById(id: string): Promise<IAuthEntity | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) return null;

            const user = await AuthUser.findById(id)
                .lean();

            return user ? this.normalize(user) : null;
        } catch (err) {
            logger.error(`❌ Failed to find user by id: ${id}`, err);
            return null;
        }
    }

    async removeRefreshTokenById(id: string): Promise<IAuthEntity | null> {
        try {
            const user = await AuthUser.findByIdAndUpdate(
                id,
                { refreshToken: null },
                { new: true }
            ).lean();

            return user ? this.normalize(user) : null;
        } catch (err) {
            logger.error(`❌ Failed to remove refresh token for user id: ${id}`, err);
            return null;
        }
    }

    async updateById(
        id: string,
        data: Partial<IAuthEntity>
    ): Promise<IAuthEntity | null> {
        try {
            const user = await AuthUser.findByIdAndUpdate(
                id,
                { ...data },
                { new: true }
            ).lean();

            return user ? this.normalize(user) : null;
        } catch (err) {
            logger.error(`❌ Failed to update user id: ${id}`, err);
            return null;
        }
    }

    async deleteById(id: string): Promise<IAuthEntity | null> {
        try {
            const user = await AuthUser.findByIdAndDelete(id)
                .lean();

            return user ? this.normalize(user) : null;
        } catch (err) {
            logger.error(`❌ Failed to delete user id: ${id}`, err);
            return null;
        }
    }
}
