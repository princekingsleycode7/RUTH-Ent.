# SPARK Conference 2025 - Attendee Management System

This is a modern, full-stack web application designed to streamline attendee registration and check-in for "SPARK Conference 2025". It provides a seamless experience for both event organizers and attendees.

## Features

- **Public Registration**: A user-friendly, public-facing form allows attendees to register for the event. Includes validation to ensure attendees are within a specific age range (13-19).
- **Automated ID Card Generation**: Upon successful registration, each attendee receives a personalized, downloadable ID card. The card includes their name, profile picture, and a unique QR code for check-in.
- **QR Code Check-in**: Attendees can be checked in quickly by scanning their QR code. The system updates their status in real-time.
- **AI-Powered Welcome**: When an attendee is checked in, the system uses Genkit to generate a personalized welcome message, creating a more engaging event experience.
- **Admin Dashboard**: A secure, PIN-protected dashboard allows administrators to:
    - View a comprehensive list of all registered attendees.
    - Monitor check-in status and statistics in real-time (total registered, total checked-in, check-in rate).
    - Track registration capacity against a set limit.
    - Export the attendee list to a CSV file.
- **Responsive Design**: The application is fully responsive and works on both desktop and mobile devices, which is essential for on-site check-ins.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore for database)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) (for personalized messaging)
- **Deployment**: Configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

### Public User Flow
1.  Visit the landing page.
2.  Click "Register for Event" to go to the registration page.
3.  Fill out the form (name, email, phone number, date of birth, and an optional profile picture).
4.  Receive and download the generated ID card.
5.  On event day, present the QR code for scanning at the check-in desk.

### Admin Flow
1.  Visit the landing page.
2.  Click "Admin Login".
3.  Enter the 6-digit admin PIN.
4.  Access the dashboard to view attendee data and event statistics.
