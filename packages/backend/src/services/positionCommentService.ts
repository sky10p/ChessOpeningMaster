import { getDB } from "../db/mongo";





export const getPositionCommentsByFens = async (
  fens: string[]
): Promise<Record<string, string>> => {
  if (fens.length === 0) {
    return {};
  }

  const db = getDB();
  const positions = await db
    .collection("positions")
    .find({ fen: { $in: fens } })
    .toArray();

  const commentsMap: Record<string, string> = {};
  positions.forEach((position) => {
    if (position.comment) {
      commentsMap[position.fen] = position.comment;
    }
  });

  return commentsMap;
};

export const getPositionComment = async (
  fen: string
): Promise<string | null> => {
  const db = getDB();
  const position = await db.collection("positions").findOne({ fen });

  return position ? position.comment : null;
};

export const updatePositionComment = async (
  fen: string,
  comment: string
): Promise<void> => {
  const db = getDB();
  const positionsCollection = db.collection("positions");

  await positionsCollection.updateOne(
    { fen },
    {
      $set: {
        comment,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
};
