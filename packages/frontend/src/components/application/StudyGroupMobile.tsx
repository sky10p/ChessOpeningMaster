import React, { useMemo, useState } from "react";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Input, TabButton, Tabs } from "../ui";
import { StudyGroup } from "../../pages/StudiesPage/models";

interface MobileGroupProps {
  groups: StudyGroup[];
  activeGroupId: string;
  onSelectGroup: (id: string) => void;
  addGroup: (name: string) => void;
  editGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
}

const StudyGroupMobile: React.FC<MobileGroupProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  addGroup,
  editGroup,
  deleteGroup,
}) => {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeGroup = useMemo(
    () => groups.find((item) => item.id === activeGroupId) || null,
    [groups, activeGroupId]
  );

  const handleStartEdit = () => {
    if (!activeGroup) {
      return;
    }

    setEditingId(activeGroup.id);
    setEditName(activeGroup.name);
    setError(null);
    setShowEdit(true);
  };

  const handleDelete = () => {
    if (!activeGroupId) {
      return;
    }

    deleteGroup(activeGroupId);
  };

  return (
    <div className="border-b border-border-subtle bg-surface px-3 py-3">
      {!showNew && !showEdit && (
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Study Groups
              </div>
              <div className="mt-1 truncate text-sm text-text-muted">
                {activeGroup ? activeGroup.name : "No group selected"} · {groups.length}{" "}
                {groups.length === 1 ? "group" : "groups"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <IconButton label="New group" onClick={() => setShowNew(true)}>
                <PlusIcon className="h-4 w-4" />
              </IconButton>
              <IconButton label="Edit group" onClick={handleStartEdit} disabled={!activeGroupId}>
                <PencilIcon className="h-4 w-4" />
              </IconButton>
              <IconButton
                label="Delete group"
                onClick={handleDelete}
                disabled={!activeGroupId}
                className="hover:text-danger"
              >
                <TrashIcon className="h-4 w-4" />
              </IconButton>
            </div>
          </div>

          <Tabs variant="pill" className="gap-1 overflow-x-auto p-0">
            {groups.map((group) => (
              <TabButton
                key={group.id}
                variant="pill"
                active={group.id === activeGroupId}
                className="shrink-0"
                onClick={() => onSelectGroup(group.id)}
              >
                {group.name}
              </TabButton>
            ))}
          </Tabs>
        </div>
      )}

      {showNew && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
            New Group
          </div>
          <Input
            size="sm"
            placeholder="New group name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            autoFocus
          />
          {error && <span className="text-xs text-danger">{error}</span>}
          <div className="flex gap-2">
            <Button
              type="button"
              intent="primary"
              size="sm"
              className="flex-1 justify-center"
              onClick={() => {
                if (newName.trim()) {
                  addGroup(newName);
                  setShowNew(false);
                  setNewName("");
                  setError(null);
                  return;
                }

                setError("Group name is required");
              }}
            >
              Add
            </Button>
            <Button
              type="button"
              intent="secondary"
              size="sm"
              className="flex-1 justify-center"
              onClick={() => {
                setShowNew(false);
                setNewName("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
            Edit Group
          </div>
          <Input
            size="sm"
            placeholder="Edit group name"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            autoFocus
          />
          {error && <span className="text-xs text-danger">{error}</span>}
          <div className="flex gap-2">
            <Button
              type="button"
              intent="primary"
              size="sm"
              className="flex-1 justify-center"
              onClick={() => {
                if (editingId && editName.trim()) {
                  editGroup(editingId, editName);
                  setShowEdit(false);
                  setEditName("");
                  setEditingId(null);
                  setError(null);
                  return;
                }

                setError("Group name is required");
              }}
            >
              Save
            </Button>
            <Button
              type="button"
              intent="secondary"
              size="sm"
              className="flex-1 justify-center"
              onClick={() => {
                setShowEdit(false);
                setEditName("");
                setEditingId(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupMobile;
