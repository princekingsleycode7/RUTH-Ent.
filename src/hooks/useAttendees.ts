
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
    setError(null); // Clear previous errors
    try {
      const initialData: {
        name: string;
        email: string;
        checkedIn: boolean;
        profileImageUri?: string;
        createdAt: any; // serverTimestamp
        updatedAt: any; // serverTimestamp
        qrCodeValue: string; // Placeholder
      } = {
        name,
        email,
        checkedIn: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        qrCodeValue: '', // Placeholder, will be updated right after doc creation
      };

      if (profileImageUri) {
        initialData.profileImageUri = profileImageUri;
      }
      // Note: checkInTime is NOT part of initialData, so it won't be written as undefined.

      const docRef = await addDoc(collection(db, ATTENDEES_COLLECTION), initialData);
      const id = docRef.id;
      
      const qrCodeValue = typeof window !== 'undefined' 
                          ? `${window.location.origin}/attendee/${id}` 
                          : `/attendee/${id}`;
      
      await updateDoc(docRef, { qrCodeValue });

      const newAttendee: Attendee = {
        id,
        name,
        email,
        checkedIn: false,
        qrCodeValue,
        // checkInTime is implicitly undefined here from the Attendee type
        // createdAt and updatedAt are set by serverTimestamp() and would be on the doc in Firestore
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
        if (firebaseError.code) { // Check if it's likely a FirebaseError
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
  }, []);

  const getAttendeeById = useCallback((id: string): Attendee | undefined => {
    return attendees.find((attendee) => attendee.id === id);
  }, [attendees]);

  const checkInAttendee = useCallback(async (id: string): Promise<Attendee | null> => {
    setError(null); // Clear previous errors
    const attendeeRef = doc(db, ATTENDEES_COLLECTION, id);
    try {
      await updateDoc(attendeeRef, {
        checkedIn: true,
        checkInTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // The onSnapshot listener will update the local state, so we don't need to manually update here.
      // We can find the attendee from the current state for an optimistic return if needed,
      // but it's generally better to rely on the real-time update.
      const updatedAttendee = attendees.find(a => a.id === id);
      if (updatedAttendee) {
        return { ...updatedAttendee, checkedIn: true, checkInTime: Timestamp.now() }; // Optimistic update for immediate UI
      }
      return null; // Or fetch the document again if immediate consistent return is critical
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
