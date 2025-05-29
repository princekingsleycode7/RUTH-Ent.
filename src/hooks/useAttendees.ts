
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
          checkInTime: data.checkInTime as Timestamp | undefined,
          qrCodeValue: data.qrCodeValue,
          profileImageUri: data.profileImageUri,
          createdAt: data.createdAt as Timestamp | undefined,
          updatedAt: data.updatedAt as Timestamp | undefined,
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

    return () => unsubscribe();
  }, []);

  const addAttendee = useCallback(async (name: string, email: string, profileImageUri?: string): Promise<Attendee | null> => {
    try {
      const attendeeData: Omit<Attendee, 'id' | 'qrCodeValue'> & { createdAt: any, updatedAt: any } = {
        name,
        email,
        checkedIn: false,
        checkInTime: undefined, // Explicitly undefined or null
        profileImageUri: profileImageUri || undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Firestore will generate ID, qrCodeValue will be set after
      const docRef = await addDoc(collection(db, ATTENDEES_COLLECTION), {
        ...attendeeData,
        qrCodeValue: '', // Placeholder, will be updated
      });
      const id = docRef.id;
      const qrCodeValue = typeof window !== 'undefined' ? `${window.location.origin}/attendee/${id}` : `/attendee/${id}`;
      
      await updateDoc(docRef, { qrCodeValue });

      return {
        id,
        name,
        email,
        profileImageUri,
        checkedIn: false,
        qrCodeValue,
      } as Attendee;
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
      const currentAttendee = attendees.find(a => a.id === id);
      if (currentAttendee) {
        return {
            ...currentAttendee,
            checkedIn: true,
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
