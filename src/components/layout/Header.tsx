
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { UserPlus, LayoutDashboard, QrCode, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const SPARK_LOGO_URL = "https://storage.googleapis.com/idx-dev-01hsv3s9y3m1x07w3r6f3pn49w/images/spark_logo_1717171878053.png";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logoutAdmin, isAuthLoading } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin-login'); 
  };

  const navItems = [
    ...(isAdmin ? [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
      { href: '/register', label: 'Register New', icon: UserPlus, id: 'register-admin' }, // Keep for admin convenience
    ] : []),
    { href: '/scan', label: 'Scan QR', icon: QrCode, id: 'scan' },
  ];
  
  if (isAuthLoading) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-24 sm:h-10 sm:w-32"> 
              <Image 
                src={SPARK_LOGO_URL} 
                alt="SPARK Conference Logo" 
                fill
                priority
                style={{ objectFit: 'contain' }}
                data-ai-hint="event spark logo"
              />
            </div>
          </Link>
          <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
           <div className="relative h-8 w-24 sm:h-10 sm:w-32">
            <Image 
              src={SPARK_LOGO_URL} 
              alt="SPARK Conference Logo" 
              fill
              priority
              style={{ objectFit: 'contain' }}
              data-ai-hint="event spark logo"
            />
          </div>
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
            pathname !== '/admin-login' && ( 
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
