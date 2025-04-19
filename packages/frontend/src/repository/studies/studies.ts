// New file: API calls for studies and groups
import { StudyGroup, Study, StudyEntry, StudySession } from "../../pages/StudiesPage/models";
import { API_URL } from "../constants";


export async function fetchStudyGroups(): Promise<StudyGroup[]> {
  const res = await fetch(`${API_URL}/studies`);
  const data = (await res.json()) as Array<{ _id: string; name: string; studies?: Study[] }>;
  // Transform MongoDB _id to id
  return data.map(({ _id, name, studies }) => ({ id: _id, name, studies }));
}

export async function createStudyGroup(name: string): Promise<StudyGroup> {
  const res = await fetch(`${API_URL}/studies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function renameStudyGroup(id: string, name: string): Promise<void> {
  await fetch(`${API_URL}/studies/${id}/name`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function deleteStudyGroup(id: string): Promise<void> {
  await fetch(`${API_URL}/studies/${id}`, {
    method: "DELETE",
  });
}

export async function createStudy(groupId: string, name: string, tags: string[]): Promise<void> {
  await fetch(`${API_URL}/studies/${groupId}/studies`, {
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
  const res = await fetch(`${API_URL}/studies/${groupId}/studies/${studyId}`);
  return res.json();
}

// Study Entry CRUD
export async function addStudyEntry(
  groupId: string,
  studyId: string,
  entry: Omit<StudyEntry, 'id'>
): Promise<StudyEntry> {
  const res = await fetch(
    `${API_URL}/studies/${groupId}/studies/${studyId}/entries`,
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
    `${API_URL}/studies/${groupId}/studies/${studyId}/entries/${entryId}`,
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
    `${API_URL}/studies/${groupId}/studies/${studyId}/entries/${entryId}`,
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
    `${API_URL}/studies/${groupId}/studies/${studyId}/sessions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }
  );
  return res.json();
}
