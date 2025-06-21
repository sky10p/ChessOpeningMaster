import { connectDB } from "../db/mongo";
import { migrateAllRepertoireComments } from "../services/positionCommentService";
import readline from "readline";

const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const runMigration = async () => {
  try {
    console.log("Connecting to database...");
    const client = await connectDB();
    
    const interactiveMode = process.argv[2] === "interactive";
    const conflictStrategy = interactiveMode 
      ? "interactive" 
      : (process.argv[2] as "keep_newest" | "keep_longest" | "merge" | "interactive" || "keep_longest");
    
    console.log(`Using conflict strategy: ${conflictStrategy}`);
    
    console.log("Starting migration of repertoire comments to position comments...");
    console.log("Note: Comments will be preserved in repertoires during migration.");
    
    const migrationResults = await migrateAllRepertoireComments(
      conflictStrategy as "keep_newest" | "keep_longest" | "merge" | "interactive",
      askQuestion
    );
    
    console.log(`Migration completed successfully!`);
    console.log(`Processed ${migrationResults.processedRepertoires} repertoires`);
    console.log(`Migrated ${migrationResults.migratedComments} comments`);
    console.log(`Resolved ${migrationResults.conflicts} conflicts`);
    
    await client.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigration();
