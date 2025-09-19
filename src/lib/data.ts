import fs from 'fs/promises';
import path from 'path';
import type { Batch, SubjectDetails } from '@/lib/types';

const dataPath = path.join(process.cwd(), 'src', 'data');

export async function getBatches(): Promise<Batch[]> {
  const filePath = path.join(dataPath, 'batches.json');
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Could not read batches.json`, error);
    return [];
  }
}

export async function getBatchDetails(
  batchId: string
): Promise<SubjectDetails | null> {
  const filePath = path.join(dataPath, `${batchId}.json`);
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    // This is expected if a file doesn't exist, so we don't need to log an error.
    return null;
  }
}
