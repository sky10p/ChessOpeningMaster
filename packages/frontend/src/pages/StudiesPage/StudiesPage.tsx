import React, { useMemo } from "react";
import { useStudyGroups } from "./hooks/useStudyGroups";
import { useStudyTimer } from "./hooks/useStudyTimer";
import StudyGroupSidebar from "./components/StudyGroupSidebar";
import TagFilterBar from "./components/TagFilterBar";
import StudyList from "./components/StudyList";
import NewStudyModal from "./components/modals/NewStudyModal";
import NewEntryModal from "./components/modals/NewEntryModal";
import EditEntryModal from "./components/modals/EditEntryModal";
import DeleteEntryModal from "./components/modals/DeleteEntryModal";
import ManualTimeModal from "./components/modals/ManualTimeModal";
import { Study } from "./models";
import StudyDetail from "./components/StudyDetail";

const StudiesPage: React.FC = () => {
  // Use custom hooks for stateful logic
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

  // Modal and input state
  const [showNewGroup, setShowNewGroup] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [groupError, setGroupError] = React.useState<string | null>(null);
  const [showNewStudy, setShowNewStudy] = React.useState(false);
  const [studyError, setStudyError] = React.useState<string | null>(null);
  // Entry and manual time modal state
  const [showNewEntryModal, setShowNewEntryModal] = React.useState(false);
  const [showEditEntryModal, setShowEditEntryModal] = React.useState(false);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = React.useState(false);
  const [showManualTimeModal, setShowManualTimeModal] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<any>(null);

  // Tag filtering
  const [tagFilter, setTagFilter] = React.useState<string>("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

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

  // Tag filter actions
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagFilter(e.target.value);
  };
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]);
    setTagFilter("");
  };
  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // Sidebar and tag filter handlers for component props
  const handleSidebarEditGroup = (id: string, name: string) => {
    editGroup(id, name);
  };
  const handleSidebarDeleteGroup = (id: string) => {
    deleteGroup(id);
  };

  // UI
  return (
    <div className="w-full h-full bg-background text-textLight">
      <div className="w-full flex flex-col md:flex-row md:items-start md:gap-4">
        {/* Sidebar as panel in desktop */}
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
        {/* Main area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden md:ml-0 ml-0 md:pl-0 pl-0 relative z-0 p-2 sm:p-4 max-w-full">
          {/* Tag filter */}
          <TagFilterBar
            allTags={allTags as string[]}
            selectedTags={selectedTags}
            tagFilter={tagFilter}
            onTagInput={handleTagInput}
            onTagSelect={handleTagSelect}
            onTagRemove={handleTagRemove}
          />
          {/* Studies list or detail */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 transition-all duration-300">
            {selectedStudy ? (
              <StudyDetail
                study={selectedStudy as Study}
                onBack={() => setSelectedStudy(null)}
                onShowNewEntry={() => setShowNewEntryModal(true)}
                entrySuccess={null}
                entryError={null}
                onEditEntry={(entry) => {
                  setSelectedEntry(entry);
                  setShowEditEntryModal(true);
                }}
                onDeleteEntry={(entryId) => {
                  setSelectedEntry(entryId);
                  setShowDeleteEntryModal(true);
                }}
                onShowManualTime={() => setShowManualTimeModal(true)}
                timerState={{ running: timerRunning, start: timerStart, elapsed: timerElapsed }}
                onStartTimer={startTimer}
                onPauseTimer={pauseTimer}
                onResumeTimer={resumeTimer}
                onFinishTimer={finishTimer}
                sessions={(selectedStudy && (selectedStudy as Study).sessions) || []}
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
                <StudyList studies={filteredStudies} onSelectStudy={setSelectedStudy} />
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Modals */}
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
          setSelectedEntry(null);
        }}
        onSave={() => {
          // TODO: implement add entry logic
          setShowNewEntryModal(false);
        }}
        error={null}
      />
      <EditEntryModal
        open={showEditEntryModal}
        initialTitle={selectedEntry?.title || ""}
        initialExternalUrl={selectedEntry?.externalUrl || ""}
        initialDescription={selectedEntry?.description || ""}
        onClose={() => {
          setShowEditEntryModal(false);
          setSelectedEntry(null);
        }}
        onSave={() => {
          // TODO: implement edit entry logic
          setShowEditEntryModal(false);
        }}
        error={null}
      />
      <DeleteEntryModal
        open={showDeleteEntryModal}
        onClose={() => {
          setShowDeleteEntryModal(false);
          setSelectedEntry(null);
        }}
        onDelete={() => {
          // TODO: implement delete entry logic
          setShowDeleteEntryModal(false);
        }}
        error={null}
      />
      <ManualTimeModal
        open={showManualTimeModal}
        onClose={() => setShowManualTimeModal(false)}
        onSave={() => {
          // TODO: implement manual time logic
          setShowManualTimeModal(false);
        }}
        error={null}
      />
    </div>
  );
};

export default StudiesPage;
