import mongoose, { Schema, Document } from "mongoose";
import { ISocialLinks, IUserPreferences } from "./user.entity";

export interface IUser extends Document {
    fullName: string;
    avatar: string | null;
    bio: string;
    socialLinks: ISocialLinks;
    followers: string[];
    following: string[];
    preferences: IUserPreferences;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        avatar: {
            type: String,
            default: null,
        },

        bio: {
            type: String,
            maxlength: 500,
            default: "",
        },

        socialLinks: {
            twitter: { type: String, default: null },
            linkedin: { type: String, default: null },
            github: { type: String, default: null },
            website: { type: String, default: null },
        },

        followers: {
            type: [String],
            default: [],
        },

        following: {
            type: [String],
            default: [],
        },

        preferences: {
            emailNotifications: { type: Boolean, default: true },
            marketingUpdates: { type: Boolean, default: false },
            twoFactorAuth: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

//
// ---------------- INDEXES ----------------
//

// Search & sorting
UserSchema.index({ fullName: 1 });
UserSchema.index({ createdAt: -1 });

// Follow system performance
UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });

// Optional: compound index (search + sort)
UserSchema.index({ fullName: 1, createdAt: -1 });

// Optional: text search (if you plan advanced search)
UserSchema.index(
    { fullName: "text", bio: "text" },
    { weights: { fullName: 5, bio: 1 } }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
