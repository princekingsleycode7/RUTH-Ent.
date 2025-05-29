
"use client";

import Link from 'next/link';
import { Ticket, UserPlus, LayoutDashboard, QrCode, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isAuthenticated, logoutAdmin, isAuthLoading } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin-login'); // Or to landing page '/'
  };

  // Base navigation items for all users
  const baseNavItems = [
    ...(isAuthenticated ? [{ href: '/scan', label: 'Scan QR', icon: QrCode, id: 'scan' }] : []),
  ];

  // Admin-specific navigation items
  const adminNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { href: '/register', label: 'Register Attendee', icon: UserPlus, id: 'register' },
  ];

  let navItems = [...baseNavItems];
  if (isAdmin) {
    navItems = [...adminNavItems, ...navItems.filter(item => !adminNavItems.find(adminItem => adminItem.id === item.id))]; // Ensure no duplicates
  }
  
  if (isAuthLoading) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Ticket className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-primary">SwiftCheck</span>
          </Link>
          <div className="h-8 w-24 bg-muted rounded animate-pulse"></div> {/* Skeleton for nav items */}
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">SwiftCheck</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'default' : 'ghost'}
              size="sm"
              asChild
              className={cn(pathname === item.href && "shadow-md")}
            >
              <Link href={item.href} className="flex items-center gap-1 sm:gap-2">
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </Button>
          ))}
          {isAdmin ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1 sm:ml-2">Logout</span>
            </Button>
          ) : (
            pathname !== '/admin-login' && ( // Don't show login if already on login page
                 <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin-login" className="flex items-center gap-1 sm:gap-2">
                        <LogIn className="h-4 w-4" />
                        <span className="hidden sm:inline">Admin</span>
                    </Link>
                </Button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
