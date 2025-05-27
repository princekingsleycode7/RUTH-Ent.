"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAttendees } from '@/hooks/useAttendees';
import type { Attendee } from '@/lib/types';
import { generateCheckInConfirmation } from '@/ai/flows/smart-check-in-confirmation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Mail, User, CalendarClock, MessageSquareHeart } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AttendeePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  
  const { getAttendeeById, checkInAttendee: markAttendeeCheckedIn } = useAttendees();
  const [attendee, setAttendee] = useState<Attendee | null | undefined>(undefined); // undefined for loading, null for not found
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      // Simulate data fetching delay
      setTimeout(async () => {
        const fetchedAttendee = getAttendeeById(id);
        
        if (fetchedAttendee) {
          if (!fetchedAttendee.checkedIn) {
            const updatedAttendee = markAttendeeCheckedIn(id);
            setAttendee(updatedAttendee);
            try {
              const aiResponse = await generateCheckInConfirmation({
                attendeeName: updatedAttendee?.name || 'Valued Attendee',
                eventName: 'SwiftCheck Event',
                timeSinceLastVisit: 'their first visit this year', // Placeholder
              });
              setConfirmationMessage(aiResponse.confirmationMessage);
            } catch (aiError) {
              console.error("AI confirmation error:", aiError);
              setConfirmationMessage("Welcome! We're delighted to have you."); // Fallback AI message
            }
          } else {
            setAttendee(fetchedAttendee);
            setConfirmationMessage("This attendee has already been checked in.");
          }
        } else {
          setAttendee(null); // Not found
          setError("Attendee not found. Please ensure the QR code is correct or contact support.");
        }
        setIsLoading(false);
      }, 500);
    } else {
      setIsLoading(false);
      setError("Invalid attendee ID.");
      setAttendee(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getAttendeeById, markAttendeeCheckedIn]); // markAttendeeCheckedIn is stable, getAttendeeById may change if attendees list changes

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
     return (
      <Card className="w-full max-w-lg mx-auto shadow-lg border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!attendee) {
    // This case should ideally be covered by the error state, but as a fallback:
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Attendee Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested attendee could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl transform transition-all hover:scale-[1.01] duration-300">
      <CardHeader className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary shadow-md">
          <AvatarImage src={`https://placehold.co/100x100.png?text=${attendee.name.charAt(0)}`} alt={attendee.name} data-ai-hint="profile person" />
          <AvatarFallback>{attendee.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl font-bold text-primary">{attendee.name}</CardTitle>
        <CardDescription className="text-lg">{attendee.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
          <div className="flex items-center gap-2 text-secondary-foreground">
            {attendee.checkedIn ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-yellow-500" />}
            <span className="font-medium">Status:</span>
          </div>
          <Badge variant={attendee.checkedIn ? 'default' : 'secondary'} className={attendee.checkedIn ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}>
            {attendee.checkedIn ? 'Checked In' : 'Pending Check-In'}
          </Badge>
        </div>

        {attendee.checkedIn && attendee.checkInTime && (
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md text-sm">
            <CalendarClock className="h-5 w-5 text-primary" />
            <span className="font-medium text-muted-foreground">Checked In At:</span>
            <span className="text-foreground">{format(parseISO(attendee.checkInTime), "PPPp")}</span>
          </div>
        )}

        {confirmationMessage && (
          <div className="p-4 border border-accent/50 bg-accent/10 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <MessageSquareHeart className="h-6 w-6 text-accent shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-accent-foreground">SwiftCheck Says:</p>
                <p className="text-sm text-accent-foreground/80">{confirmationMessage}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
