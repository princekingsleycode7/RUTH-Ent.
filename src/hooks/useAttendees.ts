
"use client";

import type { Attendee } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { AttendeeFormValues } from '@/components/AttendeeForm'; // For dateOfBirth type

const ATTENDEES_COLLECTION = 'attendees';
export const REGISTRATION_LIMIT = 50;

export function useAttendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null); 
    const q = query(collection(db, ATTENDEES_COLLECTION), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAttendees: Attendee[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedAttendees.push({
          id: docSnap.id,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth as Timestamp | undefined,
          checkedIn: data.checkedIn,
          checkInTime: data.checkInTime as Timestamp | undefined,
          qrCodeValue: data.qrCodeValue,
          profileImageUri: data.profileImageUri,
          createdAt: data.createdAt as Timestamp | undefined,
          updatedAt: data.updatedAt as Timestamp | undefined,
        });
      });
      setAttendees(fetchedAttendees);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching attendees from Firestore:", err);
      let errorMessage = "Failed to load attendees. Please try again later.";
      if (err instanceof Error && (err as any).code) {
        errorMessage = `Firestore error fetching attendees: ${(err as any).message} (Code: ${(err as any).code})`;
      } else if (err instanceof Error) {
        errorMessage = `Error fetching attendees: ${err.message}`;
      }
      setError(errorMessage);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addAttendee = useCallback(async (
    name: string, 
    email: string, 
    profileImageUri?: string,
    phoneNumber?: string,
    dateOfBirth?: Date // Comes as Date from AttendeeFormValues
  ): Promise<Attendee | null> => {
    setError(null); 

    if (attendees.length >= REGISTRATION_LIMIT) {
      const limitError = `Registration limit reached (${REGISTRATION_LIMIT}). Cannot add more attendees.`;
      console.warn(limitError);
      setError(limitError);
      return null;
    }

    try {
      const initialData: Partial<Attendee> & { createdAt: any; updatedAt: any; qrCodeValue: string } = {
        name,
        email,
        checkedIn: false,
        qrCodeValue: '', // Placeholder, will be updated
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (profileImageUri) {
        initialData.profileImageUri = profileImageUri;
      }
      if (phoneNumber) {
        initialData.phoneNumber = phoneNumber;
      }
      if (dateOfBirth) {
        initialData.dateOfBirth = Timestamp.fromDate(dateOfBirth);
      }
      
      const docRef = await addDoc(collection(db, ATTENDEES_COLLECTION), initialData);
      const id = docRef.id;
      
      const qrCodeValue = typeof window !== 'undefined' 
                          ? `${window.location.origin}/attendee/${id}` 
                          : `/attendee/${id}`; 
      
      await updateDoc(docRef, { qrCodeValue });

      // Construct the returned Attendee object based on what was saved
      const newAttendee: Attendee = {
        id,
        name,
        email,
        checkedIn: false,
        qrCodeValue,
        // Ensure all fields from initialData that are part of Attendee type are included
        ...(profileImageUri && { profileImageUri }),
        ...(phoneNumber && { phoneNumber }),
        ...(dateOfBirth && { dateOfBirth: Timestamp.fromDate(dateOfBirth) }),
        // Timestamps will be populated by Firestore, but we can add placeholders if needed for immediate UI
      };
      
      return newAttendee;

    } catch (e) {
      console.error("Error adding attendee to Firestore:", e);
      let errorMessage = "Failed to register attendee.";
      if (e instanceof Error) {
        const firebaseError = e as any; 
        if (firebaseError.code) { 
          errorMessage = `Firestore error: ${firebaseError.message} (Code: ${firebaseError.code})`;
        } else {
          errorMessage = `Registration error: ${e.message}`;
        }
      } else {
        errorMessage = "An unknown error occurred during registration.";
      }
      setError(errorMessage);
      return null;
    }
  }, [attendees]);

  const getAttendeeById = useCallback((id: string): Attendee | undefined => {
    return attendees.find((attendee) => attendee.id === id);
  }, [attendees]);

  const checkInAttendee = useCallback(async (id: string): Promise<Attendee | null> => {
    setError(null); 
    const attendeeRef = doc(db, ATTENDEES_COLLECTION, id);
    try {
      const updateData: Partial<Attendee> & { updatedAt: any } = {
        checkedIn: true,
        checkInTime: serverTimestamp() as Timestamp, // Cast for immediate update if needed
        updatedAt: serverTimestamp(),
      };
      await updateDoc(attendeeRef, updateData);
      
      const updatedAttendeeLocal = attendees.find(a => a.id === id);
      if (updatedAttendeeLocal) {
        return { 
          ...updatedAttendeeLocal, 
          checkedIn: true, 
          checkInTime: Timestamp.now() // Reflect immediate change locally
        }; 
      }
      return null; 
    } catch (e) {
      console.error("Error checking in attendee:", e);
      let errorMessage = "Failed to check in attendee.";
       if (e instanceof Error) {
        const firebaseError = e as any; 
        if (firebaseError.code) {
          errorMessage = `Firestore error: ${firebaseError.message} (Code: ${firebaseError.code})`;
        } else {
          errorMessage = `Check-in error: ${e.message}`;
        }
      } else {
        errorMessage = "An unknown error occurred during check-in.";
      }
      setError(errorMessage);
      return null;
    }
  }, [attendees]);

  return { attendees, addAttendee, getAttendeeById, checkInAttendee, isLoading, error };
}
