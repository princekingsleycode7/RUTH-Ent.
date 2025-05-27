
import type { Attendee } from './types';
import { format } from 'date-fns'; // parseISO removed

export function exportAttendeesToCSV(attendees: Attendee[]): void {
  if (attendees.length === 0) {
    alert("No attendees to export.");
    return;
  }

  const headers = ["ID", "Name", "Email", "Checked In", "Check-in Time", "Registered At"];
  const csvRows = [headers.join(",")];

  attendees.forEach(attendee => {
    const checkedInStatus = attendee.checkedIn ? "Yes" : "No";
    const checkInTimeFormatted = attendee.checkInTime 
      ? format(attendee.checkInTime.toDate(), "yyyy-MM-dd HH:mm:ss") 
      : "N/A";
    const createdAtFormatted = attendee.createdAt
      ? format(attendee.createdAt.toDate(), "yyyy-MM-dd HH:mm:ss")
      : "N/A";
    
    const row = [
      attendee.id,
      `"${attendee.name.replace(/"/g, '""')}"`, // Escape double quotes in name
      attendee.email,
      checkedInStatus,
      checkInTimeFormatted,
      createdAtFormatted,
    ].join(",");
    csvRows.push(row);
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "swiftcheck_attendees.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert("CSV export is not supported in your browser.");
  }
}
