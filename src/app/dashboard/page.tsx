
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAttendees, REGISTRATION_LIMIT } from '@/hooks/useAttendees';
import { AttendeeList } from '@/components/AttendeeList';
import { Button } from '@/components/ui/button';
import { exportAttendeesToCSV } from '@/lib/csv';
import { Download, UserPlus, AlertTriangle, BarChart, Users, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function AdminDashboardPage() {
  const { attendees, isLoading, error: attendeesError } = useAttendees();
  const { isAdmin, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return; 

    if (!isAdmin) {
      router.replace('/admin-login');
    }
  }, [isAdmin, isAuthLoading, router]);

  if (isAuthLoading || (!isAdmin && !isAuthLoading)) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p>Loading authentication status...</p>
        <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
        <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
      </div>
    );
  }
  
  const handleExportCSV = () => {
    exportAttendeesToCSV(attendees);
  };

  const checkedInCount = attendees.filter(a => a.checkedIn).length;
  const totalCount = attendees.length;
  const checkedInPercentage = totalCount > 0 ? (checkedInCount / totalCount) * 100 : 0;


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalCount}</div>}
            <p className="text-xs text-muted-foreground">
              Registered for the event
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked-In Attendees</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{checkedInCount}</div>}
            <p className="text-xs text-muted-foreground">
              Currently present
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{checkedInPercentage.toFixed(1)}%</div>}
            <p className="text-xs text-muted-foreground">
              Percentage of attendees checked in
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Capacity</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">
                {totalCount} / {REGISTRATION_LIMIT}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {REGISTRATION_LIMIT - totalCount >= 0 ? `${REGISTRATION_LIMIT - totalCount} spots remaining` : 'Capacity reached'}
            </p>
          </CardContent>
        </Card>
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
            <CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b last:border-b-0">
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-5 w-28" />
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
