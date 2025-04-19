import React from "react";

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
  <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-800 bg-slate-900">
    <span className="font-semibold">Filter by tag:</span>
    {selectedTags.map((tag) => (
      <span key={tag} className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
        {tag}
        <button
          className="ml-1 text-white hover:text-red-300"
          onClick={() => onTagRemove(tag)}
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      </span>
    ))}
    <input
      className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-100 w-40"
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
      <button
        className="px-2 py-1 bg-blue-600 text-white rounded"
        onClick={() => onTagSelect(tagFilter)}
      >
        Add Tag
      </button>
    )}
  </div>
);

export default TagFilterBar;
