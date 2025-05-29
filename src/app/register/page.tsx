
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AttendeeForm, type AttendeeFormValues } from '@/components/AttendeeForm';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useAttendees, REGISTRATION_LIMIT } from '@/hooks/useAttendees';
import type { Attendee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Home } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterPage() {
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { attendees, addAttendee, isLoading: attendeesLoading, error: attendeesHookError } = useAttendees();
  const { toast } = useToast();
  
  // Local error state for this page, distinct from the hook's error
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    // If the hook has an error (e.g., from fetching attendees), display it.
    if (attendeesHookError) {
      setPageError(attendeesHookError);
    }
  }, [attendeesHookError]);

  const registrationLimitReached = !attendeesLoading && attendees.length >= REGISTRATION_LIMIT;

  const handleRegister = async (values: AttendeeFormValues) => {
    setIsSubmitting(true);
    setPageError(null); // Clear previous page-specific errors
    let profileImageUri: string | undefined = undefined;

    if (registrationLimitReached) {
        setPageError(`Registration limit of ${REGISTRATION_LIMIT} reached. Cannot register new attendees.`);
        toast({
            title: "Registration Limit Reached",
            description: `The event has reached its maximum capacity of ${REGISTRATION_LIMIT} attendees.`,
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    if (values.profileImage) {
      try {
        profileImageUri = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(values.profileImage!);
        });
      } catch (imgError) {
        console.error("Image processing failed:", imgError);
        const imgProcessingError = "Could not process the uploaded image. Please try a different image or skip it.";
        setPageError(imgProcessingError);
        toast({
          title: "Image Processing Failed",
          description: imgProcessingError,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const newAttendee = await addAttendee(values.name, values.email, profileImageUri);
      
      if (newAttendee) {
        setRegisteredAttendee(newAttendee);
        toast({
          title: "Attendee Registered!",
          description: `${values.name} has been successfully registered. QR code generated.`,
        });
      } else {
        // addAttendee returned null, meaning an error occurred in the hook (e.g. Firestore issue or limit reached).
        // The useAttendees hook's `error` state (attendeesHookError) should be updated by the hook itself.
        // We rely on the useEffect above to set pageError from attendeesHookError.
        // No need to throw a new error here.
        // If attendeesHookError is already set, it will be shown by the Alert.
        // If it's specifically a limit error caught by the hook, it will also be in attendeesHookError.
        if (!attendeesHookError) { // If hook didn't set an error, set a generic one
             setPageError("Failed to register attendee. Please check the details and try again.");
        }
      }
    } catch (unexpectedError) {
      console.error("Unexpected error during registration submission:", unexpectedError);
      const unexpectedMsg = (unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred. Please try again.");
      setPageError(unexpectedMsg);
      toast({
        title: "Registration Failed",
        description: unexpectedMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (registeredAttendee) {
    return (
      <div className="flex flex-col items-center py-8">
        <QRCodeDisplay 
          value={registeredAttendee.qrCodeValue} 
          attendeeName={registeredAttendee.name} 
        />
        <Button 
          onClick={() => setRegisteredAttendee(null)} 
          variant="outline" 
          className="mt-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Register Another Attendee
        </Button>
      </div>
    );
  }

  if (attendeesLoading && !pageError) {
    return (
      <div className="flex flex-col items-center space-y-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Register for Our Event</h1>
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (registrationLimitReached && !pageError) { // Show limit reached message if not already showing another error
     return (
      <div className="flex flex-col items-center py-8 space-y-6 text-center">
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
          <AlertTitle className="text-xl font-semibold">Registrations Full</AlertTitle>
          <AlertDescription className="text-base">
            We're sorry, the event has reached its maximum registration capacity of {REGISTRATION_LIMIT} attendees.
            No new registrations are being accepted at this time. Please contact the event organizer for more information.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" /> Go to Home Page
          </Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Register for Our Event</h1>
      {(pageError || attendeesHookError) && ( // Show error from page state or hook state
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{pageError || attendeesHookError}</AlertDescription>
        </Alert>
      )}
      <AttendeeForm 
        onSubmit={handleRegister} 
        isSubmitting={isSubmitting} 
        disabled={registrationLimitReached} // Disable form if limit is reached
      />
    </div>
  );
}
