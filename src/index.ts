// src/index.ts
import app from "./app/app";
import { connectDB } from "./app/db/mongodb/connectDB";
import logger from "./app/utils/logger";

let initPromise: Promise<void> | null = null;

async function init() {
    if (!initPromise) {
        initPromise = (async () => {
            await connectDB();
            logger.info("🚀 Serverless app initialized");
        })();
    }
    await initPromise;
}

export default async function handler(req: any, res: any) {
    try {
        await init();
        return app(req, res);
    } catch (err: any) {
        logger.error("❌ Serverless handler error", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
