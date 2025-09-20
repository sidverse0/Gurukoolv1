import { Icons } from './icons';

export function PageLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-dotted border-primary" />
        <Icons.Logo className="h-24 w-24" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        GuruKool is loading...
      </p>
    </div>
  );
}
