import mongoose from "mongoose";
import { env } from "../../config/env";
import logger from "../../utils/logger";

export const connectDB = async (): Promise<void> => {
  const MONGO_URI = `${env.MONGODB_URI}/${env.DB_NAME}`;

  try {
    await mongoose.connect(MONGO_URI);

    logger.info("✅ MongoDB connected successfully");
    logger.debug(`📦 DB: ${mongoose.connection.name} | 🌍 Host: ${mongoose.connection.host}`);

    // Handle DB-level events
    mongoose.connection.on("error", (err) => {
      logger.error(`💥 MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected. Retrying...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("🔄 MongoDB reconnected");
    });

  } catch (err: any) {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);
    throw err; // Let the app handle graceful shutdown
  }
};
