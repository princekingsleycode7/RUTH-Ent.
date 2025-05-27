import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Using Inter as a clean, modern alternative
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono', // Updated variable name
});

export const metadata: Metadata = {
  title: 'SwiftCheck - Event Attendance Management',
  description: 'Efficiently manage event attendance with QR codes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container py-8">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
