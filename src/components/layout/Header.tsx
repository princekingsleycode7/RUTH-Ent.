
"use client";

import Link from 'next/link';
import { Ticket, UserPlus, LayoutDashboard, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated } = useAuth();

  const navItems = [
    ...(isAdmin ? [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ href: '/register', label: 'Register Attendee', icon: UserPlus }] : []),
    ...(isAuthenticated ? [{ href: '/scan', label: 'Scan QR', icon: QrCode }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">SwiftCheck</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'default' : 'ghost'}
              asChild
              className={cn(pathname === item.href && "shadow-md")}
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
