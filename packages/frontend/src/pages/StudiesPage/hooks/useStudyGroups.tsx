import { useState, useMemo } from "react";
import { randomId } from "../utils";
import { Study } from "../models";

interface Group {
  id: string;
  name: string;
  studies: Study[];
}

export function useStudyGroups() {
  const [groups, setGroups] = useState<Group[]>(() => []);
  const [activeGroupId, setActiveGroupId] = useState<string>(
    groups[0]?.id || ""
  );
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

  // Group CRUD
  const addGroup = (name: string) => {
    setGroups((prev) => [
      ...prev,
      { id: randomId(), name: name.trim(), studies: [], fixed: false },
    ]);
  };
  const editGroup = (id: string, name: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: name.trim() } : g))
    );
  };
  const deleteGroup = (id: string) => {
    setGroups((prev) => {
      const filtered = prev.filter((g) => g.id !== id);
      // If the deleted group was active, update activeGroupId based on filtered groups
      if (activeGroupId === id) {
        if (filtered.length > 0) {
          setActiveGroupId(filtered[0].id);
        } else {
          setActiveGroupId("");
        }
        setSelectedStudy(null);
      }
      return filtered;
    });
  };

  // Study CRUD
  const addStudy = (name: string, tags: string[]) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId
          ? {
              ...g,
              studies: [
                { id: randomId(), name: name.trim(), tags, entries: [] },
                ...g.studies,
              ],
            }
          : g
      )
    );
  };

  // Tag helpers
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    groups.forEach((g) =>
      g.studies.forEach((s) => s.tags.forEach((t) => tags.add(t)))
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
