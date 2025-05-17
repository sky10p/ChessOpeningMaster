import React from "react";
import { StudyEntry } from "../../models";

interface EntryListProps {
  entries: StudyEntry[];
  onEditEntry: (entry: StudyEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

const EntryList: React.FC<EntryListProps> = ({ 
  entries, 
  onEditEntry, 
  onDeleteEntry 
}) => {
  return (
    <ol className="space-y-3">
      {(entries || []).map((entry, idx) => (
        <li key={entry.id} className="bg-slate-900 rounded p-2 sm:p-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <span className="font-bold text-slate-400">{idx + 1}.</span>
          <div className="flex-1">
            <div className="font-semibold text-white break-words">{entry.title}</div>
            <div className="text-slate-300 text-sm mb-1 break-words">{entry.description}</div>
            <a
              href={entry.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline text-xs"
            >
              View External Study ↗
            </a>
          </div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 bg-yellow-600 text-white rounded text-xs"
              onClick={() => onEditEntry(entry)}
            >
              Edit
            </button>
            <button
              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
              onClick={() => onDeleteEntry(entry.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
      {(entries || []).length === 0 && (
        <li className="text-slate-400 text-sm">No studies yet.</li>
      )}
    </ol>
  );
};

export default EntryList;
