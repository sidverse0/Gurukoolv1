import type { Batch, SubjectDetails } from '@/lib/types';
import { BATCHES } from '@/config';

async function fetchBatchData(url: string): Promise<any> {
  if (!url || url.includes('FILE_ID')) {
    return null;
  }
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Failed to fetch batch data from ${url}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not fetch batch data from ${url}`, error);
    return null;
  }
}

export async function getBatches(): Promise<Batch[]> {
  const batches: Batch[] = BATCHES.map(b => ({
    id: b.id,
    title: b.name,
    description: ``,
    instructor: '',
    thumbnailId: `${b.id}-thumb`,
    jsonUrl: b.jsonUrl,
  }));

  const enrichedBatches = await Promise.all(
    batches.map(async batch => {
      const data = await fetchBatchData(batch.jsonUrl);
      if (data) {
        return {
          ...batch,
          instructor: data.instructor || 'Dharmendra Sir', // Default instructor
          videoCount: data.video_count,
          noteCount: data.note_count,
          subjects: [
            {
              id: String(data.subject_id),
              title: data.subject_name,
              videos: data.videos,
              notes: data.videos.flatMap((v: any) => v.notes).filter((n: any) => n),
            },
          ],
        };
      }
      // Return basic info if fetch fails or no URL
      return {
        ...batch,
        videoCount: 0,
        noteCount: 0,
        subjects: [],
      };
    })
  );

  return enrichedBatches;
}

export async function getBatchDetails(
  batchId: string
): Promise<SubjectDetails | null> {
  const batchConfig = BATCHES.find(b => b.id === batchId);

  if (!batchConfig) {
    return null;
  }
  
  const data = await fetchBatchData(batchConfig.jsonUrl);

  if (data) {
    return {
      subject_name: data.subject_name,
      subject_id: data.subject_id,
      video_count: data.video_count,
      note_count: data.note_count,
      videos: data.videos,
    };
  }
  
  // Fallback for when data cannot be fetched
  const allBatches = await getBatches().catch(() => []);
  const currentBatchInfo = allBatches.find(b => b.id === batchId);
  return {
    subject_name: currentBatchInfo?.title || 'Unknown Batch',
    subject_id: 0,
    video_count: 0,
    note_count: 0,
    videos: [],
  };
}
