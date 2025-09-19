
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, Home, Bot, User, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icons } from './icons';

const links = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/batches', label: 'Batches', icon: BookCopy },
  { href: '/search', label: 'AI Guruji', icon: Bot },
  { href: '/history',label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex flex-col flex-grow border-r border-border/50 bg-background/90 backdrop-blur-lg overflow-y-auto">
           <div className="flex items-center h-16 px-4 gap-2 border-b border-border/50">
             <Link href="/home" className="flex items-center gap-2">
                <Icons.Logo className="h-8 w-8 text-primary" />
                <span className="font-headline text-xl font-bold">GuruKool</span>
              </Link>
           </div>
           <nav className="flex-1 px-2 py-4 space-y-1">
            {links.map(link => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-base font-medium rounded-md text-muted-foreground transition-colors duration-200 hover:text-primary hover:bg-muted',
                    isActive && 'text-primary bg-muted'
                  )}
                >
                  <link.icon className="mr-3 h-6 w-6" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
           </nav>
        </div>
    </div>
  );
}
