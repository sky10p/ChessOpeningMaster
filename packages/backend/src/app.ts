import express from "express";
import cors from "cors";
import { connectDB } from "./db/mongo";
import repertoiresRouter from "./routes/repertoires";
import studiesRouter from "./routes/studies";
import paths from "./routes/paths";
import positionsRouter from "./routes/positionComments";
import positionErrorsRouter from "./routes/positionErrors";
import errorHandler from "./middleware/errorHandler";

const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(
  express.json({
    limit: "100mb",
    type: ["application/json", "text/plain"],
  })
);
app.use(cors());

app.use("/repertoires", repertoiresRouter);
app.use("/studies", studiesRouter);
app.use("/paths", paths);
app.use("/positions", positionsRouter);
app.use("/position-errors", positionErrorsRouter);

app.use(errorHandler);

export default app;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  });
}
