import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/chess_opening_master";
const client = new MongoClient(uri);

let isConnected = false;

export async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client;
}

export async function disconnectDB() {
  if (isConnected) {
    await client.close();
    isConnected = false;
  }
}

export function getDB(dbName = "chess-opening-master") {
  return client.db(dbName);
}
