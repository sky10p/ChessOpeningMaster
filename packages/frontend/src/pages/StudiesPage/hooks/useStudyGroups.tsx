import { useState, useMemo, useEffect } from "react";
import { Study, StudyGroup } from "../models";
import {
  fetchStudyGroups,
  createStudyGroup,
  renameStudyGroup,
  deleteStudyGroup,
  createStudy,
} from "../repository/studies";

export function useStudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

  // Load groups on mount
  const refreshGroups = async () => {
    const data = await fetchStudyGroups();
    setGroups(data);
    if (!activeGroupId && data.length > 0) setActiveGroupId(data[0].id);
  };
  useEffect(() => {
    refreshGroups();
  }, []);

  // Group CRUD
  const addGroup = async (name: string) => {
    await createStudyGroup(name);
    await refreshGroups();
  };
  const editGroup = async (id: string, name: string) => {
    await renameStudyGroup(id, name);
    await refreshGroups();
  };
  const deleteGroup = async (id: string) => {
    await deleteStudyGroup(id);
    setSelectedStudy(null);
    await refreshGroups();
  };

  // Study CRUD
  const addStudy = async (name: string, tags: string[]) => {
    if (!activeGroupId) return;
    await createStudy(activeGroupId, name, tags);
    await refreshGroups();
  };

  // Tag helpers
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    groups.forEach((g) =>
      g.studies?.forEach((s) => s.tags.forEach((t) => tags.add(t)))
    );
    return Array.from(tags).sort();
  }, [groups]);

  return {
    groups,
    setGroups,
    activeGroupId,
    setActiveGroupId,
    selectedStudy,
    setSelectedStudy,
    addGroup,
    editGroup,
    deleteGroup,
    addStudy,
    allTags,
  };
}
