import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBatchDetails } from '@/lib/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clapperboard, FileText } from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default async function BatchDetailsPage({
  params,
}: {
  params: { batchId: string };
}) {
  const batchDetails = await getBatchDetails(params.batchId);

  if (!batchDetails) {
    notFound();
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
        {batchDetails.title}
      </h1>
      <p className="mb-8 text-muted-foreground">
        Start your learning journey with the modules below.
      </p>

      {batchDetails.subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <Clapperboard className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-6 font-headline text-xl font-semibold">
            Content Coming Soon
          </h2>
          <p className="mt-2 text-muted-foreground">
            The curriculum for this batch is being finalized. Please check back
            later.
          </p>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        {batchDetails.subjects.map(subject => (
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
                  <a
                    key={note.title}
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-accent" />
                      <p className="font-medium">{note.title}</p>
                    </div>
                    <span className="text-sm font-medium text-accent">
                      View PDF
                    </span>
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
