
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBatchDetails } from '@/lib/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clapperboard, FileText, Search } from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import type { SubjectDetails, Video, Note } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function BatchDetailsPage({
  params,
}: {
  params: { batchId: string };
}) {
  const [batchDetails, setBatchDetails] = useState<SubjectDetails | null>(null);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      const details = await getBatchDetails(params.batchId);
      if (!details) {
        notFound();
      }
      setBatchDetails(details);
      setFilteredVideos(details.videos || []);
    }
    fetchData();
  }, [params.batchId]);

  useEffect(() => {
    if (!batchDetails) return;

    if (searchTerm === '') {
      setFilteredVideos(batchDetails.videos || []);
      return;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = batchDetails.videos.filter(
      video =>
        video.title.toLowerCase().includes(lowercasedFilter) ||
        video.notes.some(note =>
          note.title.toLowerCase().includes(lowercasedFilter)
        )
    );
    setFilteredVideos(filtered);
  }, [searchTerm, batchDetails]);

  if (!batchDetails) {
    return (
      <div className="container mx-auto flex h-full max-w-4xl items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const getYoutubeId = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname === '/embed/') {
        return urlObj.pathname.split('/')[2];
      }
    } catch (e) {
      // invalid url
    }
    return 'qjP4D5_p-m8'; // fallback video
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/batches">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Batches
        </Link>
      </Button>

      <h1 className="mb-2 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        {batchDetails.subject_name}
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
              : 'The curriculum for this batch is being finalized. Please check back later.'}
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Clapperboard className="mr-2 h-4 w-4" />
                        Play Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="font-headline">
                          {video.title}
                        </DialogTitle>
                      </DialogHeader>
                      <VideoPlayer videoId={getYoutubeId(video.hd_video_url)} />
                    </DialogContent>
                  </Dialog>
                  {video.notes.map((note, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          {video.notes.length > 1
                            ? `Note ${index + 1}`
                            : 'View Notes'}
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="h-screen max-h-[95vh] w-screen max-w-[95vw] p-0">
                        <DialogHeader className="p-4">
                          <DialogTitle className="font-headline">
                            {note.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="h-full w-full flex-1">
                          <iframe
                            src={note.url}
                            className="h-full w-full border-0"
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
