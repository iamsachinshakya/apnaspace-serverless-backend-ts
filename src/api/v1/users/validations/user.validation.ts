import { z } from "zod";
/**
 * Schema: Update User
 * - All fields optional (for partial updates)
 * - Includes nested preferences & socialLinks validation
 */
export const updateUserSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters long")
      .max(50, "Full name must be at most 50 characters long")
      .optional(),

    bio: z
      .string()
      .max(500, "Bio must be at most 500 characters long")
      .optional(),

    socialLinks: z
      .object({
        twitter: z.string().url().nullable().optional(),
        linkedin: z.string().url().nullable().optional(),
        github: z.string().url().nullable().optional(),
        website: z.string().url().nullable().optional(),
      })
      .optional(),

    preferences: z
      .object({
        emailNotifications: z.boolean().optional(),
        marketingUpdates: z.boolean().optional(),
        twoFactorAuth: z.boolean().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined && v !== null),
    {
      message: "At least one field must be provided for update.",
      path: [],
    }
  );


export const imageSchema = z.object({
  file: z
    .any()
    .refine((file: Express.Multer.File | undefined) => !!file, {
      message: "Avatar file is required",
    })
    .refine((file: Express.Multer.File | undefined) => {
      if (!file) return false;
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      return allowedMimeTypes.includes(file.mimetype);
    }, {
      message: "Invalid file type. Allowed types: jpeg, png, webp, gif",
    })
    .refine((file: Express.Multer.File | undefined) => {
      if (!file) return false;
      const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
      return file.size <= maxSizeInBytes;
    }, {
      message: "File size must not exceed 5 MB",
    }),
});