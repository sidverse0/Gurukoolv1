
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Video, Batch } from '@/lib/types';
import { ArrowRight, Play, Quote, Heart, BookOpen, History } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { usePurchases } from '@/hooks/use-purchases';
import { getBatches } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

function constructVideoUrl(video: Video) {
  const videoObjectString = encodeURIComponent(JSON.stringify(video));
  const baseUrl = `/videos/${encodeURIComponent(
    video.video_url
  )}?videoData=${videoObjectString}`;
  return baseUrl;
}

function VideoCardSkeleton() {
  return (
    <Card className="group overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <CardHeader className="p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
        <Skeleton className="h-3 w-1/2 mt-1" />
      </CardHeader>
    </Card>
  )
}

function BatchCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

const quotes = [
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    text: 'Believe you can and you\'re halfway there.',
    author: 'Theodore Roosevelt',
  },
  {
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
  },
  {
    text: 'Strive not to be a success, but rather to be of value.',
    author: 'Albert Einstein',
  },
  {
    text: 'The journey of a thousand miles begins with a single step.',
    author: 'Lao Tzu',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { favorites, isLoaded: favoritesLoaded } = useFavorites();
  const { purchasedBatchIds, isLoaded: purchasesLoaded } = usePurchases();
  const [purchasedBatches, setPurchasedBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    async function fetchPurchasedBatches() {
      if (!purchasesLoaded) return;
      setLoadingBatches(true);
      const allBatches = await getBatches();
      const userBatches = allBatches.filter(batch => purchasedBatchIds.includes(batch.id));
      setPurchasedBatches(userBatches);
      setLoadingBatches(false);
    }
    fetchPurchasedBatches();
  }, [purchasedBatchIds, purchasesLoaded]);
  
  const getImage = (thumbnailId: string) => {
    return PlaceHolderImages.find(img => img.id === thumbnailId);
  };
  
  const isPaidBatch = (batch: Batch) => batch.id === 'bpsc70' || batch.id === 'ethics';

  const isLoading = !favoritesLoaded || !purchasesLoaded || loadingBatches;

  return (
    <div className="container mx-auto">
      {/* Welcome Banner */}
      <div className="mb-8 rounded-lg bg-primary/10 p-6 text-center">
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary md:text-3xl">
          Welcome Back, {user?.displayName || 'Guest'}!
        </h1>
        <div className="mt-4 flex flex-col items-center justify-center">
          <Quote className="h-6 w-6 text-primary/50" />
          <blockquote className="mt-2 max-w-lg text-center text-lg font-medium text-muted-foreground">
            &ldquo;{currentQuote.text}&rdquo;
          </blockquote>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            - {currentQuote.author}
          </p>
        </div>
      </div>

      <div className="space-y-8">

         {/* My Batches Section */}
        <section>
          <h2 className="mb-4 font-headline text-2xl font-semibold">
            My Batches
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <BatchCardSkeleton />
              <BatchCardSkeleton />
            </div>
          ) : purchasedBatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {purchasedBatches.map(batch => {
                const image = getImage(batch.thumbnailId);
                const paid = isPaidBatch(batch);
                return (
                <Card
                  key={batch.id}
                  className="group flex transform flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                   <div className="relative">
                    {image && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={image.imageUrl}
                          alt={batch.title}
                          fill
                          className="object-cover"
                          data-ai-hint={image.imageHint}
                        />
                      </div>
                    )}
                    <div className="absolute left-2 top-2">
                      {paid ? (
                        <Badge variant="destructive" className="text-sm">Paid</Badge>
                      ) : (
                        <Badge className="text-sm">Free</Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="pt-4 flex-grow">
                    <CardTitle className="font-body text-lg font-bold">
                      {batch.title}
                    </CardTitle>
                    {batch.instructor && (
                      <CardDescription>By {batch.instructor}</CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/batches/${batch.id}`}>
                        Let's Study <ArrowRight className="ml-2" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )})}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No Purchased Batches</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your purchased batches will appear here.
                </p>
                <Button asChild className='mt-6'>
                  <Link href="/batches">Browse Batches</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* My Favorites Section */}
        <section>
          <h2 className="mb-4 font-headline text-2xl font-semibold">
            My Favorites
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <VideoCardSkeleton />
              <VideoCardSkeleton />
              <VideoCardSkeleton />
            </div>
          ) : favorites.length > 0 ? (
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

      </div>

       <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full bg-primary/50 blur-sm animate-pulse"></div>
            <img
              src="https://picsum.photos/seed/sid-dev/100"
              alt="Sid"
              className="relative h-full w-full rounded-full border-2 border-primary"
            />
          </div>
          <span>developed by sid with ❤️</span>
        </div>
      </footer>
    </div>
  );
}
