import { useState, useMemo } from "react";
import { randomId } from "../utils";
import { Study } from "../models";

const FIXED_GROUPS = [
  "Aperturas",
  "Medio juego",
  "Finales",
  "Juego posicional",
  "Cálculo",
];

interface Group {
  id: string;
  name: string;
  studies: Study[];
  fixed: boolean;
}

export function useStudyGroups() {
  const [groups, setGroups] = useState<Group[]>(() =>
    FIXED_GROUPS.map((name) => ({ id: name, name, studies: [], fixed: true }))
  );
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0].id);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

  // Group CRUD
  const addGroup = (name: string) => {
    setGroups((prev) => [
      ...prev,
      { id: randomId(), name: name.trim(), studies: [], fixed: false },
    ]);
  };
  const editGroup = (id: string, name: string) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name: name.trim() } : g)));
  };
  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (activeGroupId === id) {
      setActiveGroupId(groups[0].id);
      setSelectedStudy(null);
    }
  };

  // Study CRUD
  const addStudy = (name: string, tags: string[]) => {
    setGroups((prev) => prev.map((g) =>
      g.id === activeGroupId
        ? { ...g, studies: [{ id: randomId(), name: name.trim(), tags, entries: [] }, ...g.studies] }
        : g
    ));
  };

  // Tag helpers
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    groups.forEach((g) => g.studies.forEach((s) => s.tags.forEach((t) => tags.add(t))));
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
