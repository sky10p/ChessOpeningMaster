import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/chess_opening_master";
const client = new MongoClient(uri);
const defaultDbName = process.env.MONGODB_DB_NAME || process.env.MONGO_DB_NAME || "chess-opening-master";

let isConnected = false;

export async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client;
}

export function getMongoClient() {
  return client;
}

export async function disconnectDB() {
  if (isConnected) {
    await client.close();
    isConnected = false;
  }
}

export function getDB(dbName = defaultDbName) {
  return client.db(dbName);
}
