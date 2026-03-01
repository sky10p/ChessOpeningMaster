import React, { useMemo, useState, useCallback } from "react";
import { ClockIcon, PlusIcon } from "@heroicons/react/24/outline";
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
import { Button, EmptyState } from "../../components/ui";
import DeleteSessionModal from "./components/modals/DeleteSessionModal";
import ManualTimeModal from "./components/modals/ManualTimeModal";
import { Study, StudyEntry } from "./models";
import StudyDetail from "./components/StudyDetail";
import StudyGroupMobile from "../../components/application/StudyGroupMobile";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";

const StudiesPage: React.FC = () => {
  const {
    groups,
    loading,
    activeGroupId,
    setActiveGroupId,
    selectedStudy,
    setSelectedStudy,
    handleBackToStudies,
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
  }, [selectedStudy, activeGroupId, timerElapsed, timerStart, finishTimer, setSelectedStudy]);

  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupError, setGroupError] = useState<string | null>(null);
  const [showNewStudy, setShowNewStudy] = useState(false);
  const [studyError, setStudyError] = useState<string | null>(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showEditEntryModal, setShowEditEntryModal] = useState(false);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = useState(false);
  const [showDeleteSessionModal, setShowDeleteSessionModal] = useState(false);
  const [showManualTimeModal, setShowManualTimeModal] = useState(false);
  const [editEntry, setEditEntry] = useState<StudyEntry | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId) || null,
    [groups, activeGroupId]
  );

  const filteredStudies = useMemo<Study[]>(() => {
    let studies = (activeGroup?.studies || []) as Study[];
    if (selectedTags.length > 0) {
      studies = studies.filter((study) =>
        selectedTags.every((tag) => study.tags.includes(tag))
      );
    }
    return studies;
  }, [activeGroup, selectedTags]);

  const handleTagInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTagFilter(event.target.value);
  }, []);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags((previousTags) => (previousTags.includes(tag) ? previousTags : [...previousTags, tag]));
    setTagFilter("");
  }, []);

  const handleTagRemove = useCallback((tag: string) => {
    setSelectedTags((previousTags) => previousTags.filter((value) => value !== tag));
  }, []);

  const handleSidebarEditGroup = useCallback((id: string, name: string) => {
    void editGroup(id, name);
  }, [editGroup]);

  const handleSidebarDeleteGroup = useCallback((id: string) => {
    void deleteGroup(id);
  }, [deleteGroup]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    setDeleteSessionId(sessionId);
    setShowDeleteSessionModal(true);
  }, []);

  const confirmDeleteSession = useCallback(async () => {
    if (selectedStudy && activeGroupId && deleteSessionId) {
      await deleteStudySession(activeGroupId, selectedStudy.id, deleteSessionId);
      const updated = await fetchStudy(activeGroupId, selectedStudy.id);
      setSelectedStudy(updated);
    }
    setShowDeleteSessionModal(false);
    setDeleteSessionId(null);
  }, [selectedStudy, activeGroupId, deleteSessionId, setSelectedStudy]);

  const handleDeleteStudy = useCallback(async () => {
    if (selectedStudy && activeGroupId) {
      await deleteStudy(activeGroupId, selectedStudy.id);
      await refreshGroups();
      setSelectedStudy(null);
    }
  }, [selectedStudy, activeGroupId, refreshGroups, setSelectedStudy]);

  const handleCreateGroup = useCallback(() => {
    if (newGroupName.trim()) {
      void addGroup(newGroupName);
      setShowNewGroup(false);
      setNewGroupName("");
      setGroupError(null);
      return;
    }
    setGroupError("Group name is required");
  }, [addGroup, newGroupName]);

  const resetNewGroup = useCallback(() => {
    setShowNewGroup(false);
    setNewGroupName("");
    setGroupError(null);
  }, []);

  return (
    <PageRoot>
      <PageFrame className="h-full py-0 sm:py-2">
        <PageSurface>
          <header className="shrink-0 border-b border-border-default bg-surface px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-base font-semibold text-text-base sm:text-lg">Studies</h1>
                <p className="text-sm text-text-muted">
                  Manage study groups, practice sessions, and external resources.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {selectedStudy && (
                  <Button
                    type="button"
                    intent="secondary"
                    size="sm"
                    onClick={() => setShowNewEntryModal(true)}
                  >
                    Add Entry
                  </Button>
                )}
                <Button
                  type="button"
                  intent="primary"
                  size="sm"
                  onClick={() => setShowNewStudy(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                  New Study
                </Button>
              </div>
            </div>
          </header>

          <div className="shrink-0 md:hidden">
            <StudyGroupMobile
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={setActiveGroupId}
              addGroup={addGroup}
              editGroup={editGroup}
              deleteGroup={deleteGroup}
            />
          </div>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="hidden min-h-0 shrink-0 md:flex">
              <StudyGroupSidebar
                groups={groups}
                activeGroupId={activeGroupId}
                onSelectGroup={setActiveGroupId}
                onShowNewGroup={() => setShowNewGroup(true)}
                showNewGroup={showNewGroup}
                newGroupName={newGroupName}
                onNewGroupNameChange={setNewGroupName}
                onAddGroup={handleCreateGroup}
                onCancelNewGroup={resetNewGroup}
                groupError={groupError}
                onEditGroup={handleSidebarEditGroup}
                onDeleteGroup={handleSidebarDeleteGroup}
              />
            </div>

            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur">
                <TagFilterBar
                  allTags={allTags as string[]}
                  selectedTags={selectedTags}
                  tagFilter={tagFilter}
                  onTagInput={handleTagInput}
                  onTagSelect={handleTagSelect}
                  onTagRemove={handleTagRemove}
                />
              </div>

              <div className="px-3 py-4 sm:px-5 sm:py-5">
                {loading ? (
                  <EmptyState
                    icon={ClockIcon}
                    title="Loading studies..."
                    description="Preparing your studies workspace."
                  />
                ) : selectedStudy ? (
                  <StudyDetail
                    study={selectedStudy}
                    groupName={activeGroup?.name || "Studies"}
                    onBack={handleBackToStudies}
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
                    timerState={{
                      running: timerRunning,
                      start: timerStart,
                      elapsed: timerElapsed,
                    }}
                    onStartTimer={startTimer}
                    onPauseTimer={pauseTimer}
                    onResumeTimer={resumeTimer}
                    onFinishTimer={handleFinishTimer}
                    sessions={selectedStudy.sessions || []}
                    onDeleteSession={handleDeleteSession}
                    onDeleteStudy={handleDeleteStudy}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                          Current Group
                        </div>
                        <h2 className="text-xl font-bold text-text-base">
                          {activeGroup?.name || "No group selected"}
                        </h2>
                        <p className="text-sm text-text-muted">
                          {filteredStudies.length} {filteredStudies.length === 1 ? "study" : "studies"}
                        </p>
                      </div>
                    </div>

                    <StudyList
                      studies={filteredStudies}
                      emptyAction={
                        <Button type="button" intent="primary" size="sm" onClick={() => setShowNewStudy(true)}>
                          <PlusIcon className="h-4 w-4" />
                          New Study
                        </Button>
                      }
                      onSelectStudy={async (study: Study) => {
                        if (!activeGroupId) return;
                        const full = await fetchStudy(activeGroupId, study.id);
                        setSelectedStudy(full);
                      }}
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
              void addStudy(name, tags);
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
                await addStudyEntry(activeGroupId, selectedStudy.id, {
                  title,
                  externalUrl,
                  description,
                });
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
                await editStudyEntry(
                  activeGroupId,
                  selectedStudy.id,
                  editEntry.id,
                  { title, externalUrl, description }
                );
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
                await deleteStudyEntry(
                  activeGroupId,
                  selectedStudy.id,
                  deleteEntryId
                );
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
            onSave={async (
              manualMinutes: string,
              manualComment: string,
              manualDate: string
            ) => {
              if (selectedStudy && activeGroupId) {
                const seconds = parseManualTime(manualMinutes);
                if (seconds !== null) {
                  await addStudySession(activeGroupId, selectedStudy.id, {
                    start: manualDate,
                    duration: seconds,
                    manual: true,
                    comment: manualComment,
                  });
                  const full = await fetchStudy(activeGroupId, selectedStudy.id);
                  setSelectedStudy(full);
                }
              }
              setShowManualTimeModal(false);
            }}
            error={null}
          />
          <DeleteSessionModal
            open={showDeleteSessionModal}
            onClose={() => {
              setShowDeleteSessionModal(false);
              setDeleteSessionId(null);
            }}
            onDelete={confirmDeleteSession}
            error={null}
          />
        </PageSurface>
      </PageFrame>
    </PageRoot>
  );
};

export default StudiesPage;
