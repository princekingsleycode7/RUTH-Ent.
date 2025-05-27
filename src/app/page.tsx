"use client";

import { useAttendees } from '@/hooks/useAttendees';
import { AttendeeList } from '@/components/AttendeeList';
import { Button } from '@/components/ui/button';
import { exportAttendeesToCSV } from '@/lib/csv';
import { Download, UserPlus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  const { attendees, isLoading } = useAttendees();

  const handleExportCSV = () => {
    exportAttendeesToCSV(attendees);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/register">
              <UserPlus className="mr-2 h-4 w-4" /> Register New Attendee
            </Link>
          </Button>
          <Button onClick={handleExportCSV} disabled={attendees.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 border-b">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-5 w-1/5" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <AttendeeList attendees={attendees} />
      )}
    </div>
  );
}
