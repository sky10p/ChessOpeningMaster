import { connectDB } from "../db/mongo";
import { migrateAllRepertoireComments } from "../services/positionCommentService";
import readline from "readline";

const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const timeout = setTimeout(() => {
      rl.close();
      reject(new Error('Input timeout - no response received within 30 seconds'));
    }, 30000);

    rl.question(question, (answer) => {
      clearTimeout(timeout);
      rl.close();
      const trimmedAnswer = answer.trim();
      console.log(`Received input: "${trimmedAnswer}"`);
      resolve(trimmedAnswer);
    });

    rl.on('error', (error) => {
      clearTimeout(timeout);
      rl.close();
      reject(error);
    });

    rl.on('SIGINT', () => {
      clearTimeout(timeout);
      rl.close();
      reject(new Error('Process interrupted by user'));
    });
  });
};

const runMigration = async () => {
  let client;

  try {
    console.log("Connecting to database...");
    client = await connectDB();

    const interactiveMode = process.argv[2] === "interactive";
    const conflictStrategy = interactiveMode
      ? "interactive"
      : (process.argv[2] as
          | "keep_newest"
          | "keep_longest"
          | "merge"
          | "interactive") || "keep_longest";

    console.log(`Using conflict strategy: ${conflictStrategy}`);

    console.log(
      "Starting migration of repertoire comments to position comments..."
    );
    console.log(
      "Note: Comments will be preserved in repertoires during migration."
    );

    const migrationResults = await migrateAllRepertoireComments(
      conflictStrategy as
        | "keep_newest"
        | "keep_longest"
        | "merge"
        | "interactive",
      askQuestion
    );
    console.log(`Migration completed successfully!`);
    console.log(
      `Processed ${migrationResults.processedRepertoires} repertoires`
    );
    console.log(`Migrated ${migrationResults.migratedComments} comments`);
    console.log(`Resolved ${migrationResults.conflicts} conflicts`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
      console.log("Database connection closed.");
    }
  }
};

runMigration();
