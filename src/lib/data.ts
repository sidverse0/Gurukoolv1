import type { Batch, BatchDetails, SubjectLectures } from '@/lib/types';
import { BATCHES } from '@/config';
import UPSC_287_DATA from '@/data/upsc-287.json';
import BPSC_70_DATA from '@/data/bpsc70.json';
import ETHICS_DATA from '@/data/ethics.json';
import BPSC_MENTORSHIP_566_DATA from '@/data/bpsc-mentorship-566.json';
import SUBJECT_7429_DATA from '@/data/subject-7429.json';
import BPSC_ESSAY_556_DATA from '@/data/bpsc-essay-556.json';
import SUBJECT_5733_DATA from '@/data/subject-5733.json';
import BPSC_71_569_DATA from '@/data/bpsc-71-569.json';
import BPSC_71_411_DATA from '@/data/bpsc-71-411.json';
import BPSC_71_480_DATA from '@/data/bpsc-71-480.json';
import BPSC_72_708_DATA from '@/data/bpsc-72-708.json';

const localBatchData: { [key: string]: any } = {
  'upsc-287': UPSC_287_DATA,
  'bpsc70': BPSC_70_DATA,
  'ethics': ETHICS_DATA,
  'bpsc-mentorship-566': BPSC_MENTORSHIP_566_DATA,
  'bpsc-essay-556': BPSC_ESSAY_556_DATA,
  'bpsc-71-569': BPSC_71_569_DATA,
  'bpsc-71-411': BPSC_71_411_DATA,
  'bpsc-71-480': BPSC_71_480_DATA,
  'bpsc-72-708': BPSC_72_708_DATA,
};

const localSubjectData: { [key: string]: any } = {
  '7429': SUBJECT_7429_DATA,
  '5733': SUBJECT_5733_DATA,
};


export async function getBatches(): Promise<Batch[]> {
  const batchConfigs = BATCHES;

  const enrichedBatches = batchConfigs.map(batchConfig => {
      const data = localBatchData[batchConfig.id] || { batch_info: { title: `Batch ${batchConfig.id}` }, subjects: [] };
      const subjects = data?.subjects ?? [];
      
      return {
        id: batchConfig.id,
        title: data?.batch_info?.title || `Batch ${batchConfig.id}`,
        description: ``,
        instructor: '',
        thumbnailId: `${batchConfig.id}-thumb`,
        subjects: subjects,
      };
    })
  ;

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
  
  // Fallback if local data not found
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
  
  // Fallback if local data for subject not found
  const batchDetails = await getBatchDetails(batchId);
  const subjectInfo = batchDetails?.subjects.find(s => String(s.id) === subjectId);

  return {
    subject_name: subjectInfo?.name || "Unknown Subject",
    subject_id: Number(subjectId),
    video_count: subjectInfo?.video_count || 0,
    note_count: subjectInfo?.note_count || 0,
    videos: [],
  };
}
    
