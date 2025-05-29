
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Image as ImageIcon, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 700 * 1024; // 700KB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  profileImage: z
    .custom<File>((val) => val instanceof File, "Please upload an image file.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 700KB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    )
    .optional(),
});

export type AttendeeFormValues = z.infer<typeof formSchema>;

interface AttendeeFormProps {
  onSubmit: (values: AttendeeFormValues) => void;
  isSubmitting: boolean;
  disabled?: boolean; // New prop to disable the form
}

export function AttendeeForm({ onSubmit, isSubmitting, disabled = false }: AttendeeFormProps) {
  const form = useForm<AttendeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      profileImage: undefined,
    },
  });

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <CardTitle>Register New Attendee</CardTitle>
        </div>
        <CardDescription>Enter the attendee's details to generate a unique QR code for check-in. Profile image is optional (max 700KB).</CardDescription>
      </CardHeader>
      <CardContent>
        {disabled && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">Registrations are currently full. This form is disabled.</p>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} disabled={disabled} />
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
                    <Input type="email" placeholder="e.g. jane.doe@example.com" {...field} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profileImage"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                     Profile Image (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                      {...rest}
                      className="pt-2"
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || disabled}>
              {isSubmitting ? 'Registering...' : 'Register Attendee & Generate QR'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
