
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
          checkInTime: data.checkInTime as Timestamp | undefined, // Firestore Timestamp
          qrCodeValue: data.qrCodeValue,
          createdAt: data.createdAt as Timestamp | undefined, // Firestore Timestamp
          updatedAt: data.updatedAt as Timestamp | undefined, // Firestore Timestamp
        });
      });
      setAttendees(fetchedAttendees);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching attendees from Firestore:", err);
      setError("Failed to load attendees. Please try again later.");
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const addAttendee = useCallback(async (name: string, email: string): Promise<Attendee | null> => {
    try {
      const attendeeData = {
        name,
        email,
        checkedIn: false,
        qrCodeValue: '', // Will be updated shortly
        checkInTime: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, ATTENDEES_COLLECTION), attendeeData);
      const id = docRef.id;
      const qrCodeValue = typeof window !== 'undefined' ? `${window.location.origin}/attendee/${id}` : `/attendee/${id}`;
      
      await updateDoc(docRef, { qrCodeValue });

      // The onSnapshot listener will update the local 'attendees' state.
      // For immediate return, we construct a partial object.
      // The full object with server timestamps will arrive via onSnapshot.
      return {
        id,
        name,
        email,
        checkedIn: false,
        qrCodeValue,
        // createdAt and updatedAt will be Firestore server timestamps.
        // For the purpose of returning immediately to update UI (e.g. QR code display)
        // we can return a client-side representation or rely on onSnapshot.
        // Let's return the essential parts.
      } as Attendee; // Cast as Attendee, knowing some fields are server-generated
    } catch (e) {
      console.error("Error adding attendee to Firestore:", e);
      setError("Failed to register attendee.");
      return null;
    }
  }, []);

  const getAttendeeById = useCallback((id: string): Attendee | undefined => {
    return attendees.find((attendee) => attendee.id === id);
  }, [attendees]);

  const checkInAttendee = useCallback(async (id: string): Promise<Attendee | null> => {
    const attendeeRef = doc(db, ATTENDEES_COLLECTION, id);
    try {
      await updateDoc(attendeeRef, {
        checkedIn: true,
        checkInTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // onSnapshot will update the local state.
      // For immediate UI update in AttendeePage, we can find the attendee and return an updated version.
      const currentAttendee = attendees.find(a => a.id === id);
      if (currentAttendee) {
        return {
            ...currentAttendee,
            checkedIn: true,
            // checkInTime, updatedAt will be server timestamps.
            // This return is mostly for optimistic update or if direct data is needed post-action.
        } as Attendee; 
      }
      return null;
    } catch (e) {
      console.error("Error checking in attendee:", e);
      setError("Failed to check in attendee.");
      return null;
    }
  }, [attendees]);

  return { attendees, addAttendee, getAttendeeById, checkInAttendee, isLoading, error };
}
