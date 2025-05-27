
"use client";

import { useState } from 'react';
import { AttendeeForm } from '@/components/AttendeeForm';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useAttendees } from '@/hooks/useAttendees';
import type { Attendee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AttendeeFormValues {
  name: string;
  email: string;
}

export default function RegisterPage() {
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAttendee, error: attendeesError } = useAttendees();
  const { toast } = useToast();

  const handleRegister = async (values: AttendeeFormValues) => {
    setIsSubmitting(true);
    try {
      const newAttendee = await addAttendee(values.name, values.email);
      if (newAttendee) {
        setRegisteredAttendee(newAttendee);
        toast({
          title: "Attendee Registered!",
          description: `${values.name} has been successfully registered. QR code generated.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to register attendee due to a problem with data saving.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: (error instanceof Error ? error.message : "Could not register attendee. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredAttendee) {
    return (
      <div className="flex flex-col items-center">
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
    <div className="flex flex-col items-center space-y-4">
      {attendeesError && (
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Attendees</AlertTitle>
          <AlertDescription>{attendeesError}</AlertDescription>
        </Alert>
      )}
      <AttendeeForm onSubmit={handleRegister} isSubmitting={isSubmitting} />
    </div>
  );
}
