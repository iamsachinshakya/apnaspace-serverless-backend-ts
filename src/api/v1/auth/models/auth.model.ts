import mongoose, { Schema, Document } from "mongoose";
import { AuthStatus, UserRole } from "./auth.entity";

export interface IAuthUser extends Document {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    status: AuthStatus;
    isVerified: boolean;
    refreshToken?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const AuthUserSchema = new Schema<IAuthUser>(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 255,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(AuthStatus),
            default: AuthStatus.ACTIVE,
            required: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
            required: true,
        },

        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,     // createdAt & updatedAt
        versionKey: false,    // removes __v
    }
);

//
// ---------------- INDEXES ----------------
//

// Uniqueness (critical for auth)
AuthUserSchema.index({ email: 1 }, { unique: true });
AuthUserSchema.index({ username: 1 }, { unique: true });

// Common lookups
AuthUserSchema.index({ role: 1 });
AuthUserSchema.index({ status: 1 });
AuthUserSchema.index({ isVerified: 1 });

// Sorting
AuthUserSchema.index({ createdAt: -1 });

const AuthUser = mongoose.model<IAuthUser>("AuthUser", AuthUserSchema);

export default AuthUser;
