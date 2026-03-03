import { Db } from "mongodb";
import { ensureDefaultUserInDb } from "../../../services/authService";
import { MigrationDefinition } from "../types";

const legacyCollections = ["repertoires", "studies", "positions", "variantsInfo"];
const missingUserScopeFilter = {
  $or: [{ userId: { $exists: false } }, { userId: null }],
};

export const migration: MigrationDefinition = {
  id: "20260303123000_backfill_legacy_user_scope",
  name: "backfill legacy user scope",
  up: async (db: Db) => {
    const defaultUserId = await ensureDefaultUserInDb(db);

    await Promise.all(
      legacyCollections.map((collectionName) =>
        db.collection(collectionName).updateMany(missingUserScopeFilter, {
          $set: {
            userId: defaultUserId,
          },
        })
      )
    );
  },
};
