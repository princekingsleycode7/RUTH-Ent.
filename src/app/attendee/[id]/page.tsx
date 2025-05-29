
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, CalendarClock, MessageSquareHeart } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AttendeePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  
  const { getAttendeeById, checkInAttendee: markAttendeeCheckedIn, isLoading: attendeesLoading, error: attendeesError } = useAttendees();
  const [attendee, setAttendee] = useState<Attendee | null | undefined>(undefined);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPageError(attendeesError);
  }, [attendeesError]);

  useEffect(() => {
    if (attendeesLoading) {
      setPageLoading(true);
      return;
    }
    if (!id) {
      setPageLoading(false);
      setPageError("Invalid attendee ID.");
      setAttendee(null);
      return;
    }

    const fetchedAttendee = getAttendeeById(id);
    
    if (fetchedAttendee) {
      setAttendee(fetchedAttendee); // Set initially
      if (!fetchedAttendee.checkedIn) {
        markAttendeeCheckedIn(id)
          .then(updatedAttendeeFromHook => {
            // Note: The hook's onSnapshot will update the `attendee` state reactively.
            // So, `updatedAttendeeFromHook` is more for immediate logical branching here.
            if (updatedAttendeeFromHook || getAttendeeById(id)?.checkedIn) { // Check local state or hook return
              generateCheckInConfirmation({
                attendeeName: fetchedAttendee.name || 'Valued Attendee',
                eventName: 'SwiftCheck Event',
                timeSinceLastVisit: 'their first visit this year', // Placeholder
              }).then(aiResponse => {
                setConfirmationMessage(aiResponse.confirmationMessage);
              }).catch(aiError => {
                console.error("AI confirmation error:", aiError);
                setConfirmationMessage("Welcome! We're delighted to have you.");
                 toast({
                    variant: 'destructive',
                    title: 'AI Message Error',
                    description: 'Could not generate personalized message.',
                  });
              });
            } else {
                setPageError("Failed to check-in attendee. Please try again.");
                 toast({
                    variant: 'destructive',
                    title: 'Check-in Failed',
                    description: 'Could not complete check-in process.',
                  });
            }
          })
          .catch(checkInError => {
            console.error("Check-in error:", checkInError);
            setPageError("An error occurred during check-in.");
            toast({
              variant: 'destructive',
              title: 'Check-in Error',
              description: 'An unexpected error occurred.',
            });
          });
      } else {
        // If already checked in when page loads
        setConfirmationMessage("This attendee has already been checked in.");
      }
    } else {
      setAttendee(null);
      setPageError("Attendee not found. Please ensure the QR code is correct or contact support.");
    }
    setPageLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, attendeesLoading, getAttendeeById, markAttendeeCheckedIn, toast]); // Added toast to dep array

  // This effect handles changes to `attendee` from the onSnapshot listener in useAttendees
  useEffect(() => {
    if (attendee?.checkedIn && attendee.checkInTime && !confirmationMessage?.includes("already been checked in")) {
        // If attendee becomes checked-in and we haven't shown "already checked in"
        // This might re-trigger AI if not handled carefully, or be used to update status display
    }
  }, [attendee, confirmationMessage]);


  if (pageLoading || (attendeesLoading && attendee === undefined) ) { // Refined loading condition
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4 border-4" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (pageError) {
     return (
      <Card className="w-full max-w-lg mx-auto shadow-lg border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{pageError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!attendee) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Attendee Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested attendee could not be found, or there was an issue loading the data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl transform transition-all hover:scale-[1.01] duration-300">
      <CardHeader className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary shadow-md">
          <AvatarImage 
            src={attendee.profileImageUri || `https://placehold.co/100x100.png?text=${attendee.name.charAt(0)}`} 
            alt={attendee.name} 
            data-ai-hint={attendee.profileImageUri ? "profile person" : "letter avatar"} />
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
            <span className="text-foreground">{format(attendee.checkInTime.toDate(), "PPPp")}</span>
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
