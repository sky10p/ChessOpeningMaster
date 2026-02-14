import { connectDB, getDB } from "../db/mongo";
import { ensureDatabaseIndexes } from "../db/indexes";

const createIndexes = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    const db = getDB();
    
    console.log("Creating database indexes...");
    await ensureDatabaseIndexes(db);
    
    console.log("Indexes created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to create indexes:", error);
    process.exit(1);
  }
};

createIndexes();
