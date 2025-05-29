
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAttendees } from '@/hooks/useAttendees';
import { AttendeeList } from '@/components/AttendeeList';
import { Button } from '@/components/ui/button';
import { exportAttendeesToCSV } from '@/lib/csv';
import { Download, UserPlus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


export default function AdminDashboardPage() {
  const { attendees, isLoading, error: attendeesError } = useAttendees();
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
     if (!isAuthenticated) {
      // Redirect to login or home if not authenticated
      router.replace('/scan'); // Or a dedicated login page / home page for non-admins
      return;
    }
    if (!isAdmin) {
      router.replace('/unauthorized');
    }
  }, [isAdmin, isAuthenticated, router]);


  if (!isAuthenticated || !isAdmin) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You are not authorized to access this page. 
            <Link href="/scan" className="block mt-2 text-sm underline">Go to Scan Page</Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
      
      {attendeesError && (
         <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading attendees</AlertTitle>
          <AlertDescription>{attendeesError}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 border-b">
                <Skeleton className="h-8 w-8 rounded-full mr-2" />
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
