
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, FileText, Home, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/batches', label: 'Batches', icon: BookCopy },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/notes',label: 'Notes', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  const mainLinks = links.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm">
      <div className="grid h-16 grid-cols-5">
        {mainLinks.map(link => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group inline-flex flex-col items-center justify-center p-1 text-center text-muted-foreground',
                isActive && 'text-primary'
              )}
            >
              <link.icon className="mb-1 h-6 w-6" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
