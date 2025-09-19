import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Film, Star } from 'lucide-react';

export default async function HomePage() {
  return (
    <div className="container mx-auto">
      <h1 className="mb-2 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        Welcome Back!
      </h1>
      <p className="mb-8 text-muted-foreground">
        Continue your learning journey.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 font-headline text-2xl font-semibold">
            Recently Played
          </h2>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Film className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-6 font-semibold">No Recently Played Videos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start watching lectures and your history will appear here.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 font-headline text-2xl font-semibold">
            My Favourite Batches
          </h2>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-6 font-semibold">No Favourite Batches Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mark batches as favourites to see them here.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
