export interface Batch {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailId: string;
}

export interface Video {
  title: string;
  url: string; // YouTube video ID
  duration: string;
}

export interface Note {
  title: string;
  url: string; // PDF URL
}

export interface Subject {
  id: string;
  title: string;
  videos: Video[];
  notes: Note[];
}

export interface SubjectDetails {
  batchId: string;
  title: string;
  subjects: Subject[];
}
