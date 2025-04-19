import React from "react";
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
}) => (
  <aside className="w-64 min-w-[220px] bg-slate-900 border-r border-slate-800 flex flex-col p-4 rounded-lg mt-2 mb-2">
    <h2 className="text-lg font-bold mb-4">Study Groups</h2>
    <ul className="flex-1 space-y-1 overflow-y-auto">
      {groups.map((g) => (
        <li key={g.id} className="group flex items-center">
          <button
            className={`flex-1 text-left px-3 py-2 rounded transition-colors font-medium ${
              activeGroupId === g.id
                ? "bg-blue-700 text-white"
                : "hover:bg-slate-800 text-slate-200"
            }`}
            onClick={() => onSelectGroup(g.id)}
          >
            {g.name}
          </button>
          <button
            className="ml-1 px-2 py-1 text-xs text-yellow-400 hover:text-yellow-200"
            title="Edit group"
            onClick={() => onEditGroup(g.id, g.name)}
          >
            ✎
          </button>
          <button
            className="ml-1 px-2 py-1 text-xs text-red-400 hover:text-red-200"
            title="Delete group"
            onClick={() => onDeleteGroup(g.id)}
          >
            🗑
          </button>
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

export default StudyGroupSidebar;
