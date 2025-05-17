import { getDB } from "../db/mongo";
import { MoveNode } from "../models/Repertoire";

export const extractComments = (
  moveNode: MoveNode,
  comments: Map<string, { comment: string; repertoireId: string }[]> = new Map()
): Map<string, { comment: string; repertoireId: string }[]> => {
  if (moveNode.move && moveNode.comment) {    const fen = moveNode.move.after;
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
      extractComments(child, comments);
    }
  }

  return comments;
};

export const migrateAllRepertoireComments = async (
  conflictStrategy: "keep_newest" | "keep_longest" | "merge" | "interactive" = "keep_longest",
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
  
  const allComments = new Map<string, { comment: string; repertoireId: string; updatedAt?: Date }[]>();

  for (const repertoire of repertoires) {
    const comments = extractComments(repertoire.moveNodes);
    
    comments.forEach((commentsList, fen) => {
      if (!allComments.has(fen)) {
        allComments.set(fen, []);
      }
        commentsList.forEach(commentObj => {
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

  for (const [fen, commentsList] of allComments.entries()) {
    const existing = await positionsCollection.findOne({ fen });
    let finalComment: string;
    
    if (commentsList.length > 1 || (existing && existing.comment)) {
      conflicts++;
      
      if (conflictStrategy === "interactive" && askQuestion) {
        console.log(`\nConflict found for position: ${fen}`);
        
        if (existing && existing.comment) {
          console.log(`Existing position comment: "${existing.comment}"`);
        }
        
        commentsList.forEach((comment, index) => {
          console.log(`Comment ${index + 1} from repertoire ${comment.repertoireId}: "${comment.comment}"`);
        });
        
        const options = [
          "1. Keep existing position comment",
          ...commentsList.map((_, i) => `${i + 2}. Keep comment from repertoire ${i + 1}`),
          `${commentsList.length + 2}. Merge all comments`,
          `${commentsList.length + 3}. Enter custom comment`
        ];
        
        console.log("\nOptions:");
        options.forEach(option => console.log(option));
        
        const answer = await askQuestion("\nEnter your choice (number): ");
        const choice = parseInt(answer);
        
        if (choice === 1 && existing && existing.comment) {
          finalComment = existing.comment;
        } else if (choice >= 2 && choice <= commentsList.length + 1) {
          finalComment = commentsList[choice - 2].comment;
        } else if (choice === commentsList.length + 2) {
          finalComment = commentsList.map(c => c.comment).join("\n\n");
          if (existing && existing.comment) {
            finalComment = `${existing.comment}\n\n${finalComment}`;
          }
        } else if (choice === commentsList.length + 3) {
          finalComment = await askQuestion("Enter your custom comment: ");
        } else {
          console.log("Invalid choice, using merge strategy as default");
          finalComment = commentsList.map(c => c.comment).join("\n\n");
          if (existing && existing.comment) {
            finalComment = `${existing.comment}\n\n${finalComment}`;
          }
        }
      } else if (conflictStrategy === "keep_newest") {
        const newestComment = commentsList.reduce((prev, current) => {
          return (prev.updatedAt || new Date(0)) > (current.updatedAt || new Date(0))
            ? prev
            : current;
        });
        finalComment = newestComment.comment;
      } else if (conflictStrategy === "keep_longest") {
        const longestComment = commentsList.reduce((prev, current) => {
          return prev.comment.length > current.comment.length ? prev : current;
        });
        finalComment = longestComment.comment;
      } else {
        finalComment = commentsList.map(c => c.comment).join("\n\n");
        if (existing && existing.comment) {
          finalComment = `${existing.comment}\n\n${finalComment}`;
        }
      }
    } else {
      finalComment = commentsList[0].comment;
    }
    
    await positionsCollection.updateOne(
      { fen },
      {
        $set: {
          comment: finalComment,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    
    migratedComments++;
  }

  return {
    migratedComments,
    conflicts,
    processedRepertoires: repertoires.length,
  };
};

export const getPositionComment = async (fen: string): Promise<string | null> => {
  const db = getDB();
  const position = await db.collection("positions").findOne({ fen });
  
  return position ? position.comment : null;
};
