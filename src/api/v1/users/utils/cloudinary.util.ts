import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { env } from "../../../../app/config/env";
import logger from "../../../../app/utils/logger";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary
 * @param buffer - File buffer from multer memoryStorage
 * @param filename - Original filename (used as public_id)
 * @param folder - Optional Cloudinary folder
 * @returns Cloudinary upload response or null on failure
 */
export const uploadOnCloudinary = async (
  buffer: Buffer,
  filename: string,
  folder: string = "uploads"
): Promise<UploadApiResponse | null> => {
  if (!buffer || !filename) {
    logger.warn("No buffer or filename provided for Cloudinary upload");
    return null;
  }

  try {
    logger.info(`Uploading to Cloudinary: ${filename}`);

    const response: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: filename.split(".")[0], resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      );
      stream.end(buffer);
    });

    logger.info(`✅ File uploaded successfully: ${response.secure_url}`);
    return response;
  } catch (error: any) {
    logger.error(`❌ Cloudinary upload failed: ${error.message}`);
    return null;
  }
};
