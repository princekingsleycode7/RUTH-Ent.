
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
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAttendees.push({
          id: doc.id,
          name: data.name,
          email: data.email,
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

  const addAttendee = useCallback(async (name: string, email: string, profileImageUri?: string): Promise<Attendee | null> => {
    setError(null); 

    if (attendees.length >= REGISTRATION_LIMIT) {
      const limitError = `Registration limit reached (${REGISTRATION_LIMIT}). Cannot add more attendees.`;
      console.warn(limitError);
      setError(limitError);
      return null;
    }

    try {
      const initialData: {
        name: string;
        email: string;
        checkedIn: boolean;
        qrCodeValue: string; // Placeholder
        createdAt: any; 
        updatedAt: any; 
        profileImageUri?: string;
      } = {
        name,
        email,
        checkedIn: false,
        qrCodeValue: '', 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (profileImageUri) {
        initialData.profileImageUri = profileImageUri;
      }
      
      const docRef = await addDoc(collection(db, ATTENDEES_COLLECTION), initialData);
      const id = docRef.id;
      
      const qrCodeValue = typeof window !== 'undefined' 
                          ? `${window.location.origin}/attendee/${id}` 
                          : `/attendee/${id}`; // Fallback for server-side or non-browser environments
      
      await updateDoc(docRef, { qrCodeValue });

      const newAttendee: Attendee = {
        id,
        name,
        email,
        checkedIn: false,
        qrCodeValue,
      };
      if (profileImageUri) {
        newAttendee.profileImageUri = profileImageUri;
      }
      
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
  }, [attendees]); // Added attendees to dependency array for the length check

  const getAttendeeById = useCallback((id: string): Attendee | undefined => {
    return attendees.find((attendee) => attendee.id === id);
  }, [attendees]);

  const checkInAttendee = useCallback(async (id: string): Promise<Attendee | null> => {
    setError(null); 
    const attendeeRef = doc(db, ATTENDEES_COLLECTION, id);
    try {
      await updateDoc(attendeeRef, {
        checkedIn: true,
        checkInTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const updatedAttendee = attendees.find(a => a.id === id);
      if (updatedAttendee) {
        return { ...updatedAttendee, checkedIn: true, checkInTime: Timestamp.now() }; 
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
  }, [attendees]); // Added attendees to dependency array

  return { attendees, addAttendee, getAttendeeById, checkInAttendee, isLoading, error };
}
