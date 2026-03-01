import React, { useState, useCallback } from "react";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Input } from "../../../components/ui";
import { cn } from "../../../utils/cn";
import { StudyGroup } from "../models";

interface StudyGroupSidebarProps {
  groups: StudyGroup[];
  activeGroupId: string;
  onSelectGroup: (id: string) => void;
  onShowNewGroup: () => void;
  showNewGroup: boolean;
  newGroupName: string;
  onNewGroupNameChange: (value: string) => void;
  onAddGroup: () => void;
  onCancelNewGroup: () => void;
  groupError: string | null;
  onEditGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
}

const StudyGroupSidebar: React.FC<StudyGroupSidebarProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onShowNewGroup,
  showNewGroup,
  newGroupName,
  onNewGroupNameChange,
  onAddGroup,
  onCancelNewGroup,
  groupError,
  onEditGroup,
  onDeleteGroup,
}) => {
  const [editingGroup, setEditingGroup] = useState<{ id: string; name: string } | null>(null);

  const handleEditClick = useCallback((id: string, name: string) => {
    setEditingGroup({ id, name });
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingGroup(null);
  }, []);

  const handleEditSave = useCallback((id: string, name: string) => {
    onEditGroup(id, name);
    setEditingGroup(null);
  }, [onEditGroup]);

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingGroup) {
      setEditingGroup({ ...editingGroup, name: event.target.value });
    }
  }, [editingGroup]);

  const handleDeleteGroup = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      onDeleteGroup(id);
    }
  }, [onDeleteGroup]);

  return (
    <aside className="flex h-full w-72 min-w-[18rem] flex-col border-r border-border-default bg-surface">
      <div className="border-b border-border-subtle px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Workspace</div>
        <h2 className="mt-1 text-sm font-semibold text-text-base">Study Groups</h2>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-3">
        {groups.map((group) => (
          <li key={group.id} className="flex flex-col gap-1">
            {editingGroup?.id === group.id ? (
              <div className="flex flex-col gap-2 rounded-xl border border-border-default bg-surface-raised p-3">
                <Input
                  size="sm"
                  value={editingGroup.name}
                  onChange={handleNameChange}
                  autoFocus
                  aria-label={`Edit group name for ${editingGroup.name}`}
                />
                <div className="flex items-center gap-2">
                  <Button type="button" intent="primary" size="xs" onClick={() => handleEditSave(group.id, editingGroup.name)}>
                    Save
                  </Button>
                  <Button type="button" intent="secondary" size="xs" onClick={handleEditCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "group flex items-center rounded-xl px-3 py-3 transition-colors",
                  activeGroupId === group.id
                    ? "bg-brand/15 text-brand"
                    : "text-text-muted hover:bg-interactive hover:text-text-base"
                )}
              >
                <Button
                  type="button"
                  intent="ghost"
                  size="sm"
                  className="h-auto flex-1 justify-start truncate px-0 py-0 text-left text-sm font-medium hover:bg-transparent"
                  onClick={() => onSelectGroup(group.id)}
                >
                  {group.name}
                </Button>
                <div className="ml-2 flex items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <IconButton
                    label="Edit group"
                    onClick={() => handleEditClick(group.id, group.name)}
                    className="text-text-muted hover:text-text-base"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    label="Delete group"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-text-muted hover:text-danger"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="border-t border-border-subtle p-3">
        {showNewGroup ? (
          <div className="flex flex-col gap-2 rounded-xl border border-border-default bg-surface-raised p-3">
            <Input
              size="sm"
              placeholder="New group name"
              value={newGroupName}
              onChange={(event) => onNewGroupNameChange(event.target.value)}
              autoFocus
            />
            {groupError && <span className="px-1 text-xs text-danger">{groupError}</span>}
            <div className="flex gap-2">
              <Button type="button" intent="primary" size="xs" onClick={onAddGroup}>
                Add
              </Button>
              <Button type="button" intent="secondary" size="xs" onClick={onCancelNewGroup}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" intent="primary" size="sm" className="w-full justify-center" onClick={onShowNewGroup}>
            <PlusIcon className="h-4 w-4" />
            New Group
          </Button>
        )}
      </div>
    </aside>
  );
};

export default React.memo(StudyGroupSidebar);
