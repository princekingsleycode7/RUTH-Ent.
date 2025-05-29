
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AttendeeForm, type AttendeeFormValues } from '@/components/AttendeeForm';
import { AttendeeIdCard } from '@/components/AttendeeIdCard'; 
import { useAttendees, REGISTRATION_LIMIT } from '@/hooks/useAttendees';
import type { Attendee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Home, Download, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import html2canvas from 'html2canvas';

const eventDetails = {
  name: "SPARK CONFERENCE 2025",
  venue: "No 7 Item Street, Umuahia, Abia State, Nigeria",
  time: "10:00 AM", // Separated time from date for clarity on card
  date: "16 August 2025",
  logoUrl: "https://storage.googleapis.com/idx-dev-01hsv3s9y3m1x07w3r6f3pn49w/images/spark_logo_1717171878053.png",
};


export default function RegisterPage() {
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { attendees, addAttendee, isLoading: attendeesLoading, error: attendeesHookError } = useAttendees();
  const { toast } = useToast();
  const idCardRef = useRef<HTMLDivElement>(null);
  
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (attendeesHookError) {
      setPageError(attendeesHookError);
    }
  }, [attendeesHookError]);

  const registrationLimitReached = !attendeesLoading && attendees.length >= REGISTRATION_LIMIT;

  const handleRegister = async (values: AttendeeFormValues) => {
    setIsSubmitting(true);
    setPageError(null);
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
      // The dateOfBirth from AttendeeFormValues is already a Date object due to z.coerce.date()
      const newAttendee = await addAttendee(
        values.name, 
        values.email, 
        profileImageUri,
        values.phoneNumber,
        values.dateOfBirth // This is a Date object
      );
      
      if (newAttendee) {
        setRegisteredAttendee(newAttendee);
        toast({
          title: "Attendee Registered!",
          description: `${values.name} has been successfully registered. Your ID card is ready.`,
        });
      } else {
         if (!attendeesHookError && !pageError) {
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

  const handleDownloadIdCard = () => {
    if (idCardRef.current && registeredAttendee) {
      html2canvas(idCardRef.current, { 
        scale: 2, 
        useCORS: true, // Important for external images like logos
        allowTaint: true, // May help if CORS is restrictive and image can't be loaded cleanly
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${registeredAttendee.name.replace(/\s+/g, '_')}_ID_Card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: "ID Card Downloading", description: "Your ID card image is being downloaded." });
      }).catch(err => {
        console.error("Error generating ID card image:", err);
        toast({ variant: "destructive", title: "Download Failed", description: "Could not generate ID card image. Check console for details." });
      });
    }
  };

  const handleEmailIdCard = () => {
    if (registeredAttendee) {
      const subject = `Your Event ID Card for ${eventDetails.name}`;
      const body = `Hello ${registeredAttendee.name},\n\nPlease find your event details attached or download your ID card.\n\nEvent: ${eventDetails.name}\nVenue: ${eventDetails.venue}\nDate: ${eventDetails.date}\nTime: ${eventDetails.time}\n\nView/Scan your QR: ${window.location.origin}/attendee/${registeredAttendee.id}\n\nWe look forward to seeing you!`;
      const mailtoLink = `mailto:${registeredAttendee.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      toast({
        title: "Email ID Card (Placeholder)",
        description: "To email your ID card, please download it and attach it to an email. A new email draft may have opened.",
        action: (
          <Button variant="outline" size="sm" asChild>
            <a href={mailtoLink}>Open Email Client</a>
          </Button>
        )
      });
    }
  };
  
  if (registeredAttendee) {
    return (
      <div className="flex flex-col items-center pt-4 pb-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-center">Registration Successful!</h1>
        <p className="text-muted-foreground text-center">Here is your event ID card, {registeredAttendee.name}.</p>
        
        <AttendeeIdCard 
          attendee={registeredAttendee} 
          eventDetails={eventDetails}
          idCardRef={idCardRef}
        />
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-sm">
          <Button onClick={handleDownloadIdCard} className="w-full" variant="default" size="lg">
            <Download className="mr-2 h-5 w-5" /> Download ID Card
          </Button>
          <Button onClick={handleEmailIdCard} className="w-full" variant="secondary" size="lg">
            <Mail className="mr-2 h-5 w-5" /> Email ID Card
          </Button>
        </div>
        <Button 
          onClick={() => setRegisteredAttendee(null)} 
          variant="outline" 
          className="mt-4"
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

  if (registrationLimitReached && !pageError) { 
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
       <p className="text-center text-muted-foreground max-w-xl">
        Join us for the <span className="font-semibold text-primary">{eventDetails.name}</span>! 
        Fill out the form below to secure your spot. 
        Your personalized ID card with a QR code for check-in will be generated upon successful registration.
      </p>
      {(pageError || attendeesHookError) && (
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{pageError || attendeesHookError}</AlertDescription>
        </Alert>
      )}
      <AttendeeForm 
        onSubmit={handleRegister} 
        isSubmitting={isSubmitting} 
        disabled={registrationLimitReached}
      />
    </div>
  );
}
