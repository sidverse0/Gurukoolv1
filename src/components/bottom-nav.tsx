
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, Home, Sparkles, User, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/home', label: 'Home', icon: Home, color: 'text-sky-500' },
  { href: '/batches', label: 'Batches', icon: BookCopy, color: 'text-rose-500' },
  { href: '/search', label: 'AI Guruji', icon: Sparkles, color: 'text-amber-500' },
  { href: '/history',label: 'History', icon: History, color: 'text-violet-500' },
  { href: '/profile', label: 'Profile', icon: User, color: 'text-teal-500' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-16 rounded-t-3xl border-t border-border/50 bg-background/90 backdrop-blur-lg md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="grid h-full grid-cols-5">
        {links.map(link => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group relative flex flex-col items-center justify-center text-center text-muted-foreground'
              )}
            >
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:bg-muted',
                isActive ? 'bg-muted' : 'bg-transparent'
              )}>
                <link.icon className={cn('h-6 w-6 transition-all duration-300', isActive ? link.color : 'text-muted-foreground', 'group-hover:' + link.color)} />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-all duration-300',
                 isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {link.label}
              </span>
               <div className={cn('absolute -top-1 h-1 w-0 rounded-full bg-primary transition-all duration-300', isActive && 'w-4')} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
