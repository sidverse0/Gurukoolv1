import { FileText } from 'lucide-react';

export default function NotesPage() {
  return (
    <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-secondary p-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="mt-8 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        Your Notes
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        This is where your saved notes from various batches will appear. Start learning and taking notes to see them here!
      </p>
    </div>
  );
}
