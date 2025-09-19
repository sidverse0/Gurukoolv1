
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-secondary p-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="mt-8 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        Search Courses
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Find lectures, notes, and subjects across all your available batches.
      </p>
    </div>
  );
}
