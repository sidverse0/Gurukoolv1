'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut, User } from 'lucide-react';


export function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'GU';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/90 px-4 backdrop-blur-lg md:px-6">
      <div className="hidden items-center gap-2 md:flex">
         <Link href="/home" className="flex items-center gap-2">
          <Icons.Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-bold">EduStream</span>
        </Link>
      </div>

      <div className="flex-1" />

      {/* Profile Dropdown Removed as requested */}
    </header>
  );
}
