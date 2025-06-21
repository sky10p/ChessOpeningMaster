import { BoardOrientation, getOrientationAwareFen } from "@chess-opening-master/common";
import { getDB } from "../db/mongo";
import { MoveNode } from "../models/Repertoire";

interface CommentData {
  comment: string;
  repertoireId: string;
  updatedAt?: Date;
}

interface PositionDocument {
  comment?: string;
  fen?: string;
  updatedAt?: Date;
  createdAt?: Date;
  [key: string]: unknown;
}

export const extractComments = (
  moveNode: MoveNode,
  comments: Map<string, CommentData[]> = new Map(),
  orientation: BoardOrientation
): Map<string, CommentData[]> => {
  if (moveNode.move && moveNode.comment) {
    const fen = getOrientationAwareFen(moveNode.move.after, orientation);
    if (!comments.has(fen)) {
      comments.set(fen, []);
    }
    const commentsForFen = comments.get(fen);
    if (commentsForFen) {
      commentsForFen.push({
        comment: moveNode.comment,
        repertoireId: "",
      });
    }
  }

  if (moveNode.children) {
    for (const child of moveNode.children) {
      extractComments(child, comments, orientation);
    }
  }

  return comments;
};

export const migrateAllRepertoireComments = async (
  conflictStrategy:
    | "keep_newest"
    | "keep_longest"
    | "merge"
    | "interactive" = "keep_longest",
  askQuestion?: (question: string) => Promise<string>
): Promise<{
  migratedComments: number;
  conflicts: number;
  processedRepertoires: number;
}> => {
  const db = getDB();
  const repertoireCollection = db.collection("repertoires");
  const positionsCollection = db.collection("positions");

  const repertoires = await repertoireCollection.find().toArray();
  let migratedComments = 0;
  let conflicts = 0;
  const allComments = new Map<string, CommentData[]>();

  for (const repertoire of repertoires) {
    const orientation = repertoire.orientation;
    const comments = extractComments(repertoire.moveNodes, new Map(), orientation);

    comments.forEach((commentsList, fen) => {
      if (!allComments.has(fen)) {
        allComments.set(fen, []);
      }
      commentsList.forEach((commentObj) => {
        const commentsForFen = allComments.get(fen);
        if (commentsForFen) {
          commentsForFen.push({
            ...commentObj,
            repertoireId: repertoire._id.toString(),
            updatedAt: repertoire.updatedAt || new Date(),
          });
        }
      });
    });
  }
  const fensToCheck = Array.from(allComments.keys());
  const existingPositions = await positionsCollection
    .find({ fen: { $in: fensToCheck } })
    .toArray();
  const existingPositionsMap = new Map(
    existingPositions.map((pos) => [pos.fen, pos])
  );

  const bulkOperations = [];

  for (const [fen, commentsList] of allComments.entries()) {
    const existing = existingPositionsMap.get(fen) as PositionDocument | null;
    let finalComment: string;

    if (commentsList.length > 1 || (existing && existing.comment)) {
      conflicts++;
      finalComment = await resolveConflict(
        conflictStrategy,
        commentsList,
        existing,
        fen,
        askQuestion
      );
    } else {
      finalComment = commentsList[0].comment;
    }

    bulkOperations.push({
      updateOne: {
        filter: { fen },
        update: {
          $set: {
            comment: finalComment,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    });

    migratedComments++;
  }

  if (bulkOperations.length > 0) {
    await positionsCollection.bulkWrite(bulkOperations, { ordered: false });
  }

  return {
    migratedComments,
    conflicts,
    processedRepertoires: repertoires.length,
  };
};

const resolveNewestConflict = (commentsList: CommentData[]): string => {
  const newestComment = commentsList.reduce((prev, current) => {
    return (prev.updatedAt || new Date(0)) > (current.updatedAt || new Date(0))
      ? prev
      : current;
  });
  return newestComment.comment;
};

const resolveLongestConflict = (commentsList: CommentData[]): string => {
  const longestComment = commentsList.reduce((prev, current) => {
    return prev.comment.length > current.comment.length ? prev : current;
  });
  return longestComment.comment;
};

const resolveMergeConflict = (
  commentsList: CommentData[],
  existing: PositionDocument | null
): string => {
  let mergedComment = commentsList.map((c) => c.comment).join("\n\n");
  if (existing && existing.comment) {
    mergedComment = `${existing.comment}\n\n${mergedComment}`;
  }
  return mergedComment;
};

const resolveInteractiveConflict = async (
  commentsList: CommentData[],
  existing: PositionDocument | null,
  fen: string,
  askQuestion: (question: string) => Promise<string>
): Promise<string> => {
  console.log(`\nConflict found for position: ${fen}`);

  if (existing && existing.comment) {
    console.log(`Existing position comment: "${existing.comment}"`);
  }

  commentsList.forEach((comment, index) => {
    console.log(
      `Comment ${index + 1} from repertoire ${comment.repertoireId}: "${
        comment.comment
      }"`
    );
  });

  const options = [
    "1. Keep existing position comment",
    ...commentsList.map(
      (_, i) => `${i + 2}. Keep comment from repertoire ${i + 1}`
    ),
    `${commentsList.length + 2}. Merge all comments`,
    `${commentsList.length + 3}. Enter custom comment`,
  ];

  console.log("\nOptions:");
  options.forEach((option) => console.log(option));

  const answer = await askQuestion("\nEnter your choice (number): ");
  const choice = parseInt(answer);

  if (choice === 1 && existing && existing.comment) {
    return existing.comment;
  } else if (choice >= 2 && choice <= commentsList.length + 1) {
    return commentsList[choice - 2].comment;
  } else if (choice === commentsList.length + 2) {
    return resolveMergeConflict(commentsList, existing);
  } else if (choice === commentsList.length + 3) {
    return await askQuestion("Enter your custom comment: ");
  } else {
    console.log("Invalid choice, using merge strategy as default");
    return resolveMergeConflict(commentsList, existing);
  }
};

const resolveConflict = async (
  conflictStrategy: "keep_newest" | "keep_longest" | "merge" | "interactive",
  commentsList: CommentData[],
  existing: PositionDocument | null,
  fen: string,
  askQuestion?: (question: string) => Promise<string>
): Promise<string> => {
  if (conflictStrategy === "interactive" && askQuestion) {
    return resolveInteractiveConflict(commentsList, existing, fen, askQuestion);
  }

  if (conflictStrategy === "keep_newest") {
    return resolveNewestConflict(commentsList);
  }

  if (conflictStrategy === "keep_longest") {
    return resolveLongestConflict(commentsList);
  }

  return resolveMergeConflict(commentsList, existing);
};

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
