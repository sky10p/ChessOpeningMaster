import React, { useState, useCallback } from "react";
import { StudyGroup } from "../models";

interface StudyGroupSidebarProps {
  groups: StudyGroup[];
  activeGroupId: string;
  onSelectGroup: (id: string) => void;
  onShowNewGroup: () => void;
  showNewGroup: boolean;
  newGroupName: string;
  onNewGroupNameChange: (v: string) => void;
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
  const [editingGroup, setEditingGroup] = useState<{ id: string, name: string } | null>(null);

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

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingGroup) {
      setEditingGroup({ ...editingGroup, name: e.target.value });
    }
  }, [editingGroup]);

  const handleDeleteGroup = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      onDeleteGroup(id);
    }
  }, [onDeleteGroup]);

  return (
    <aside className="w-64 min-w-[220px] bg-slate-900 border-r border-slate-800 flex flex-col p-4 rounded-lg mt-2 mb-2">
      <h2 className="text-lg font-bold mb-4">Study Groups</h2>
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {groups.map((group) => (
          <li key={group.id} className="flex items-center">
            {editingGroup?.id === group.id ? (
              <div className="flex-1 flex flex-col gap-1">
                <input
                  className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-100 w-full"
                  value={editingGroup.name}
                  onChange={handleNameChange}
                  autoFocus
                  aria-label={`Edit group name for ${editingGroup.name}`}
                  role="textbox"
                />
                <div className="flex gap-1">
                  <button
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                    onClick={() => handleEditSave(group.id, editingGroup.name)}
                  >
                    Save
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-slate-700 text-white rounded"
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  className={`flex-1 text-left px-3 py-2 rounded transition-colors font-medium ${
                    activeGroupId === group.id
                      ? "bg-blue-700 text-white"
                      : "hover:bg-slate-800 text-slate-200"
                  }`}
                  onClick={() => onSelectGroup(group.id)}
                >
                  {group.name}
                </button>
                <button
                  className="ml-1 px-2 py-1 text-xs text-yellow-400 hover:text-yellow-200"
                  title="Edit group"
                  onClick={() => handleEditClick(group.id, group.name)}
                >
                  ✎
                </button>
                <button
                  className="ml-1 px-2 py-1 text-xs text-red-400 hover:text-red-200"
                  title="Delete group"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  🗑
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        {showNewGroup ? (
          <div className="flex flex-col gap-2">
            <input
              className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-100"
              placeholder="New group name"
              value={newGroupName}
              onChange={(e) => onNewGroupNameChange(e.target.value)}
              autoFocus
            />
            {groupError && <span className="text-red-400 text-xs">{groupError}</span>}
            <div className="flex gap-2">
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded"
                onClick={onAddGroup}
              >
                Add
              </button>
              <button
                className="px-2 py-1 bg-slate-700 text-white rounded"
                onClick={onCancelNewGroup}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="w-full px-2 py-1 bg-blue-700 text-white rounded mt-2"
            onClick={onShowNewGroup}
          >
            + New Group
          </button>
        )}
      </div>
    </aside>
  );
};

export default React.memo(StudyGroupSidebar);
