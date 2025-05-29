
"use client";

import type { Attendee } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import QRCode from 'qrcode.react';
import { Building, CalendarDays } from 'lucide-react'; // Removed Clock, Ticket is also not used here.

interface AttendeeIdCardProps {
  attendee: Attendee;
  eventDetails: {
    name: string;
    venue: string;
    time: string;
    logoUrl?: string; 
  };
  idCardRef: React.RefObject<HTMLDivElement>;
}

export function AttendeeIdCard({ attendee, eventDetails, idCardRef }: AttendeeIdCardProps) {
  return (
    <div ref={idCardRef} className="bg-card p-0.5 rounded-lg shadow-2xl" data-testid="attendee-id-card">
      <Card className="w-[320px] aspect-[2/3] mx-auto border-primary border-2 flex flex-col overflow-hidden shadow-inner">
        {/* Header Section */}
        <div className="bg-primary text-primary-foreground p-3 text-center space-y-1">
          {eventDetails.logoUrl ? (
            <img 
              src={eventDetails.logoUrl} 
              alt={`${eventDetails.name} Logo`} 
              className="h-12 mx-auto object-contain" // Increased height, object-contain
              data-ai-hint="event spark logo"
            />
          ) : (
            <div className="h-12 flex items-center justify-center"> {/* Placeholder for logo if not provided */}
                <span className="text-xs italic">Event Logo</span>
            </div>
          )}
          <h2 className="text-base font-bold leading-tight tracking-tight">{eventDetails.name}</h2>
        </div>

        {/* Body Section */}
        <CardContent className="flex-grow flex flex-col items-center justify-around p-3 space-y-2">
          <Avatar className="w-28 h-28 border-4 border-secondary shadow-lg">
            <AvatarImage 
              src={attendee.profileImageUri || `https://placehold.co/128x128.png?text=${attendee.name.charAt(0)}`} 
              alt={attendee.name} 
              data-ai-hint={attendee.profileImageUri ? "profile person" : "letter avatar"}/>
            <AvatarFallback className="text-3xl">{attendee.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex items-center justify-between w-full mt-2 gap-3 px-1">
            <div className="p-1.5 bg-white rounded-md shadow-md">
              <QRCode value={attendee.qrCodeValue} size={90} level="H" includeMargin={false} />
            </div>
            <div className="flex-1 text-left space-y-0.5 min-w-0"> {/* min-w-0 for truncation */}
              <h3 className="text-xl font-semibold text-primary truncate">{attendee.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{attendee.email}</p>
            </div>
          </div>
        </CardContent>

        {/* Footer Section */}
        <div className="bg-muted/30 text-muted-foreground p-2.5 text-[0.65rem] space-y-1 border-t leading-tight">
          <div className="flex items-start gap-1.5">
            <Building className="h-3 w-3 text-primary shrink-0 mt-px" />
            <div>
                <span className="font-medium">Venue:</span>
                <p className="leading-snug">{eventDetails.venue}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <CalendarDays className="h-3 w-3 text-primary shrink-0 mt-px" />
            <div>
                <span className="font-medium">Date & Time:</span>
                <p className="leading-snug">{eventDetails.time}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

