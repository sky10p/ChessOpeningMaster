import React, { memo } from "react";
import { Badge, Button, Input } from "../../../components/ui";

interface TagFilterBarProps {
  allTags: string[];
  selectedTags: string[];
  tagFilter: string;
  onTagInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

const TagFilterBar: React.FC<TagFilterBarProps> = ({
  allTags,
  selectedTags,
  tagFilter,
  onTagInput,
  onTagSelect,
  onTagRemove,
}) => (
  <div className="flex flex-wrap items-center gap-2 p-4 border-b border-border-default bg-surface">
    <span className="font-semibold text-text-base">Filter by tag:</span>
    {selectedTags.map((tag) => (
      <Badge key={tag} variant="brand" size="sm" className="flex items-center gap-1">
        {tag}
        <button
          className="ml-1 hover:text-danger"
          onClick={() => onTagRemove(tag)}
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      </Badge>
    ))}
    <Input
      size="sm"
      className="w-40"
      placeholder="Type to filter or add tag"
      value={tagFilter}
      onChange={onTagInput}
      list="tag-suggestions"
    />
    <datalist id="tag-suggestions">
      {allTags
        .filter((t) => t.toLowerCase().includes(tagFilter.toLowerCase()) && !selectedTags.includes(t))
        .map((t) => (
          <option key={t} value={t} />
        ))}
    </datalist>
    {tagFilter && allTags.includes(tagFilter) && !selectedTags.includes(tagFilter) && (
      <Button intent="primary" size="sm" onClick={() => onTagSelect(tagFilter)}>
        Add Tag
      </Button>
    )}
  </div>
);

export default memo(TagFilterBar);
