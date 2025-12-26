// src/index.ts
import app from "./app/app";
import { env } from "./app/config/env";
import { connectDB } from "./app/db/mongodb/connectDB";
import logger from "./app/utils/logger";

/**
 * 🧩 Handle uncaught synchronous exceptions
 * These happen outside of promises and can crash the app immediately.
 */
process.on("uncaughtException", (err: Error) => {
    logger.error("💥 Uncaught Exception! Shutting down...");
    logger.error(err.stack || err.message);
    process.exit(1);
});

// ✅ Start server only after successful DB connection
const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(env.PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
        });

        /**
         * 🧩 Handle unhandled promise rejections
         * Example: failed DB connection or network error not caught.
         */
        process.on("unhandledRejection", (err: any) => {
            logger.error("💥 Unhandled Rejection! Shutting down...");
            logger.error(err?.stack || err);

            // Gracefully close server before exiting
            server.close(() => process.exit(1));
        });

        /**
         * 🧩 Handle SIGTERM (graceful shutdown)
         * Useful for production (e.g., Docker, PM2, Kubernetes)
         */
        process.on("SIGTERM", () => {
            logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully...");
            server.close(() => {
                logger.info("💤 Process terminated!");
            });
        });
    } catch (err: any) {
        logger.error("❌ Failed to start server:", err?.stack || err.message);
        process.exit(1);
    }
};

startServer();
