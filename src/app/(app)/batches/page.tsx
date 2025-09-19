
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getBatches } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookCopy, Search, Lock } from 'lucide-react';
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
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
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

    // Filter out purchased batches from the main list
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
          {filteredBatches.map((batch, index) => {
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

                <CardHeader className="pt-4">
                  <CardTitle className="font-body text-lg font-bold">
                    {batch.title}
                  </CardTitle>
                  {batch.instructor && (
                    <CardDescription>By {batch.instructor}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                   {paid && (
                    <div className="flex items-baseline justify-center">
                      <span className="font-headline text-4xl font-bold tracking-tight text-primary">
                        ₹{batchPrice}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {paid ? (
                     <Button asChild className="w-full">
                        <Link href={`/buy/${batch.id}`}>
                          <Lock className="mr-2" />
                           Buy Now
                        </Link>
                      </Button>
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
