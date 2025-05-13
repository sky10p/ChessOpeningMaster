import { useState, useMemo, useEffect, useCallback } from "react";
import { Study, StudyGroup } from "../models";
import {
  fetchStudyGroups,
  createStudyGroup,
  renameStudyGroup,
  deleteStudyGroup,
  createStudy,
  fetchStudy,
} from "../../../repository/studies/studies";

export function useStudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudyGroups();
      setGroups(data);
      
      const urlParams = new URLSearchParams(window.location.search);
      const groupIdFromUrl = urlParams.get('groupId');
      const studyIdFromUrl = urlParams.get('studyId');
      
      if (groupIdFromUrl && data.some(g => g.id === groupIdFromUrl)) {
        setActiveGroupId(groupIdFromUrl);
        
        if (studyIdFromUrl) {
          try {
            const study = await fetchStudy(groupIdFromUrl, studyIdFromUrl);
            setSelectedStudy(study);
          } catch (error) {
            console.error('Failed to load study from query params:', error);
          }
        }
      } else if (!activeGroupId && data.length > 0) {
        setActiveGroupId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch study groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  const updateUrlParams = useCallback(() => {
    const url = new URL(window.location.href);
    
    if (activeGroupId) {
      url.searchParams.set('groupId', activeGroupId);
      
      if (selectedStudy) {
        url.searchParams.set('studyId', selectedStudy.id);
      } else {
        url.searchParams.delete('studyId');
      }
    } else {
      url.searchParams.delete('groupId');
      url.searchParams.delete('studyId');
    }
    
    window.history.replaceState({}, '', url.toString());
  }, [activeGroupId, selectedStudy]);

  useEffect(() => {
    if (!loading) {
      updateUrlParams();
    }
  }, [activeGroupId, selectedStudy, loading, updateUrlParams]);

  const handleSelectGroup = useCallback((id: string) => {
    setActiveGroupId(id);
    setSelectedStudy(null);
  }, []);

  const handleBackToStudies = useCallback(() => {
    setSelectedStudy(null);
  }, []);

  const addGroup = useCallback(async (name: string) => {
    await createStudyGroup(name);
    await refreshGroups();
  }, [refreshGroups]);
  
  const editGroup = useCallback(async (id: string, name: string) => {
    await renameStudyGroup(id, name);
    await refreshGroups();
  }, [refreshGroups]);
  
  const deleteGroup = useCallback(async (id: string) => {
    await deleteStudyGroup(id);
    if (activeGroupId === id) {
      setSelectedStudy(null);
    }
    await refreshGroups();
  }, [activeGroupId, refreshGroups]);

  const addStudy = useCallback(async (name: string, tags: string[]) => {
    if (!activeGroupId) return;
    await createStudy(activeGroupId, name, tags);
    await refreshGroups();
  }, [activeGroupId, refreshGroups]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    groups.forEach((g) =>
      g.studies?.forEach((s) => s.tags.forEach((t) => tags.add(t)))
    );
    return Array.from(tags).sort();
  }, [groups]);

  return {
    groups,
    loading,
    activeGroupId,
    setActiveGroupId: handleSelectGroup,
    selectedStudy,
    setSelectedStudy,
    handleBackToStudies,
    addGroup,
    editGroup,
    deleteGroup,
    addStudy,
    allTags,
    refreshGroups,
  };
}
