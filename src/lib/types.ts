export interface Attendee {
  id: string;
  name: string;
  email: string;
  checkedIn: boolean;
  checkInTime?: string; // ISO string for date and time
  qrCodeValue: string; // URL to the attendee page e.g., /attendee/[id]
}
