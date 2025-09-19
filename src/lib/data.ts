import type { Batch, BatchDetails, SubjectLectures, Subject } from '@/lib/types';
import { BATCHES } from '@/config';
import UPSC_287_DATA from '@/data/upsc-287.json';

async function fetchJsonData(url: string): Promise<any> {
  if (!url || url.includes('YOUR_FILE_ID')) {
    console.warn(`Skipping fetch for placeholder URL: ${url}`);
    return null;
  }
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Failed to fetch data from ${url}. Status: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not fetch data from ${url}`, error);
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
    subjects: []
  }));

  const enrichedBatches = await Promise.all(
    batches.map(async batch => {
      let data;
      if(batch.id === 'upsc-287'){
        data = UPSC_287_DATA;
      } else if (batch.jsonUrl) {
        data = await fetchJsonData(batch.jsonUrl);
      }

      if (data && data.subjects) {
        return {
          ...batch,
          title: data.batch_info?.title || batch.title,
          subjects: data.subjects,
        };
      }
      return {
        ...batch,
        subjects: [],
      };
    })
  );

  return enrichedBatches;
}


export async function getBatchDetails(batchId: string): Promise<BatchDetails | null> {
  const batchConfig = BATCHES.find(b => b.id === batchId);

  if (!batchConfig) {
    return null;
  }
  
  if (batchId === 'upsc-287') {
    return UPSC_287_DATA as BatchDetails;
  }
  
  const data = await fetchJsonData(batchConfig.jsonUrl);

  if (data) {
    return data as BatchDetails;
  }

  return {
    batch_info: {
      title: batchConfig.name,
      id: batchId,
    },
    subjects: [],
  };
}

export async function getSubjectLectures(
  batchId: string,
  subjectId: string
): Promise<SubjectLectures | null> {
  // First, get the batch details to find the subject's jsonUrl
  const batchDetails = await getBatchDetails(batchId);
  const subjectInfo = batchDetails?.subjects.find(s => String(s.id) === subjectId);

  if (!subjectInfo || !subjectInfo.jsonUrl) {
    console.error(`Subject or jsonUrl not found for batchId: ${batchId}, subjectId: ${subjectId}`);
    // Return a default structure to avoid breaking the page
    return {
      subject_name: subjectInfo?.name || "Unknown Subject",
      subject_id: Number(subjectId),
      video_count: 0,
      note_count: 0,
      videos: [],
    };
  }

  const data = await fetchJsonData(subjectInfo.jsonUrl);

  if (data) {
    return data as SubjectLectures;
  }

  // Fallback if the fetch fails
  return {
    subject_name: subjectInfo.name,
    subject_id: subjectInfo.id,
    video_count: 0,
    note_count: 0,
    videos: [],
  };
}
