
"use client";

import type { Attendee } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Mail, User, CalendarClock, Phone, Cake } from 'lucide-react';
import { format } from 'date-fns';

interface AttendeeListProps {
  attendees: Attendee[];
}

export function AttendeeList({ attendees }: AttendeeListProps) {
  if (attendees.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No attendees registered yet. Start by registering one!</p>;
  }

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableCaption>A list of all registered attendees.</TableCaption>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-12 p-2"></TableHead> {/* For Avatar */}
            <TableHead className="min-w-[150px]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" /> Name
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone
              </div>
            </TableHead>
             <TableHead>
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4" /> Date of Birth
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4" /> Status
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <CalendarClock className="h-4 w-4" /> Check-in Time
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendees.map((attendee) => (
            <TableRow key={attendee.id} className="hover:bg-muted/20 transition-colors">
              <TableCell className="p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={attendee.profileImageUri || `https://placehold.co/40x40.png?text=${attendee.name.charAt(0)}`} 
                    alt={attendee.name}
                    data-ai-hint={attendee.profileImageUri ? "profile person" : "letter avatar"}
                  />
                  <AvatarFallback>{attendee.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{attendee.name}</TableCell>
              <TableCell>{attendee.email}</TableCell>
              <TableCell>{attendee.phoneNumber || 'N/A'}</TableCell>
              <TableCell>
                {attendee.dateOfBirth ? format(attendee.dateOfBirth.toDate(), "MMM d, yyyy") : 'N/A'}
              </TableCell>
              <TableCell className="text-center">
                {attendee.checkedIn ? (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-primary-foreground">
                    <CheckCircle className="mr-1 h-3.5 w-3.5" /> Checked In
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-primary-foreground">
                    <XCircle className="mr-1 h-3.5 w-3.5" /> Not Checked In
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {attendee.checkInTime ? format(attendee.checkInTime.toDate(), "MMM d, yyyy HH:mm") : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
