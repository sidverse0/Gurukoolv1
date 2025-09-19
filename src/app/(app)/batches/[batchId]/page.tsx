
'use client';

import Link from 'next/link';
import { notFound, usePathname } from 'next/navigation';
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
import type { SubjectDetails } from '@/lib/types';
import { Input } from '@/components/ui/input';

export default function BatchDetailsPage({
  params,
}: {
  params: { batchId: string };
}) {
  const [batchDetails, setBatchDetails] = useState<SubjectDetails | null>(null);
  const [filteredDetails, setFilteredDetails] =
    useState<SubjectDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      const details = await getBatchDetails(params.batchId);
      if (!details) {
        notFound();
      }
      setBatchDetails(details);
      setFilteredDetails(details);
    }
    fetchData();
  }, [params.batchId]);

  useEffect(() => {
    if (!batchDetails) return;

    if (searchTerm === '') {
      setFilteredDetails(batchDetails);
      return;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredSubjects = batchDetails.subjects
      .map(subject => {
        const filteredVideos = subject.videos.filter(video =>
          video.title.toLowerCase().includes(lowercasedFilter)
        );
        const filteredNotes = subject.notes.filter(note =>
          note.title.toLowerCase().includes(lowercasedFilter)
        );

        if (filteredVideos.length > 0 || filteredNotes.length > 0) {
          return {
            ...subject,
            videos: filteredVideos,
            notes: filteredNotes,
          };
        }
        return null;
      })
      .filter(Boolean);

    setFilteredDetails({
      ...batchDetails,
      subjects: filteredSubjects as any,
    });
  }, [searchTerm, batchDetails]);

  if (!filteredDetails) {
    return (
      <div className="container mx-auto flex h-full max-w-4xl items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/batches">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Batches
        </Link>
      </Button>

      <h1 className="mb-2 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        {filteredDetails.title}
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

      {filteredDetails.subjects.length === 0 && (
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

      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={
          filteredDetails.subjects.length > 0
            ? filteredDetails.subjects[0].id
            : undefined
        }
      >
        {filteredDetails.subjects.map(subject => (
          <AccordionItem key={subject.id} value={subject.id}>
            <AccordionTrigger className="font-headline text-lg hover:no-underline">
              {subject.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {subject.videos.map(video => (
                  <Dialog key={video.url}>
                    <DialogTrigger asChild>
                      <div className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary">
                        <div className="flex items-center gap-4">
                          <Clapperboard className="h-5 w-5 text-primary" />
                          <p className="font-medium">{video.title}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {video.duration}
                        </span>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="font-headline">
                          {video.title}
                        </DialogTitle>
                      </DialogHeader>
                      <VideoPlayer videoId={video.url} />
                    </DialogContent>
                  </Dialog>
                ))}
                {subject.notes.map(note => (
                  <Dialog key={note.title}>
                    <DialogTrigger asChild>
                      <div className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary">
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-accent" />
                          <p className="font-medium">{note.title}</p>
                        </div>
                        <span className="text-sm font-medium text-accent">
                          View PDF
                        </span>
                      </div>
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
