import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import logger from "../../../../app/utils/logger";
import { ApiError } from "../../common/utils/apiError";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  // "video/mp4",
];

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`❌ Invalid file type: ${file.originalname} (${file.mimetype})`);
    cb(new ApiError(`Invalid file type: ${path.extname(file.originalname)}`, 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 5) =>
  upload.array(fieldName, maxCount);
