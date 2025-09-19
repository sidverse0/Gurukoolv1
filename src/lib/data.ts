import type { Batch, BatchDetails, SubjectLectures, Subject } from '@/lib/types';
import { BATCHES } from '@/config';
import UPSC_287_DATA from '@/data/upsc-287.json';
import BPSC_70_DATA from '@/data/bpsc70.json';
import ETHICS_DATA from '@/data/ethics.json';
import BPSC_MENTORSHIP_566_DATA from '@/data/bpsc-mentorship-566.json';
import BPSC_PRELIMS_419_DATA from '@/data/bpsc-prelims-419.json';
import SUBJECT_7429_DATA from '@/data/subject-7429.json';

const localBatchData: { [key: string]: any } = {
  'upsc-287': UPSC_287_DATA,
  'bpsc70': BPSC_70_DATA,
  'ethics': ETHICS_DATA,
  'bpsc-mentorship-566': BPSC_MENTORSHIP_566_DATA,
  'bpsc-prelims-419': BPSC_PRELIMS_419_DATA,
};

const localSubjectData: { [key: string]: any } = {
  '7429': SUBJECT_7429_DATA,
};

async function fetchJsonData(url: string): Promise<any> {
  if (!url || url.includes('YOUR_FILE_ID') || url.includes('YOUR_SUBJECT_FILE_ID')) {
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
  const batchConfigs = BATCHES;

  const enrichedBatches = await Promise.all(
    batchConfigs.map(async batchConfig => {
      let data;
      if (localBatchData[batchConfig.id]) {
        data = localBatchData[batchConfig.id];
      } else if (batchConfig.jsonUrl) {
        data = await fetchJsonData(batchConfig.jsonUrl);
      } else {
        data = { batch_info: { title: `Batch ${batchConfig.id}` }, subjects: [] };
      }

      const subjects = data?.subjects ?? [];
      
      return {
        id: batchConfig.id,
        title: data?.batch_info?.title || `Batch ${batchConfig.id}`,
        description: ``,
        instructor: '',
        thumbnailId: `${batchConfig.id}-thumb`,
        jsonUrl: batchConfig.jsonUrl,
        subjects: subjects,
      };
    })
  );

  return enrichedBatches.sort((a, b) => {
    const aIndex = BATCHES.findIndex(batch => batch.id === a.id);
    const bIndex = BATCHES.findIndex(batch => batch.id === b.id);
    return aIndex - bIndex;
  });
}


export async function getBatchDetails(batchId: string): Promise<BatchDetails | null> {
  const batchConfig = BATCHES.find(b => b.id === batchId);

  if (!batchConfig) {
    return null;
  }
  
  if (localBatchData[batchId]) {
    return localBatchData[batchId] as BatchDetails;
  }
  
  const data = await fetchJsonData(batchConfig.jsonUrl);

  if (data) {
    return data as BatchDetails;
  }

  // Fallback if fetch fails
  return {
    batch_info: {
      title: `Batch ${batchId}`,
      id: batchId,
    },
    subjects: [],
  };
}

export async function getSubjectLectures(
  batchId: string,
  subjectId: string
): Promise<SubjectLectures | null> {
  if (localSubjectData[subjectId]) {
    return localSubjectData[subjectId] as SubjectLectures;
  }
  
  // First, get the batch details to find the subject's jsonUrl
  const batchDetails = await getBatchDetails(batchId);
  const subjectInfo = batchDetails?.subjects.find(s => String(s.id) === subjectId);

  if (!subjectInfo || !subjectInfo.jsonUrl) {
    console.warn(`Subject or jsonUrl not found for batchId: ${batchId}, subjectId: ${subjectId}`);
    // Return a default structure to avoid breaking the page
    return {
      subject_name: subjectInfo?.name || "Unknown Subject",
      subject_id: Number(subjectId),
      video_count: subjectInfo?.video_count || 0,
      note_count: subjectInfo?.note_count || 0,
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
    video_count: subjectInfo.video_count,
    note_count: subjectInfo.note_count,
    videos: [],
  };
}
    