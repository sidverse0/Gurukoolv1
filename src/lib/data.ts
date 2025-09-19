import type { Batch, SubjectDetails } from '@/lib/types';
import { BATCHES } from '@/config';
import ethicsData from '@/data/ethics.json';

export async function getBatches(): Promise<Batch[]> {
  const batches = BATCHES.map(b => ({
    id: b.id,
    title: b.name,
    description: ``,
    instructor: '',
    thumbnailId: `${b.id}-thumb`,
    jsonUrl: b.jsonUrl,
  }));

  const enrichedBatches = await Promise.all(
    batches.map(async batch => {
      const details = await getBatchDetails(batch.id);
      const videoCount = details?.video_count || 0;
      const noteCount = details?.note_count || 0;
      const subjects = [
        {
          id: details?.subject_id.toString() || batch.id,
          title: details?.subject_name || batch.title,
          videos: details?.videos || [],
          notes:
            details?.videos.flatMap(v => v.notes).filter(n => n) || [],
        },
      ];

      return { ...batch, subjects, videoCount, noteCount };
    })
  );

  return enrichedBatches;
}

export async function getBatchDetails(
  batchId: string
): Promise<SubjectDetails | null> {
  if (batchId === 'ethics') {
    return ethicsData as SubjectDetails;
  }
  
  const batch = BATCHES.find(b => b.id === batchId);
  if (!batch || !batch.jsonUrl || batch.jsonUrl.includes('FILE_ID')) {
    // Return a dummy structure if the URL is a placeholder
    const allBatches = await getBatches();
    const currentBatch = allBatches.find(b => b.id === batchId);
    return {
      subject_name: currentBatch?.title || 'Unknown Batch',
      subject_id: 0,
      video_count: 0,
      note_count: 0,
      videos: [],
    };
  }

  try {
    const response = await fetch(batch.jsonUrl);
    if (!response.ok) {
      console.error(
        `Failed to fetch batch details for ${batchId} from ${batch.jsonUrl}`
      );
      return null;
    }
    const data = await response.json();
    // The new structure is not an array of subjects, but a single object.
    // We can adapt it to our previous structure.
    return {
      subject_name: data.subject_name,
      subject_id: data.subject_id,
      video_count: data.video_count,
      note_count: data.note_count,
      videos: data.videos,
    };
  } catch (error) {
    console.error(`Could not fetch batch details for ${batchId}`, error);
    return null;
  }
}
