import React from "react";
import { Textarea } from "@headlessui/react";

interface BoardCommentProps {
  comment: string;
  updateComment: (comment: string) => Promise<void>;
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
    <div className="rounded-md shadow-md w-full overflow-hidden border border-border-default bg-surface">
      {!editable && (!comment || comment === "") ? (
        <div className="flex items-center justify-center h-32 text-text-subtle p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span>No comments for this position</span>
        </div>
      ) : (
        <Textarea
          className="w-full p-3 bg-surface-raised text-text-base border-0 focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-text-subtle resize-none min-h-[150px]"
          placeholder="Add notes about this position..."
          rows={6}
          disabled={!editable}
          value={comment}
          onChange={handleChange}
          style={{ 
            boxShadow: 'none', 
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />
      )}
    </div>
  );
};
