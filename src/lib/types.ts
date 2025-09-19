export interface Batch {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailId: string;
  jsonUrl: string;
  subjects: Subject[];
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
  name: string;
  id: number;
  video_count: number;
  note_count: number;
  jsonUrl: string; // URL to fetch detailed lecture list for this subject
}

export interface BatchInfo {
  title: string;
  id: string;
  extracted_date?: string;
}

export interface BatchDetails {
  batch_info: BatchInfo;
  subjects: Subject[];
}

// This represents the detailed data for a single subject's lectures
export interface SubjectLectures {
  subject_name: string;
  subject_id: number;
  video_count: number;
  note_count: number;
  videos: Video[];
}
