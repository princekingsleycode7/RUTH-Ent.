"use client";

import type { Attendee } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'swiftcheck_attendees';

export function useAttendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAttendees = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedAttendees) {
        setAttendees(JSON.parse(storedAttendees));
      }
    } catch (error) {
      console.error("Failed to load attendees from local storage:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(attendees));
      } catch (error) {
        console.error("Failed to save attendees to local storage:", error);
      }
    }
  }, [attendees, isLoading]);

  const addAttendee = useCallback((name: string, email: string): Attendee => {
    const id = uuidv4();
    // Ensure window.location.origin is accessed only on the client side
    const qrCodeValue = typeof window !== 'undefined' ? `${window.location.origin}/attendee/${id}` : `/attendee/${id}`;
    
    const newAttendee: Attendee = {
      id,
      name,
      email,
      checkedIn: false,
      qrCodeValue,
    };
    setAttendees((prev) => [...prev, newAttendee]);
    return newAttendee;
  }, []);

  const getAttendeeById = useCallback((id: string): Attendee | undefined => {
    return attendees.find((attendee) => attendee.id === id);
  }, [attendees]);

  const checkInAttendee = useCallback((id: string): Attendee | undefined => {
    let updatedAttendee: Attendee | undefined;
    setAttendees((prev) =>
      prev.map((attendee) => {
        if (attendee.id === id && !attendee.checkedIn) {
          updatedAttendee = {
            ...attendee,
            checkedIn: true,
            checkInTime: new Date().toISOString(),
          };
          return updatedAttendee;
        }
        return attendee;
      })
    );
    return updatedAttendee;
  }, []);

  return { attendees, addAttendee, getAttendeeById, checkInAttendee, isLoading };
}
