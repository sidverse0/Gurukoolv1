'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Icons } from './icons';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:hidden">
      <SidebarTrigger />
      <Link href="/home" className="flex items-center gap-2">
        <Icons.Logo className="h-6 w-6 text-primary" />
        <span className="font-headline text-xl font-semibold">EduStream</span>
      </Link>
    </header>
  );
}
