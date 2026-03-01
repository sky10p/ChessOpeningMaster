import React from "react";
import { Badge } from "../../../../components/ui";

interface TagDisplayProps {
  tags: string[];
}

const TagDisplay: React.FC<TagDisplayProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="default" size="sm">{tag}</Badge>
      ))}
    </div>
  );
};

export default TagDisplay;
