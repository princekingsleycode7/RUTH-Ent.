
"use client";

import { useState, useEffect } from 'react';
import { AttendeeForm, type AttendeeFormValues } from '@/components/AttendeeForm';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useAttendees } from '@/hooks/useAttendees';
import type { Attendee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterPage() {
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAttendee, error: attendeesError } = useAttendees();
  const { toast } = useToast();
  const { isAdmin, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return; 

    if (!isAdmin) {
      router.replace('/admin-login');
    }
  }, [isAdmin, isAuthLoading, router]);

  const handleRegister = async (values: AttendeeFormValues) => {
    setIsSubmitting(true);
    let profileImageUri: string | undefined = undefined;

    if (values.profileImage) {
      try {
        profileImageUri = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(values.profileImage!);
        });
      } catch (error) {
        console.error("Image processing failed:", error);
        toast({
          title: "Image Processing Failed",
          description: "Could not process the uploaded image. Please try a different image or skip it.",
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
  
  if (isAuthLoading || (!isAdmin && !isAuthLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p>Verifying access...</p>
        <Skeleton className="w-full max-w-lg h-64 mt-4" />
      </div>
    );
  }


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
      <h1 className="text-3xl font-bold tracking-tight">Register New Attendee</h1>
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
