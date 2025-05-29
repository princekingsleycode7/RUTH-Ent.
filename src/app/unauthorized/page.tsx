
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-3xl font-bold">Access Denied</CardTitle>
          <CardDescription className="text-lg">
            Sorry, you do not have the necessary permissions to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            If you believe this is an error, please contact the administrator.
          </p>
          <Button asChild>
            <Link href="/">Go to Home Page</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
