
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  FileText,
  Home,
  Search,
  User,
} from 'lucide-react';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
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
  const { setOpen } = useSidebar();

  return (
    <>
      <SidebarHeader>
        <Link
          href="/home"
          className="flex items-center gap-2 text-foreground transition-colors hover:text-foreground/80"
          onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
