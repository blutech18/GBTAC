import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * firebaseConfig
 *
 * Configuration object for initializing the Firebase app using environment variables.
 *
 * Notes:
 * - All values are sourced from NEXT_PUBLIC_* environment variables so they are accessible on the client.
 * - These values must be defined in your .env file for Firebase services to work properly.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Firebase App Initialization
 *
 * Initializes the Firebase app if it has not already been created.
 *
 * Notes:
 * - Prevents the "Firebase App named '[DEFAULT]' already exists" error during hot reloads or multiple imports.
 * - Reuses the existing app instance when available.
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * auth
 *
 * Firebase Authentication instance used for user sign-in, sign-out, and token management.
 *
 * Notes:
 * - Shared across the application via imports.
 */
export const auth = getAuth(app);

/**
 * db
 *
 * Firebase Firestore instance used for reading and writing application data.
 *
 * Notes:
 * - Used for accessing collections such as allowedUsers.
 */
export const db = getFirestore(app);
