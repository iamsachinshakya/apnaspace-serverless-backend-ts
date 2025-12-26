import { UserRole } from "../../auth/models/auth.entity";

export const PERMISSIONS = {
    AUTH: {
        CHANGE_PASSWORD: "user:change_password",
    },
    USER: {
        CREATE: "user:create",
        READ: "user:read",
        UPDATE: "user:update",
        DELETE: "user:delete",
        CHANGE_PASSWORD: "user:change_password",
    },
    BLOG: {
        CREATE: "blog:create",
        EDIT: "blog:edit",
        DELETE: "blog:delete",
        READ: "blog:read",
    },
    CATEGORY: {
        CREATE: "category:create",
        UPDATE: "category:update",
        DELETE: "category:delete",
        READ: "category:read",
    },
    COMMENT: {
        CREATE: "comment:create",
        UPDATE: "comment:update",
        DELETE: "comment:delete",
        READ: "comment:read",
        LIKE: "comment:like",
    },
} as const;

/**
 * Each role has a Set of permissions.
 */
export const RolePermissions: Record<UserRole, Set<string>> = {
    [UserRole.ADMIN]: new Set([
        ...Object.values(PERMISSIONS.AUTH),
        ...Object.values(PERMISSIONS.USER),
        ...Object.values(PERMISSIONS.BLOG),
        ...Object.values(PERMISSIONS.CATEGORY),
        ...Object.values(PERMISSIONS.COMMENT),
    ]),
    [UserRole.EDITOR]: new Set([
        PERMISSIONS.BLOG.CREATE,
        PERMISSIONS.BLOG.EDIT,
        PERMISSIONS.BLOG.DELETE,
        PERMISSIONS.CATEGORY.READ,
        PERMISSIONS.COMMENT.READ,
        PERMISSIONS.COMMENT.DELETE,
        PERMISSIONS.COMMENT.CREATE,

    ]),
    [UserRole.AUTHOR]: new Set([
        PERMISSIONS.BLOG.CREATE,
        PERMISSIONS.BLOG.EDIT,
        PERMISSIONS.BLOG.READ,
        PERMISSIONS.COMMENT.CREATE,
        PERMISSIONS.COMMENT.READ,
    ]),
    [UserRole.USER]: new Set([
        PERMISSIONS.BLOG.READ,
        PERMISSIONS.COMMENT.CREATE,
        PERMISSIONS.COMMENT.READ,
        PERMISSIONS.AUTH.CHANGE_PASSWORD
    ]),
};
