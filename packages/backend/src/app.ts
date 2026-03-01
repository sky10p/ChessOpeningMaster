import express from "express";
import cors from "cors";
import { connectDB, disconnectDB, getDB } from "./db/mongo";
import { Server } from "http";
import repertoiresRouter from "./routes/repertoires";
import studiesRouter from "./routes/studies";
import paths from "./routes/paths";
import positionsRouter from "./routes/positionComments";
import authRouter from "./routes/auth";
import gamesRouter from "./routes/games";
import trainRouter from "./routes/train";
import errorHandler from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";
import { ensureDefaultUserAndMigrateData } from "./services/authService";
import { ensureDatabaseIndexes } from "./db/indexes";
import { startGamesAutoSyncScheduler } from "./services/games/autoSyncScheduler";
import { logError, logInfo, logWarn } from "./utils/logger";

const app = express();
const port = process.env.BACKEND_PORT || 3001;
const bodyParserLimit = process.env.BODY_PARSER_LIMIT || "100mb";
const defaultCorsOrigins = ["http://localhost:3002", "http://127.0.0.1:3002"];
const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");
const configuredCorsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);
const allowedCorsOrigins = configuredCorsOrigins.length > 0 ? configuredCorsOrigins : defaultCorsOrigins;

app.use(
  express.json({
    limit: bodyParserLimit,
    type: ["application/json", "text/plain"],
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: bodyParserLimit,
  })
);
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedCorsOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use("/auth", authRouter);
app.use(authMiddleware);
app.use("/repertoires", repertoiresRouter);
app.use("/studies", studiesRouter);
app.use("/paths", paths);
app.use("/positions", positionsRouter);
app.use("/games", gamesRouter);
app.use("/train", trainRouter);

app.use(errorHandler);

export default app;

const closeHttpServer = async (server: Server): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

if (require.main === module) {
  const run = async () => {
    await connectDB();
    await ensureDatabaseIndexes(getDB());
    await ensureDefaultUserAndMigrateData();
    const scheduler = startGamesAutoSyncScheduler();
    const server = app.listen(port, () => {
      logInfo(`Server listening at http://localhost:${port}`);
    });

    let shutdownPromise: Promise<void> | null = null;
    const handleShutdown = (signal: NodeJS.Signals): Promise<void> => {
      if (shutdownPromise) {
        return shutdownPromise;
      }
      logInfo(`Received ${signal}, shutting down gracefully`);
      shutdownPromise = (async () => {
        let exitCode = 0;
        try {
          const completed = await scheduler.stop();
          if (!completed) {
            logWarn("Games auto-sync shutdown timed out");
          }
        } catch (error) {
          exitCode = 1;
          logError("Failed to stop games auto-sync scheduler", error);
        }
        try {
          await closeHttpServer(server);
        } catch (error) {
          exitCode = 1;
          logError("Failed to close HTTP server", error);
        }
        try {
          await disconnectDB();
        } catch (error) {
          exitCode = 1;
          logError("Failed to disconnect database", error);
        }
        process.exit(exitCode);
      })();
      return shutdownPromise;
    };

    process.on("SIGINT", () => {
      void handleShutdown("SIGINT");
    });
    process.on("SIGTERM", () => {
      void handleShutdown("SIGTERM");
    });
  };

  run().catch((error) => {
    logError("Backend startup failed", error);
    process.exit(1);
  });
}
