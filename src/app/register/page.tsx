"use client";

import { useState } from 'react';
import { AttendeeForm } from '@/components/AttendeeForm';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useAttendees } from '@/hooks/useAttendees';
import type { Attendee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AttendeeFormValues {
  name: string;
  email: string;
}

export default function RegisterPage() {
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAttendee } = useAttendees();
  const { toast } = useToast();

  const handleRegister = async (values: AttendeeFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const newAttendee = addAttendee(values.name, values.email);
      setRegisteredAttendee(newAttendee);
      toast({
        title: "Attendee Registered!",
        description: `${values.name} has been successfully registered.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "Could not register attendee. Please try again.",
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
    <div className="flex flex-col items-center">
      <AttendeeForm onSubmit={handleRegister} isSubmitting={isSubmitting} />
    </div>
  );
}
