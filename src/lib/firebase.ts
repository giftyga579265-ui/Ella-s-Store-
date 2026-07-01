import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { OperationType, FirestoreErrorInfo } from "../types";

// Public Firebase web configurations from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyCeTpVjfXR3i2fOQV1S4eDDrkqL3Ov6q8M",
  authDomain: "teak-technique-g71nt.firebaseapp.com",
  projectId: "teak-technique-g71nt",
  storageBucket: "teak-technique-g71nt.firebasestorage.app",
  messagingSenderId: "467218158243",
  appId: "1:467218158243:web:db9379d7c7ebc4202d6516"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID from config
export const db = getFirestore(app, "ai-studio-ellasstore-6673b3a5-ee4c-4237-b264-769d13c47377");

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

