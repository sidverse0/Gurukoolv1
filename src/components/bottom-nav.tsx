
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, Home, Bot, User, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/batches', label: 'Batches', icon: BookCopy },
  { href: '/search', label: 'AI Guruji', icon: Bot },
  { href: '/history',label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-border/50 bg-background/90 backdrop-blur-lg">
      <div className="grid h-16 grid-cols-5 px-2">
        {links.map(link => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group relative flex flex-col items-center justify-center p-1 text-center text-muted-foreground transition-colors duration-300 hover:text-primary',
                isActive && 'text-primary'
              )}
            >
              <div className={cn('absolute top-0 h-0.5 w-0 rounded-b-full bg-primary transition-all duration-300', isActive && 'w-8')} />
              <link.icon className="mb-1 h-6 w-6" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
