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
  manual: boolean;
  comment: string;
}

export interface StudyItem {
  id: string;
  name: string;
  tags: string[];
  entries: StudyEntry[];
  sessions: StudySession[];
}

export interface Study {
  _id: { $oid: string };
  name: string;
  studies: StudyItem[];
}
