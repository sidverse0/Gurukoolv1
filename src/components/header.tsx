
'use client';

import Link from 'next/link';
import { Icons } from './icons';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/90 px-4 backdrop-blur-lg md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/home" className="flex items-center gap-2">
          <Icons.Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-bold md:block hidden">EduStream</span>
        </Link>
      </div>

      <div className="flex-1" />

    </header>
  );
}
