
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "123456"; // Fallback if not set

export default function AdminLoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { loginAdmin, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError("PIN must be 6 digits.");
      setIsLoading(false);
      return;
    }

    const success = loginAdmin(pin);

    if (success) {
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });
      router.push('/dashboard');
    } else {
      setError("Invalid PIN. Please try again.");
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "The PIN you entered is incorrect.",
      });
    }
    setIsLoading(false);
  };
  
  if (isAdmin) { // Should be caught by useEffect, but good for initial render
    return <div className="flex justify-center items-center h-screen"><p>Redirecting...</p></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your 6-digit PIN to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pin">Admin PIN</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                placeholder="••••••"
                className="text-center tracking-[0.5em]"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
