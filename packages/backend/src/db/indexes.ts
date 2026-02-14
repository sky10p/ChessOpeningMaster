import { Db } from "mongodb";

export async function ensureDatabaseIndexes(db: Db): Promise<void> {
  const positionsCollection = db.collection("positions");
  const existingPositionIndexes = await positionsCollection.indexes();
  const hasLegacyFenUniqueIndex = existingPositionIndexes.some(
    (index) => index.name === "fen_1" && index.unique === true && index.key?.fen === 1 && Object.keys(index.key || {}).length === 1
  );

  if (hasLegacyFenUniqueIndex) {
    await positionsCollection.dropIndex("fen_1");
  }

  await Promise.all([
    positionsCollection.createIndex({ fen: 1, userId: 1 }, { unique: true }),
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("authTokens").createIndex({ token: 1 }, { unique: true }),
    db.collection("authTokens").createIndex({ userId: 1 }),
    db.collection("authTokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("repertoires").createIndex({ userId: 1 }),
    db.collection("studies").createIndex({ userId: 1 }),
    db.collection("positions").createIndex({ userId: 1 }),
    db.collection("variantsInfo").createIndex({ userId: 1 }),
    db.collection("variantsInfo").createIndex({ repertoireId: 1, userId: 1 }),
  ]);
}