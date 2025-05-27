"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type AttendeeFormValues = z.infer<typeof formSchema>;

interface AttendeeFormProps {
  onSubmit: (values: AttendeeFormValues) => void;
  isSubmitting: boolean;
}

export function AttendeeForm({ onSubmit, isSubmitting }: AttendeeFormProps) {
  const form = useForm<AttendeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <CardTitle>Register New Attendee</CardTitle>
        </div>
        <CardDescription>Enter the attendee's details to generate a unique QR code for check-in.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g. jane.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Attendee & Generate QR'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
