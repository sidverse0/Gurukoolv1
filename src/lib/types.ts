export interface Batch {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailId: string;
  jsonUrl: string;
  subjects?: Subject[];
  videoCount?: number;
  noteCount?: number;
}

export interface Video {
  serial: number;
  title: string;
  published_date: string;
  video_url: string;
  hd_video_url: string;
  thumbnail: string;
  notes: Note[];
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
  subject_name: string;
  subject_id: number;
  video_count: number;
  note_count: number;
  videos: Video[];
}
