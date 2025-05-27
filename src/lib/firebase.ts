
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAnalytics, Analytics } from "firebase/analytics"; // Optional: if you want to use Firebase Analytics

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp;
let db: Firestore;
// let analytics: Analytics | undefined; // Optional

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // if (typeof window !== 'undefined') { // Optional: Initialize analytics only on client side
  //   if (firebaseConfig.measurementId) {
  //     analytics = getAnalytics(app);
  //   }
  // }
} else {
  app = getApps()[0];
}

db = getFirestore(app);

export { app, db /*, analytics */ };
