
"use client";

import type { Attendee } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import QRCode from 'qrcode.react';
import { Building, CalendarDays, Clock, Ticket } from 'lucide-react';

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
        <div className="bg-primary text-primary-foreground p-3 text-center">
          {eventDetails.logoUrl ? (
            <img src={eventDetails.logoUrl} alt={`${eventDetails.name} Logo`} className="h-10 mx-auto mb-1" data-ai-hint="event logo"/>
          ) : (
            <Ticket className="h-10 w-10 mx-auto mb-1 text-primary-foreground/80" />
          )}
          <h2 className="text-lg font-bold leading-tight">{eventDetails.name}</h2>
        </div>

        {/* Body Section */}
        <CardContent className="flex-grow flex flex-col items-center justify-around p-4 space-y-3">
          <Avatar className="w-32 h-32 border-4 border-secondary shadow-lg">
            <AvatarImage 
              src={attendee.profileImageUri || `https://placehold.co/128x128.png?text=${attendee.name.charAt(0)}`} 
              alt={attendee.name} 
              data-ai-hint={attendee.profileImageUri ? "profile person" : "letter avatar"}/>
            <AvatarFallback className="text-4xl">{attendee.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="text-2xl font-semibold text-primary">{attendee.name}</h3>
            <p className="text-sm text-muted-foreground -mt-1">{attendee.email}</p>
          </div>
          
          <div className="p-2 bg-white rounded-md shadow">
            <QRCode value={attendee.qrCodeValue} size={100} level="H" includeMargin={false} />
          </div>
        </CardContent>

        {/* Footer Section */}
        <div className="bg-muted/50 text-muted-foreground p-3 text-xs space-y-1 border-t">
          <div className="flex items-center gap-2">
            <Building className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium">Venue:</span>
            <span>{eventDetails.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium">Date & Time:</span>
            <span>{eventDetails.time}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
