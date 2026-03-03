import { Db } from "mongodb";
import { MigrationDefinition } from "../types";

export const migration: MigrationDefinition = {
  id: "20260303130000_backfill_repertoire_favorites",
  name: "backfill repertoire favorites",
  up: async (db: Db) => {
    await db.collection("repertoires").updateMany(
      {
        $or: [{ favorite: { $exists: false } }, { favorite: null }],
      },
      {
        $set: {
          favorite: false,
        },
      }
    );
  },
};
