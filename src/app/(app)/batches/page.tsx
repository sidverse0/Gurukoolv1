
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getBatches } from '@/lib/data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  ArrowRight,
  BookCopy,
  Search,
  Lock,
  Users,
  Clapperboard,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import type { Batch } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { usePurchases } from '@/hooks/use-purchases';

function BatchCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function BuysCounter({ batchId }: { batchId: string }) {
  const [buys, setBuys] = useState(0);

  useEffect(() => {
    // Generate a consistent "random" starting number based on the batch ID
    const seed = batchId.charCodeAt(0) + (batchId.charCodeAt(1) || 0);
    const startBuys = 13000 + (seed % 5000);
    setBuys(startBuys);

    const interval = setInterval(() => {
      setBuys(prevBuys => prevBuys + Math.floor(Math.random() * 3) + 1);
    }, 60000); // Update every 1 minute

    return () => clearInterval(interval);
  }, [batchId]);

  if (buys === 0) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className="absolute right-2 top-2 animate-pulse"
    >
      <Users className="mr-1.5 h-3 w-3" />
      {buys.toLocaleString()}+ Buys
    </Badge>
  );
}


export default function BatchesPage() {
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { purchasedBatchIds, isLoaded: purchasesLoaded } = usePurchases();

  useEffect(() => {
    async function fetchBatches() {
      setLoading(true);
      const batches = await getBatches();
      setAllBatches(batches);
      setLoading(false);
    }
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!purchasesLoaded) return;

    const availableBatches = allBatches.filter(
      batch => !purchasedBatchIds.includes(batch.id)
    );

    if (searchTerm === '') {
      setFilteredBatches(availableBatches);
      return;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = availableBatches.filter(
      batch =>
        batch.title.toLowerCase().includes(lowercasedFilter) ||
        (batch.instructor &&
          batch.instructor.toLowerCase().includes(lowercasedFilter))
    );
    setFilteredBatches(filtered);
  }, [searchTerm, allBatches, purchasedBatchIds, purchasesLoaded]);

  const getImage = (thumbnailId: string) => {
    return PlaceHolderImages.find(img => img.id === thumbnailId);
  };

  const isPaidBatch = (batch: Batch) => batch.id === 'bpsc70';
  const batchPrice = '199';

  const isLoading = loading || !purchasesLoaded;


  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          All Batches
        </h1>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search batches..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <BatchCardSkeleton />
          <BatchCardSkeleton />
          <BatchCardSkeleton />
        </div>
      ) : filteredBatches.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => {
            const image = getImage(batch.thumbnailId);
            const paid = isPaidBatch(batch);
            const totalLectures = batch.subjects.reduce((sum, s) => sum + s.video_count, 0);
            const totalNotes = batch.subjects.reduce((sum, s) => sum + s.note_count, 0);
            
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
                      <Badge variant="secondary" className="text-sm">Paid</Badge>
                    ) : (
                      <Badge className="text-sm">Free</Badge>
                    )}
                  </div>
                  {paid && <BuysCounter batchId={batch.id} />}
                </div>

                <CardHeader className="pt-4 flex-grow">
                  <CardTitle className="font-body text-lg font-bold">
                    {batch.title}
                  </CardTitle>
                   <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clapperboard className="mr-1.5 h-4 w-4" />
                      <span>{totalLectures} Lectures</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="mr-1.5 h-4 w-4" />
                      <span>{totalNotes} Notes</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {batch.instructor && (
                    <p className="text-sm text-muted-foreground">By {batch.instructor}</p>
                  )}
                </CardContent>
                <CardFooter className="flex-col items-start p-4">
                  {paid ? (
                     <div className="w-full space-y-4">
                      <div className='w-full h-px bg-border' />
                      <div className="flex w-full items-center justify-between">
                          <p className="font-headline text-2xl font-bold text-primary">
                            ₹{batchPrice}
                          </p>
                          <Button asChild>
                            <Link href={`/buy/${batch.id}`}>
                              <Lock className="mr-2" />
                              Buy Now
                            </Link>
                          </Button>
                      </div>
                     </div>
                  ) : (
                     <Button asChild className="w-full">
                        <Link href={`/batches/${batch.id}`}>
                          Let's Study <ArrowRight className="ml-2" />
                        </Link>
                      </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <BookCopy className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-6 font-headline text-xl font-semibold">
            {searchTerm ? 'No Batches Found' : 'All Batches Purchased!'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {searchTerm
              ? `Your search for "${searchTerm}" did not match any available batches.`
              : 'You have access to all available batches.'}
          </p>
        </div>
      )}
    </div>
  );
}

    