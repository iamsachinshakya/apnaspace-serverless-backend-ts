export interface IUserPreferences {
    emailNotifications: boolean;
    marketingUpdates: boolean;
    twoFactorAuth: boolean;
}

export interface ISocialLinks {
    twitter: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
}

/**
 * Pure domain model — DB agnostic
 */
export interface IUserEntity {
    id: string;
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

