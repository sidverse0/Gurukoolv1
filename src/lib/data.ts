import type { Batch, SubjectDetails } from '@/lib/types';
import { BATCHES } from '@/config';
import ethicsData from '@/data/ethics.json';

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
      // For the main batch list, we can avoid fetching full details
      // to speed up the initial load. We can get counts later if needed
      // or from a summary endpoint. For now, let's use placeholders.
      if (batch.id === 'ethics') {
        return {
          ...batch,
          instructor: 'Dharmendra Sir',
          videoCount: ethicsData.video_count,
          noteCount: ethicsData.note_count,
          subjects: [
            {
              id: String(ethicsData.subject_id),
              title: ethicsData.subject_name,
              videos: ethicsData.videos,
              notes: ethicsData.videos.flatMap(v => v.notes).filter(n => n),
            },
          ],
        };
      }
      const details = await getBatchDetails(batch.id);
      return {
        ...batch,
        videoCount: details?.video_count || 0,
        noteCount: details?.note_count || 0,
        subjects: details
          ? [
              {
                id: String(details.subject_id),
                title: details.subject_name,
                videos: details.videos,
                notes:
                  details.videos?.flatMap(v => v.notes).filter(n => n) || [],
              },
            ]
          : [],
      };
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
    // This structure helps in showing a proper "coming soon" or empty state.
    const allBatches = await getBatches().catch(() => []);
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
    const response = await fetch(batch.jsonUrl, { cache: 'no-store' }); // Fetch fresh data
    if (!response.ok) {
      console.error(
        `Failed to fetch batch details for ${batchId} from ${batch.jsonUrl}`
      );
      return null;
    }
    const data = await response.json();
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
