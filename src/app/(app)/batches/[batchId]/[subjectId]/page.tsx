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
  Heart,
  ImageIcon,
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
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';

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
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();


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

  const constructVideoUrl = (video: Video) => {
    const baseUrl = `/videos/${encodeURIComponent(
      video.video_url
    )}?title=${encodeURIComponent(video.title)}&date=${encodeURIComponent(
      video.published_date
    )}`;
    if (video.notes && video.notes.length > 0) {
      return `${baseUrl}&noteUrl=${encodeURIComponent(
        video.notes[0].url
      )}&noteTitle=${encodeURIComponent(video.notes[0].title)}`;
    }
    return baseUrl;
  };
  
  const handleFavoriteClick = (video: Video) => {
    if (isFavorite(video)) {
      removeFavorite(video);
    } else {
      addFavorite(video);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/batches/${batchId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subjects
        </Link>
      </Button>

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
        {filteredVideos.map(video => {
          const favorite = isFavorite(video);
          return (
            <Card key={video.serial} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="relative h-48 md:h-full bg-muted/30 flex items-center justify-center">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  )}
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
                      <Link href={constructVideoUrl(video)}>
                        <Play className="mr-2 h-4 w-4" />
                        Play Video
                      </Link>
                    </Button>
                    <Button variant="ghost" onClick={() => handleFavoriteClick(video)}>
                      <Heart
                        className={cn(
                          'mr-2 h-4 w-4',
                          favorite && 'fill-red-500 text-red-500'
                        )}
                      />
                      Add to favorites
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
