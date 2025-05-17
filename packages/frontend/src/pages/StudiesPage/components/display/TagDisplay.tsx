import React from "react";

interface TagDisplayProps {
  tags: string[];
}

const TagDisplay: React.FC<TagDisplayProps> = ({ tags }) => {
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {tags.map((tag) => (
        <span key={tag} className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs">{tag}</span>
      ))}
    </div>
  );
};

export default TagDisplay;
