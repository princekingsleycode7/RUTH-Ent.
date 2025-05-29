
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Users, ShieldCheck, UserCircle, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-12 py-8 px-4 text-center">
      
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary mb-6">
          Welcome to SwiftCheck!
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-10">
          Effortless event check-ins and attendee management. Scan QR codes, manage your guests, and get personalized welcome messages with the power of AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
          <CardHeader>
            <div className="flex items-center justify-center mb-3">
              <UserCircle className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl">For Attendees</CardTitle>
            <CardDescription>Already registered? Scan your QR code to view your details or get checked in quickly at events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/scan">
                <QrCode className="mr-2 h-5 w-5" /> Scan Your QR / View Info
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
            <CardDescription>Access the dashboard to manage attendees, register new participants, and oversee event check-ins.</CardDescription>
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
                src="https://placehold.co/1200x400.png" 
                alt="Event attendees smiling" 
                width={1200} 
                height={400} 
                className="object-cover w-full"
                data-ai-hint="event conference"
            />
            <CardContent className="p-6 bg-card/80">
                <h3 className="text-xl font-semibold mb-2">Seamless Event Management</h3>
                <p className="text-card-foreground/70">
                    SwiftCheck streamlines the entire check-in process, providing a smooth experience for both organizers and attendees. 
                    Our platform leverages cutting-edge QR technology and AI-powered personalization to make every interaction memorable.
                </p>
            </CardContent>
         </Card>
      </div>

      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} SwiftCheck. All rights reserved.</p>
        <p>Powered by Next.js, Firebase, and Genkit AI.</p>
      </footer>
    </div>
  );
}
