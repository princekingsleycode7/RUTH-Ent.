
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let db: Firestore;
let analytics: Analytics | undefined;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    if (firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  }
} else {
  app = getApps()[0];
  // Ensure analytics is initialized for the existing app instance as well, if on client and measurementId exists
  if (typeof window !== 'undefined') {
    if (firebaseConfig.measurementId && !analytics) { // Check if analytics is not already initialized
        const existingAppAnalytics = getAnalytics(app); // Attempt to get analytics for existing app
        if (existingAppAnalytics) {
            analytics = existingAppAnalytics;
        }
    }
  }
}

db = getFirestore(app);

export { app, db, analytics };
