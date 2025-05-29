
import type { Timestamp } from 'firebase/firestore';

export interface Attendee {
  id: string; // Firestore document ID
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Timestamp; // Stored as Firestore Timestamp
  checkedIn: boolean;
  checkInTime?: Timestamp; // Firestore Timestamp for date and time
  qrCodeValue: string; // URL to the attendee page e.g., /attendee/[id]
  profileImageUri?: string; // Data URI for profile image
  createdAt?: Timestamp; // Firestore Timestamp
  updatedAt?: Timestamp; // Firestore Timestamp
}
