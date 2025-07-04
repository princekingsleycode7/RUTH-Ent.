
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, UserPlus, ShieldCheck, UserCircle, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-12 py-8 px-4 text-center">
      
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary mb-6">
          Welcome to SwiftCheck!
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-10">
          Effortless event check-ins and attendee management. Register, scan QR codes, and enjoy personalized welcome messages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
          <CardHeader>
            <div className="flex items-center justify-center mb-3">
              <UserPlus className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl">New? Register Here!</CardTitle>
            <CardDescription>Join our event by registering. You'll get a personalized QR code for easy check-in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/register">
                <UserPlus className="mr-2 h-5 w-5" /> Register for Event
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
          <CardHeader>
            <div className="flex items-center justify-center mb-3">
              <UserCircle className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl">Already Registered?</CardTitle>
            <CardDescription>Scan your QR code to view your details or get checked in quickly at events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/scan">
                <QrCode className="mr-2 h-5 w-5" /> Scan QR / View Info
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
          <CardHeader>
            <div className="flex items-center justify-center mb-3">
              <ShieldCheck className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl">For Administrators</CardTitle>
            <CardDescription>Access the dashboard to manage attendees, view stats, and oversee event check-ins.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href="/admin-login">
                <LogIn className="mr-2 h-5 w-5" /> Admin Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12 w-full max-w-5xl">
         <Card className="overflow-hidden shadow-lg">
            <Image 
                src="/images/banner2.JPG" 
                alt="Event attendees smiling" 
                width={1200} 
                height={400} 
                className="object-cover w-full"
                data-ai-hint="event conference"
            />
            
         </Card>
      </div>

      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} SwiftCheck. All rights reserved.</p>
        <p>Powered by CETF😎 and Firebase.</p>
      </footer>
    </div>
  );
}
