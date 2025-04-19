import React, { useMemo, useState, useCallback } from "react";
import { useStudyGroups } from "./hooks/useStudyGroups";
import { useStudyTimer } from "./hooks/useStudyTimer";
import {
  fetchStudy,
  addStudyEntry,
  editStudyEntry,
  deleteStudyEntry,
  addStudySession,
  deleteStudySession,
  deleteStudy,
} from "../../repository/studies/studies";
import { parseManualTime } from "./utils";
import StudyGroupSidebar from "./components/StudyGroupSidebar";
import TagFilterBar from "./components/TagFilterBar";
import StudyList from "./components/StudyList";
import NewStudyModal from "./components/modals/NewStudyModal";
import NewEntryModal from "./components/modals/NewEntryModal";
import EditEntryModal from "./components/modals/EditEntryModal";
import DeleteEntryModal from "./components/modals/DeleteEntryModal";
import ManualTimeModal from "./components/modals/ManualTimeModal";
import { Study, StudyEntry } from "./models";
import StudyDetail from "./components/StudyDetail";
import StudyGroupMobile from "../../components/application/StudyGroupMobile";

const StudiesPage: React.FC = () => {
  const {
    groups,
    activeGroupId,
    setActiveGroupId,
    selectedStudy,
    setSelectedStudy,
    addGroup,
    editGroup,
    deleteGroup,
    addStudy,
    allTags,
    refreshGroups,
  } = useStudyGroups();

  const {
    timerRunning,
    timerStart,
    timerElapsed,
    startTimer,
    pauseTimer,
    resumeTimer,
    finishTimer,
  } = useStudyTimer();

  const handleFinishTimer = useCallback(async () => {
    finishTimer();
    if (selectedStudy && activeGroupId) {
      await addStudySession(activeGroupId, selectedStudy.id, {
        start: timerStart?.toISOString() || new Date().toISOString(),
        duration: timerElapsed,
        manual: false,
      });
      const updated = await fetchStudy(activeGroupId, selectedStudy.id);
      setSelectedStudy(updated);
    }
  }, [selectedStudy, activeGroupId, timerElapsed, timerStart, finishTimer]);

  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupError, setGroupError] = useState<string | null>(null);
  const [showNewStudy, setShowNewStudy] = useState(false);
  const [studyError, setStudyError] = useState<string | null>(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showEditEntryModal, setShowEditEntryModal] = useState(false);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = useState(false);
  const [showManualTimeModal, setShowManualTimeModal] = useState(false);
  const [editEntry, setEditEntry] = useState<StudyEntry | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  const [tagFilter, setTagFilter] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredStudies = useMemo<Study[]>(() => {
    let studies = (groups.find((g) => g.id === activeGroupId)?.studies || []) as Study[];
    if (selectedTags.length > 0) {
      studies = studies.filter((s) =>
        selectedTags.every((tag) => s.tags.includes(tag))
      );
    }
    return studies;
  }, [groups, activeGroupId, selectedTags]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleTagInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTagFilter(e.target.value);
  }, []);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev : [...prev, tag]);
    setTagFilter("");
  }, []);

  const handleTagRemove = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleSidebarEditGroup = (id: string, name: string) => {
    editGroup(id, name);
  };
  const handleSidebarDeleteGroup = (id: string) => {
    deleteGroup(id);
  };

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (selectedStudy && activeGroupId) {
      await deleteStudySession(activeGroupId, selectedStudy.id, sessionId);
      const updated = await fetchStudy(activeGroupId, selectedStudy.id);
      setSelectedStudy(updated);
    }
  }, [selectedStudy, activeGroupId]);
  
  const handleDeleteStudy = useCallback(async () => {
    if (selectedStudy && activeGroupId) {
      await deleteStudy(activeGroupId, selectedStudy.id);
      await refreshGroups();
      setSelectedStudy(null);
    }
  }, [selectedStudy, activeGroupId, refreshGroups]);

  return (
    <div className="w-full h-full bg-background text-textLight">
      <div className="w-full flex flex-col md:flex-row md:items-start md:gap-4">
        {!isMobile && (
          <StudyGroupSidebar
            groups={groups}
            activeGroupId={activeGroupId}
            onSelectGroup={(id) => {
              setActiveGroupId(id);
              setSelectedStudy(null);
            }}
            onShowNewGroup={() => setShowNewGroup(true)}
            showNewGroup={showNewGroup}
            newGroupName={newGroupName}
            onNewGroupNameChange={setNewGroupName}
            onAddGroup={() => {
              if (newGroupName.trim()) {
                addGroup(newGroupName);
                setShowNewGroup(false);
                setNewGroupName("");
                setGroupError(null);
              } else {
                setGroupError("Group name is required");
              }
            }}
            onCancelNewGroup={() => {
              setShowNewGroup(false);
              setNewGroupName("");
              setGroupError(null);
            }}
            groupError={groupError}
            onEditGroup={handleSidebarEditGroup}
            onDeleteGroup={handleSidebarDeleteGroup}
          />
        )}
        <main className="flex-1 flex flex-col h-full overflow-hidden md:ml-0 ml-0 md:pl-0 pl-0 relative z-0 p-2 sm:p-4 max-w-full">
          {isMobile && (
            <StudyGroupMobile
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={(id) => { setActiveGroupId(id); setSelectedStudy(null); }}
              addGroup={addGroup}
              editGroup={editGroup}
              deleteGroup={deleteGroup}
            />
          )}
          <TagFilterBar
            allTags={allTags as string[]}
            selectedTags={selectedTags}
            tagFilter={tagFilter}
            onTagInput={handleTagInput}
            onTagSelect={handleTagSelect}
            onTagRemove={handleTagRemove}
          />
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 transition-all duration-300">
            {selectedStudy ? (
              <StudyDetail
                study={selectedStudy as Study}
                onBack={() => setSelectedStudy(null)}
                onShowNewEntry={() => setShowNewEntryModal(true)}
                entrySuccess={null}
                entryError={null}
                onEditEntry={(entry) => {
                  setEditEntry(entry);
                  setShowEditEntryModal(true);
                }}
                onDeleteEntry={(entryId) => {
                  setDeleteEntryId(entryId);
                  setShowDeleteEntryModal(true);
                }}
                onShowManualTime={() => setShowManualTimeModal(true)}
                timerState={{ running: timerRunning, start: timerStart, elapsed: timerElapsed }}
                onStartTimer={startTimer}
                onPauseTimer={pauseTimer}
                onResumeTimer={resumeTimer}
                onFinishTimer={handleFinishTimer}
                sessions={(selectedStudy as Study).sessions || []}
                onDeleteSession={handleDeleteSession}
                onDeleteStudy={handleDeleteStudy}
              />
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                  <h2 className="text-xl font-bold text-white">{groups.find((g) => g.id === activeGroupId)?.name} Studies</h2>
                  <button
                    className="px-3 py-1.5 bg-blue-700 text-white rounded shadow hover:bg-blue-800 transition"
                    onClick={() => setShowNewStudy(true)}
                  >
                    + New Study
                  </button>
                </div>
                <StudyList
                  studies={filteredStudies}
                  onSelectStudy={useCallback(async (study) => {
                    if (!activeGroupId) return;
                    const full = await fetchStudy(activeGroupId, study.id);
                    setSelectedStudy(full);
                  }, [activeGroupId])}
                />
              </div>
            )}
          </div>
        </main>
      </div>
      <NewStudyModal
        open={showNewStudy}
        onClose={() => {
          setShowNewStudy(false);
          setStudyError(null);
        }}
        onSave={(name, tags) => {
          if (!name.trim()) {
            setStudyError("Study name is required");
            return;
          }
          addStudy(name, tags);
          setShowNewStudy(false);
          setStudyError(null);
        }}
        error={studyError}
      />
      <NewEntryModal
        open={showNewEntryModal}
        onClose={() => {
          setShowNewEntryModal(false);
        }}
        onSave={async (title, externalUrl, description) => {
          if (selectedStudy && activeGroupId) {
            await addStudyEntry(activeGroupId, selectedStudy.id, { title, externalUrl, description });
            const full = await fetchStudy(activeGroupId, selectedStudy.id);
            setSelectedStudy(full);
          }
          setShowNewEntryModal(false);
        }}
        error={null}
      />
      <EditEntryModal
        open={showEditEntryModal}
        initialTitle={editEntry?.title || ""}
        initialExternalUrl={editEntry?.externalUrl || ""}
        initialDescription={editEntry?.description || ""}
        onClose={() => {
          setShowEditEntryModal(false);
          setEditEntry(null);
        }}
        onSave={async (title, externalUrl, description) => {
          if (selectedStudy && activeGroupId && editEntry) {
            await editStudyEntry(activeGroupId, selectedStudy.id, editEntry.id, { title, externalUrl, description });
            const full = await fetchStudy(activeGroupId, selectedStudy.id);
            setSelectedStudy(full);
          }
          setShowEditEntryModal(false);
          setEditEntry(null);
        }}
        error={null}
      />
      <DeleteEntryModal
        open={showDeleteEntryModal}
        onClose={() => {
          setShowDeleteEntryModal(false);
          setDeleteEntryId(null);
        }}
        onDelete={async () => {
          if (selectedStudy && activeGroupId && deleteEntryId) {
            await deleteStudyEntry(activeGroupId, selectedStudy.id, deleteEntryId);
            const full = await fetchStudy(activeGroupId, selectedStudy.id);
            setSelectedStudy(full);
          }
          setShowDeleteEntryModal(false);
          setDeleteEntryId(null);
        }}
        error={null}
      />
      <ManualTimeModal
        open={showManualTimeModal}
        onClose={() => setShowManualTimeModal(false)}
        onSave={async (manualMinutes: string, manualComment: string, manualDate: string) => {
          if (selectedStudy && activeGroupId) {
            const seconds = parseManualTime(manualMinutes);
            if (seconds !== null) {
              await addStudySession(activeGroupId, selectedStudy.id, { start: manualDate, duration: seconds, manual: true, comment: manualComment });
              const full = await fetchStudy(activeGroupId, selectedStudy.id);
              setSelectedStudy(full);
            }
          }
          setShowManualTimeModal(false);
        }}
        error={null}
      />
    </div>
  );
};

export default StudiesPage;
