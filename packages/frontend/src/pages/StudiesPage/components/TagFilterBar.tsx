import React, { memo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Badge, Button, IconButton, Input } from "../../../components/ui";

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
  <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-surface px-3 py-3 sm:px-5">
    <span className="text-sm text-text-muted">Filter by tag:</span>
    {selectedTags.map((tag) => (
      <Badge key={tag} variant="brand" size="sm" className="flex items-center gap-1">
        {tag}
        <IconButton
          label={`Remove tag ${tag}`}
          className="h-5 w-5 rounded-full p-0 hover:text-danger"
          onClick={() => onTagRemove(tag)}
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </IconButton>
      </Badge>
    ))}
    <Input
      size="sm"
      className="min-w-[12rem] flex-1 sm:max-w-xs"
      placeholder="Type to filter or add tag"
      value={tagFilter}
      onChange={onTagInput}
      list="tag-suggestions"
    />
    <datalist id="tag-suggestions">
      {allTags
        .filter((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()) && !selectedTags.includes(tag))
        .map((tag) => (
          <option key={tag} value={tag} />
        ))}
    </datalist>
    {tagFilter && allTags.includes(tagFilter) && !selectedTags.includes(tagFilter) && (
      <Button type="button" intent="primary" size="sm" onClick={() => onTagSelect(tagFilter)}>
        Add Tag
      </Button>
    )}
  </div>
);

export default memo(TagFilterBar);
