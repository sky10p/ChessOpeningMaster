import express from "express";
import cors from "cors";
import { connectDB, getDB } from "./db/mongo";
import repertoiresRouter from "./routes/repertoires";
import studiesRouter from "./routes/studies";
import paths from "./routes/paths";
import positionsRouter from "./routes/positionComments";
import authRouter from "./routes/auth";
import errorHandler from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";
import { ensureDefaultUserAndMigrateData } from "./services/authService";
import { ensureDatabaseIndexes } from "./db/indexes";

const app = express();
const port = process.env.BACKEND_PORT || 3001;
const defaultCorsOrigins = ["http://localhost:3002", "http://127.0.0.1:3002"];
const configuredCorsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedCorsOrigins = configuredCorsOrigins.length > 0 ? configuredCorsOrigins : defaultCorsOrigins;

app.use(
  express.json({
    limit: "100mb",
    type: ["application/json", "text/plain"],
  })
);
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedCorsOrigins.includes(origin)) {
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

app.use(errorHandler);

export default app;

if (require.main === module) {
  connectDB().then(async () => {
    await ensureDatabaseIndexes(getDB());
    await ensureDefaultUserAndMigrateData();
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  });
}
