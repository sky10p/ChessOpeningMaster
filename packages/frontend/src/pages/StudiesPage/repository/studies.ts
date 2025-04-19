// New file: API calls for studies and groups
import { StudyGroup, Study, StudyEntry, StudySession } from "../models";

const API_BASE = process.env.REACT_APP_API_URL || "";

export async function fetchStudyGroups(): Promise<StudyGroup[]> {
  const res = await fetch(`${API_BASE}/studies`);
  return res.json();
}

export async function createStudyGroup(name: string): Promise<StudyGroup> {
  const res = await fetch(`${API_BASE}/studies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function renameStudyGroup(id: string, name: string): Promise<void> {
  await fetch(`${API_BASE}/studies/${id}/name`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function deleteStudyGroup(id: string): Promise<void> {
  await fetch(`${API_BASE}/studies/${id}`, {
    method: "DELETE",
  });
}

export async function createStudy(groupId: string, name: string, tags: string[]): Promise<void> {
  await fetch(`${API_BASE}/studies/${groupId}/studies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, tags }),
  });
}

// Fetch a single study by groupId and studyId
export async function fetchStudy(
  groupId: string,
  studyId: string
): Promise<Study> {
  const res = await fetch(`${API_BASE}/studies/${groupId}/studies/${studyId}`);
  return res.json();
}

// Study Entry CRUD
export async function addStudyEntry(
  groupId: string,
  studyId: string,
  entry: Omit<StudyEntry, 'id'>
): Promise<StudyEntry> {
  const res = await fetch(
    `${API_BASE}/studies/${groupId}/studies/${studyId}/entries`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }
  );
  return res.json();
}

export async function editStudyEntry(
  groupId: string,
  studyId: string,
  entryId: string,
  data: Omit<StudyEntry, 'id'>
): Promise<void> {
  await fetch(
    `${API_BASE}/studies/${groupId}/studies/${studyId}/entries/${entryId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}

export async function deleteStudyEntry(
  groupId: string,
  studyId: string,
  entryId: string
): Promise<void> {
  await fetch(
    `${API_BASE}/studies/${groupId}/studies/${studyId}/entries/${entryId}`,
    { method: 'DELETE' }
  );
}

// Study Session CRUD
export async function addStudySession(
  groupId: string,
  studyId: string,
  session: Omit<StudySession, 'id'>
): Promise<StudySession> {
  const res = await fetch(
    `${API_BASE}/studies/${groupId}/studies/${studyId}/sessions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }
  );
  return res.json();
}
