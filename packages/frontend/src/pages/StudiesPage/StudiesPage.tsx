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
import { Button, Card, EmptyState, PageHeader, StatStrip, type StatStripItem } from "../../components/ui";
import DeleteSessionModal from "./components/modals/DeleteSessionModal";
import ManualTimeModal from "./components/modals/ManualTimeModal";
import { Study, StudyEntry } from "./models";
import StudyDetail from "./components/StudyDetail";
import StudyGroupMobile from "../../components/application/StudyGroupMobile";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";
import { useIsMobile } from "../../hooks/useIsMobile";

const StudiesPage: React.FC = () => {
  const isMobile = useIsMobile();
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
  const totalStudies = useMemo(
    () => groups.reduce((sum, group) => sum + (group.studies?.length ?? 0), 0),
    [groups]
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

  const statsItems = useMemo<StatStripItem[]>(
    () => [
      {
        label: "Groups",
        value: groups.length,
        tone: "default",
        detail: activeGroup ? `Current: ${activeGroup.name}` : "No active group",
      },
      {
        label: "Study items",
        value: totalStudies,
        tone: "brand",
        detail: `${filteredStudies.length} shown in current view`,
      },
      {
        label: "Timer",
        value: timerRunning ? "Running" : "Idle",
        tone: timerRunning ? "success" : "default",
        detail: selectedStudy ? selectedStudy.name : "No study selected",
      },
      {
        label: "Tags",
        value: allTags.length,
        tone: "accent",
        detail: selectedTags.length > 0 ? `${selectedTags.length} active filter(s)` : "No active tag filters",
      },
    ],
    [activeGroup, allTags.length, filteredStudies.length, groups.length, selectedStudy, selectedTags.length, timerRunning, totalStudies]
  );

  const mobilePrimaryAction = selectedStudy ? (
    <Button
      type="button"
      intent="primary"
      size="md"
      className="w-full justify-center"
      onClick={() => setShowNewEntryModal(true)}
    >
      Add entry
    </Button>
  ) : (
    <Button
      type="button"
      intent="primary"
      size="md"
      className="w-full justify-center"
      onClick={() => setShowNewStudy(true)}
    >
      <PlusIcon className="h-4 w-4" />
      New Study
    </Button>
  );

  const desktopPrimaryAction = (
    <Button
      type="button"
      intent="primary"
      size="md"
      onClick={() => setShowNewStudy(true)}
    >
      <PlusIcon className="h-4 w-4" />
      New Study
    </Button>
  );

  return (
    <PageRoot>
      <PageFrame className="h-full max-w-analytics py-4 sm:py-6">
        <PageSurface className="gap-4 border-none bg-transparent shadow-none">
          <PageHeader
            eyebrow={isMobile ? undefined : "Study library"}
            title="Studies"
            description={isMobile ? undefined : "Keep study groups, session timing, and supporting material in one place with a consistent list-detail workflow."}
            primaryAction={isMobile ? mobilePrimaryAction : desktopPrimaryAction}
            secondaryActions={
              !isMobile && selectedStudy ? (
                <Button
                  type="button"
                  intent="secondary"
                  size="md"
                  onClick={() => setShowNewEntryModal(true)}
                >
                  Add entry
                </Button>
              ) : undefined
            }
            className={isMobile ? "gap-3 px-4 py-4" : undefined}
          />

          <Card padding="default" className="sm:hidden">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">
                  Current focus
                </div>
                <div className="text-lg font-semibold text-text-base">
                  {selectedStudy ? selectedStudy.name : activeGroup?.name || "Choose a study group"}
                </div>
                <div className="text-sm text-text-muted">
                  {selectedStudy
                    ? `${activeGroup?.name || "Studies"} · ${timerRunning ? "Timer running" : "Ready to practice"}`
                    : activeGroup
                      ? `${filteredStudies.length} ${filteredStudies.length === 1 ? "study" : "studies"} in this group`
                      : "Create or pick a group to keep the next action visible."}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-text-subtle">
                <span className="rounded-lg border border-border-subtle bg-surface-raised px-3 py-2">
                  {groups.length} {groups.length === 1 ? "group" : "groups"}
                </span>
                <span className="rounded-lg border border-border-subtle bg-surface-raised px-3 py-2">
                  {totalStudies} {totalStudies === 1 ? "study item" : "study items"}
                </span>
                <span className="rounded-lg border border-border-subtle bg-surface-raised px-3 py-2">
                  {selectedTags.length > 0 ? `${selectedTags.length} tag filters` : "No tag filters"}
                </span>
              </div>
            </div>
          </Card>

          <div className="hidden sm:block">
            <StatStrip items={statsItems} />
          </div>

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
              {!selectedStudy ? (
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
              ) : null}

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

          <div className="sm:hidden">
            <StatStrip items={statsItems} />
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
