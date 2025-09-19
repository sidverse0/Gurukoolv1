
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getBatches, getSubjectLectures } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Video } from '@/lib/types';
import { ArrowRight, Play, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function HomePage() {
  const allBatches = await getBatches();
  const featuredBatches = allBatches.slice(0, 4);

  const getImage = (thumbnailId: string) => {
    return PlaceHolderImages.find(img => img.id === thumbnailId);
  };

  // Fetch some videos for the "Continue Learning" section
  const subjectData = await getSubjectLectures('bpsc70', '5733');
  const continueLearningVideos: Video[] = subjectData?.videos.slice(0, 3) || [];

  return (
    <div className="container mx-auto">
      {/* Welcome Banner */}
      <div className="mb-8 rounded-lg bg-primary/10 p-6 text-center">
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary md:text-3xl">
          Welcome Back, Guest User!
        </h1>
        <p className="mt-2 text-muted-foreground">
          What would you like to learn today?
        </p>
        <div className="relative mx-auto mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for a course or subject..."
            className="w-full rounded-full bg-background/60 pl-10"
          />
        </div>
      </div>

      <div className="space-y-8">
        {/* Continue Learning Section */}
        <section>
          <h2 className="mb-4 font-headline text-2xl font-semibold">
            Continue Learning
          </h2>
          {continueLearningVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {continueLearningVideos.map(video => (
                <Card
                  key={video.serial}
                  className="group overflow-hidden transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={
                        video.thumbnail ||
                        'https://picsum.photos/seed/video/600/400'
                      }
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 bg-white/80 text-xs text-black backdrop-blur-sm hover:bg-white"
                        asChild
                      >
                        <Link
                          href={`/videos/${encodeURIComponent(
                            video.video_url
                          )}?title=${encodeURIComponent(
                            video.title
                          )}&date=${encodeURIComponent(
                            video.published_date
                          )}`}
                        >
                          <Play className="mr-1.5 h-4 w-4" />
                          Resume
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-2 h-12 font-body text-base font-bold">
                      {video.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {video.published_date}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <h3 className="font-semibold">No Recently Played Videos</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start watching lectures and your history will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Featured Batches Section */}
        <section>
          <h2 className="mb-4 font-headline text-2xl font-semibold">
            Featured Batches
          </h2>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {featuredBatches.map(batch => {
                const image = getImage(batch.thumbnailId);
                return (
                  <CarouselItem
                    key={batch.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1">
                      <Card className="group flex h-full transform flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
                        <div className="relative h-40 w-full">
                          {image && (
                            <Image
                              src={image.imageUrl}
                              alt={batch.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              data-ai-hint={image.imageHint}
                            />
                          )}
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-2 h-14 font-body text-base font-bold">
                            {batch.title}
                          </CardTitle>
                          {batch.instructor && (
                            <CardDescription>
                              By {batch.instructor}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="flex-grow" />
                        <div className="p-4 pt-0">
                          <Button asChild className="w-full">
                            <Link href={`/batches/${batch.id}`}>
                              View Batch <ArrowRight className="ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="ml-12 hidden sm:flex" />
            <CarouselNext className="mr-12 hidden sm:flex" />
          </Carousel>
        </section>
      </div>
    </div>
  );
}
