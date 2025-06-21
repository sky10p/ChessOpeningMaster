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
  if (!orientation) {
    throw new Error("Orientation parameter is required for extractComments");
  }

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
        
    const comments = extractComments(
      repertoire.moveNodes, 
      new Map(), 
      orientation || "white"
    );

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
      console.log(`Resolving conflict for position ${fen} with ${commentsList.length} comments from repertoires and ${existing ? 'existing' : 'no existing'} position comment`);
      finalComment = await resolveConflict(
        conflictStrategy,
        commentsList,
        existing,
        fen,
        askQuestion
      );
      console.log(`Conflict resolved. Final comment: "${finalComment}"`);
    } else {
      finalComment = commentsList[0].comment;
      console.log(`No conflict for position ${fen}. Using single comment: "${finalComment}"`);
    }

    console.log(
      `Migrating position ${fen} with comment: "${finalComment}" (conflict strategy: ${conflictStrategy})`
    );
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
    console.log(
      `Position ${fen} migrated successfully with comment: "${finalComment}"`
    );

    migratedComments++;
  }
  if (bulkOperations.length > 0) {
    console.log(
      `Executing bulk write for ${bulkOperations.length} position updates...`
    );
    try {
      const result = await positionsCollection.bulkWrite(bulkOperations, { ordered: false });
      console.log("Bulk write completed successfully.", {
        insertedCount: result.insertedCount,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      });
    } catch (error) {
      console.error("Bulk write failed:", error);
      throw error;
    }
  } else {
    console.log("No operations to execute.");
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

  const options: string[] = [];
  let optionIndex = 1;

  if (existing && existing.comment) {
    console.log(`Existing position comment: "${existing.comment}"`);
    options.push(`${optionIndex}. Keep existing position comment`);
    optionIndex++;
  }

  commentsList.forEach((comment, index) => {
    console.log(
      `Comment ${index + 1} from repertoire ${comment.repertoireId}: "${
        comment.comment
      }"`
    );
    options.push(`${optionIndex}. Keep comment from repertoire ${index + 1}`);
    optionIndex++;
  });

  options.push(`${optionIndex}. Merge all comments`);
  options.push(`${optionIndex + 1}. Enter custom comment`);

  console.log("\nOptions:");
  options.forEach((option) => console.log(option));

  const answer = await askQuestion("\nEnter your choice (number): ");
  const choice = parseInt(answer);
  
  console.log(`User selected choice: ${choice} (raw input: "${answer}")`);

  let currentOption = 1;

  if (existing && existing.comment) {
    if (choice === currentOption) {
      console.log("Keeping existing position comment");
      return existing.comment;
    }
    currentOption++;
  }

  for (let i = 0; i < commentsList.length; i++) {
    if (choice === currentOption) {
      console.log(`Keeping comment from repertoire ${i + 1}: "${commentsList[i].comment}"`);
      return commentsList[i].comment;
    }
    currentOption++;
  }

  if (choice === currentOption) {
    console.log("Merging all comments");
    return resolveMergeConflict(commentsList, existing);
  }
  currentOption++;

  if (choice === currentOption) {
    console.log("Entering custom comment");
    return await askQuestion("Enter your custom comment: ");
  }
  console.log("Invalid choice, using merge strategy as default");
  return resolveMergeConflict(commentsList, existing);
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
