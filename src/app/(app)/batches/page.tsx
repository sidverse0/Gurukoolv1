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
import {
  ArrowRight,
  BookCopy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function BatchesPage() {
  const batches = await getBatches();

  const getImage = (thumbnailId: string) => {
    return PlaceHolderImages.find(img => img.id === thumbnailId);
  };

  return (
    <div className="container mx-auto">
      <h1 className="mb-8 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        All Batches
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map(batch => {
          const image = getImage(batch.thumbnailId);
          return (
            <Card
              key={batch.id}
              className="flex transform flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
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
              <CardHeader>
                <CardTitle className="font-body text-lg font-bold">
                  {batch.title}
                </CardTitle>
                {batch.instructor && (
                  <CardDescription>By {batch.instructor}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow space-y-4"></CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/batches/${batch.id}`}>
                    Let's Study <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
