
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSubjectLectures } from '@/lib/data';
import type { Video } from '@/lib/types';
import { ArrowRight, Play, Quote, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';

function constructVideoUrl(video: Video) {
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
}

export default function HomePage() {
  const [continueLearningVideos, setContinueLearningVideos] = useState<Video[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavorites();

  useEffect(() => {
    async function fetchContinueLearning() {
      setLoading(true);
      const subjectData = await getSubjectLectures('bpsc70', '5733');
      const videos: Video[] = subjectData?.videos.slice(0, 3) || [];
      setContinueLearningVideos(videos);
      setLoading(false);
    }
    fetchContinueLearning();
  }, []);

  return (
    <div className="container mx-auto">
      {/* Welcome Banner */}
      <div className="mb-8 rounded-lg bg-primary/10 p-6 text-center">
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary md:text-3xl">
          Welcome Back, Guest User!
        </h1>
        <div className="mt-4 flex flex-col items-center justify-center">
          <Quote className="h-6 w-6 text-primary/50" />
          <blockquote className="mt-2 max-w-lg text-center text-lg font-medium text-muted-foreground">
            &ldquo;The only way to do great work is to love what you do.&rdquo;
          </blockquote>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            - Steve Jobs
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* My Favorites Section */}
        <section>
          <h2 className="mb-4 font-headline text-2xl font-semibold">
            My Favorites
          </h2>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map(video => (
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
                        <Link href={constructVideoUrl(video)}>
                          <Play className="mr-1.5 h-4 w-4" />
                          Play
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
                <Heart className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No Favorites Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click the heart icon on a lecture to save it here.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Continue Learning Section */}
        <section>
          <h2 className="mb-4 font-headline text-2xl font-semibold">
            Continue Learning
          </h2>
          {loading ? (
             <p>Loading...</p>
          ) : continueLearningVideos.length > 0 ? (
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
                        <Link href={constructVideoUrl(video)}>
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
      </div>
    </div>
  );
}
