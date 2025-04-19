import React, { useState } from 'react';
import { StudyGroup } from '../../pages/StudiesPage/models';

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
  const [newName, setNewName] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mb-2">
      {!showNew && !showEdit && (
        <div className="flex items-center space-x-2">
          <select
            value={activeGroupId || ''}
            onChange={(e) => onSelectGroup(e.target.value)}
            className="flex-1 p-2 border rounded bg-background text-textLight"
          >
            <option value="" disabled>Select group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button className="p-2 bg-blue-700 text-white rounded" onClick={() => setShowNew(true)}>+</button>
          <button
            className="p-2 bg-yellow-500 text-white rounded"
            onClick={() => {
              if (activeGroupId) {
                const g = groups.find((g) => g.id === activeGroupId);
                if (g) {
                  setEditingId(g.id);
                  setEditName(g.name);
                  setShowEdit(true);
                }
              }
            }}
          >✎</button>
          <button
            className="p-2 bg-red-500 text-white rounded"
            onClick={() => activeGroupId && deleteGroup(activeGroupId)}
            disabled={!activeGroupId}
          >🗑</button>
        </div>
      )}
      {showNew && (
        <div className="flex flex-col space-y-2">
          <input
            className="p-2 border rounded bg-background text-textLight"
            placeholder="New group name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          {error && <span className="text-red-400 text-xs">{error}</span>}
          <div className="flex space-x-2">
            <button
              className="flex-1 p-2 bg-blue-600 text-white rounded"
              onClick={() => {
                if (newName.trim()) {
                  addGroup(newName);
                  setShowNew(false);
                  setNewName('');
                  setError(null);
                } else setError('Group name is required');
              }}
            >Add</button>
            <button
              className="flex-1 p-2 bg-slate-700 text-white rounded"
              onClick={() => {
                setShowNew(false);
                setNewName('');
                setError(null);
              }}
            >Cancel</button>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="flex flex-col space-y-2">
          <input
            className="p-2 border rounded bg-background text-textLight"
            placeholder="Edit group name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          {error && <span className="text-red-400 text-xs">{error}</span>}
          <div className="flex space-x-2">
            <button
              className="flex-1 p-2 bg-blue-600 text-white rounded"
              onClick={() => {
                if (editingId && editName.trim()) {
                  editGroup(editingId, editName);
                  setShowEdit(false);
                  setEditName('');
                  setEditingId(null);
                  setError(null);
                } else setError('Group name is required');
              }}
            >Save</button>
            <button
              className="flex-1 p-2 bg-slate-700 text-white rounded"
              onClick={() => {
                setShowEdit(false);
                setEditName('');
                setEditingId(null);
                setError(null);
              }}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupMobile;