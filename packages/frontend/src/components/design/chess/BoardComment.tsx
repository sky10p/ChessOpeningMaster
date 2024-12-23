import React from "react";
import { Textarea } from "@headlessui/react";

interface BoardCommentProps {
  comment: string;
  updateComment: (comment: string) => void;
  editable?: boolean;
}

export const BoardComment: React.FC<BoardCommentProps> = ({
  editable = true,
  comment,
  updateComment,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateComment(event.target.value);
  };

  return (
    <div className="p-4 bg-gray-800 rounded shadow-md h-full w-full">
      {!editable && (!comment || comment === "") ? (
        <p className="text-sm text-gray-400">No comments</p>
      ) : (
        <Textarea
          className="w-full h-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Add a comment to the current position"
          rows={10}
          disabled={!editable}
          value={comment}
          onChange={handleChange}
        />
      )}
    </div>
  );
};
