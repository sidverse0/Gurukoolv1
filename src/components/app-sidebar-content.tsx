
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  FileText,
  Home,
  Search,
  User,
  LayoutGrid,
} from 'lucide-react';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';

const links = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/batches', label: 'Batches', icon: BookCopy },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User },
];

export function AppSidebarContent() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link
          href="/home"
          className="flex items-center gap-2 text-foreground transition-colors hover:text-foreground/80"
        >
          <Icons.Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-semibold">
            EduStream
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map(link => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(link.href)}
              >
                <Link href={link.href}>
                  <link.icon className="h-5 w-5" />
                  <span className="text-base">{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
