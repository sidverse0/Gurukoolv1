import type { Batch, SubjectDetails } from '@/lib/types';
import { BATCHES } from '@/config';

export async function getBatches(): Promise<Batch[]> {
  return BATCHES.map(b => ({
    id: b.id,
    title: b.name,
    description: ``,
    instructor: '',
    thumbnailId: `${b.id}-thumb`,
    jsonUrl: b.jsonUrl,
  }));
}

export async function getBatchDetails(
  batchId: string
): Promise<SubjectDetails | null> {
  const batch = BATCHES.find(b => b.id === batchId);
  if (!batch || !batch.jsonUrl || batch.jsonUrl.includes('FILE_ID')) {
    // Return a dummy structure if the URL is a placeholder
    const allBatches = await getBatches();
    const currentBatch = allBatches.find(b => b.id === batchId);
    return {
      batchId,
      title: currentBatch?.title || 'Unknown Batch',
      subjects: [],
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
    return await response.json();
  } catch (error) {
    console.error(`Could not fetch batch details for ${batchId}`, error);
    return null;
  }
}
