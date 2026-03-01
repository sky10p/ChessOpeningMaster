import React from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Button, EmptyState } from "../../../../components/ui";
import { StudyEntry } from "../../models";

interface EntryListProps {
  entries: StudyEntry[];
  onEditEntry: (entry: StudyEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

const EntryList: React.FC<EntryListProps> = ({
  entries,
  onEditEntry,
  onDeleteEntry,
}) => {
  if ((entries || []).length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="No entries yet"
        description="Add your first study entry to start building this resource."
      />
    );
  }

  return (
    <ol className="space-y-3">
      {(entries || []).map((entry, idx) => (
        <li key={entry.id} className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-raised p-3 md:flex-row md:items-start md:gap-4">
          <span className="text-sm font-bold text-text-subtle">{idx + 1}.</span>
          <div className="min-w-0 flex-1">
            <div className="break-words font-semibold text-text-base">{entry.title}</div>
            {entry.description && <div className="mt-1 break-words text-sm text-text-muted">{entry.description}</div>}
            {entry.externalUrl && (
              <a
                href={entry.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-brand underline"
              >
                View external study
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button type="button" intent="secondary" size="xs" onClick={() => onEditEntry(entry)}>
              Edit
            </Button>
            <Button type="button" intent="danger" size="xs" onClick={() => onDeleteEntry(entry.id)}>
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default EntryList;
