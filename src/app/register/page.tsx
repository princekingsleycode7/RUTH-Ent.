
"use client";

import { useState } from 'react';
import { AttendeeForm, type AttendeeFormValues } from '@/components/AttendeeForm';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useAttendees } from '@/hooks/useAttendees';
import type { Attendee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RegisterPage() {
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAttendee, error: attendeesError } = useAttendees(); // attendeesError is from the hook
  const { toast } = useToast();

  const handleRegister = async (values: AttendeeFormValues) => {
    setIsSubmitting(true);
    let profileImageUri: string | undefined = undefined;

    if (values.profileImage) {
      try {
        profileImageUri = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error); // This reject will be caught by the catch block below
          reader.readAsDataURL(values.profileImage!);
        });
      } catch (imgError) {
        console.error("Image processing failed:", imgError);
        toast({
          title: "Image Processing Failed",
          description: "Could not process the uploaded image. Please try a different image or skip it.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return; // Exit early if image processing fails
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
        // addAttendee returned null. This means an error occurred in useAttendees (e.g., Firestore issue).
        // The useAttendees hook has already called setError, so its `error` state (attendeesError here) will be updated.
        // The Alert component (already in the JSX below) will display this attendeesError.
        // No need to throw a new error here or show another toast for this specific case.
        // The console.error for the specific Firestore error is handled within useAttendees.
      }
    } catch (unexpectedError) {
      // This catch block is now for other unexpected errors that might occur
      // (e.g., if addAttendee itself threw an unhandled exception, though it's designed to return null on caught errors).
      console.error("Unexpected error during registration submission:", unexpectedError);
      toast({
        title: "Registration Failed",
        description: (unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred. Please try again."),
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

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Register for Our Event</h1>
      {attendeesError && (
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error with Attendee Data</AlertTitle>
          <AlertDescription>{attendeesError}</AlertDescription>
        </Alert>
      )}
      <AttendeeForm onSubmit={handleRegister} isSubmitting={isSubmitting} />
    </div>
  );
}
