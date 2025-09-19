'use client';

import Link from 'next/link';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { getSubjectLectures } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Clapperboard,
  FileText,
  Play,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import type { SubjectLectures, Video } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function LectureSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <Skeleton className="h-48 w-full md:h-full" />
        <div className="p-4 md:col-span-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-6 w-3/4" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SubjectLecturesPage() {
  const params = useParams();
  const batchId = params.batchId as string;
  const subjectId = params.subjectId as string;
  const [subjectDetails, setSubjectDetails] = useState<SubjectLectures | null>(
    null
  );
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const details = await getSubjectLectures(batchId, subjectId);
      if (!details) {
        notFound();
      }
      setSubjectDetails(details);
      setFilteredVideos(details.videos || []);
      setLoading(false);
    }
    fetchData();
  }, [batchId, subjectId]);

  useEffect(() => {
    if (!subjectDetails) return;

    if (searchTerm === '') {
      setFilteredVideos(subjectDetails.videos || []);
      return;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = subjectDetails.videos.filter(
      video =>
        video.title.toLowerCase().includes(lowercasedFilter) ||
        (video.notes &&
          video.notes.some(note =>
            note.title.toLowerCase().includes(lowercasedFilter)
          ))
    );
    setFilteredVideos(filtered);
  }, [searchTerm, subjectDetails]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="mb-2 h-10 w-3/4" />
        <Skeleton className="mb-4 h-5 w-1/2" />
        <Skeleton className="mb-8 h-12 w-full" />
        <div className="space-y-4">
          <LectureSkeleton />
          <LectureSkeleton />
          <LectureSkeleton />
        </div>
      </div>
    );
  }
  if (!subjectDetails) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/batches/${batchId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subjects
        </Link>
      </Button>

      <h1 className="mb-2 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        {subjectDetails.subject_name}
      </h1>
      <p className="mb-4 text-muted-foreground">
        Start your learning journey with the modules below.
      </p>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search lectures and notes..."
          className="w-full pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <Clapperboard className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-6 font-headline text-xl font-semibold">
            {searchTerm ? 'No Results Found' : 'Content Coming Soon'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search terms.'
              : 'The curriculum for this subject is being finalized. Please check back later.'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filteredVideos.map(video => (
          <Card key={video.serial} className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="relative h-48 md:h-full">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 md:col-span-2">
                <p className="text-sm text-muted-foreground">
                  Lecture {video.serial} &bull; {video.published_date}
                </p>
                <h3 className="font-headline text-lg font-semibold mt-1">
                  {video.title}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link
                      href={`/videos/${encodeURIComponent(
                        video.video_url
                      )}?title=${encodeURIComponent(
                        video.title
                      )}&date=${encodeURIComponent(video.published_date)}`}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Play Video
                    </Link>
                  </Button>
                  {video.notes &&
                    video.notes.map((note, index) => (
                      <Dialog key={index}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            {video.notes.length > 1
                              ? `Note ${index + 1}`
                              : 'View Notes'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="h-screen max-h-[95svh] w-screen max-w-[95vw] flex flex-col p-0">
                          <DialogHeader className="p-4 border-b">
                            <DialogTitle className="font-headline">
                              {note.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1">
                            <iframe
                              src={note.url}
                              className="h-full w-full border-0"
                              title={note.title}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
