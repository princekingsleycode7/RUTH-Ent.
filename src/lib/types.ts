
import type { Timestamp } from 'firebase/firestore';

export interface Attendee {
  id: string; // Firestore document ID
  name: string;
  email: string;
  checkedIn: boolean;
  checkInTime?: Timestamp; // Firestore Timestamp for date and time
  qrCodeValue: string; // URL to the attendee page e.g., /attendee/[id]
  createdAt?: Timestamp; // Firestore Timestamp
  updatedAt?: Timestamp; // Firestore Timestamp
}
