export interface StudyEntry {
  id: string;
  title: string;
  externalUrl: string;
  description: string;
}

export interface StudySession {
  id: string;
  start: string;
  duration: number;
  manual?: boolean;
  comment?: string;
}

export interface Study {
  id: string;
  name: string;
  tags: string[];
  entries: StudyEntry[];
  sessions?: StudySession[];
}

export interface StudyGroup {
  id: string;
  name: string;
  studies?: Study[];
}