import { connectDB, getDB } from "../db/mongo";

const createIndexes = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    const db = getDB();
    
    console.log("Creating index for positions collection...");
    await db.collection("positions").createIndex({ fen: 1 }, { unique: true });
    
    console.log("Indexes created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to create indexes:", error);
    process.exit(1);
  }
};

createIndexes();
