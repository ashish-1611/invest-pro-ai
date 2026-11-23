import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  type ConfirmationResult, 
  type Auth, 
  type UserCredential,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import emailjs from '@emailjs/browser';

// Firebase Project Configuration from environment variables
export const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
});

// Check if Firebase is configured with real credentials
export const isFirebaseConfigured = (): boolean => {
  const cfg = getFirebaseConfig();
  return !!(
    cfg.apiKey && 
    cfg.projectId && 
    cfg.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    cfg.apiKey.length > 10
  );
};

// Check if EmailJS is configured
export const isEmailJsConfigured = (): boolean => {
  return !!(
    import.meta.env.VITE_EMAILJS_SERVICE_ID &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
};

// Initialize Firebase App
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

export const getFirebaseAuth = (): Auth | null => {
  if (!isFirebaseConfigured()) return null;

  try {
    if (!firebaseApp) {
      const apps = getApps();
      firebaseApp = apps.length > 0 ? getApp() : initializeApp(getFirebaseConfig());
    }
    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
    }
    return firebaseAuth;
  } catch (err) {
    console.error('Failed to initialize Firebase Auth:', err);
    return null;
  }
};

/**
 * Initializes Google's RecaptchaVerifier for real SMS delivery.
 * Required by telecom carriers to prevent SMS flooding.
 */
export const initRecaptchaVerifier = (containerId: string): RecaptchaVerifier | null => {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  // Clear existing verifier if any
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {}
  }

  try {
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved automatically by invisible check
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired. User must retry.');
      }
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.error('Error creating RecaptchaVerifier:', err);
    return null;
  }
};

/**
 * Sends a REAL telecom SMS OTP via Google Firebase Authentication.
 * Delivers an actual 6-digit SMS verification code to the physical mobile device.
 */
export const sendRealSmsOtp = async (
  fullPhoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please add your Firebase API keys to .env');
  }

  // Ensure E.164 standard formatting (e.g. +919876543210)
  const cleanedPhone = fullPhoneNumber.replace(/[^\d+]/g, '');
  if (!cleanedPhone.startsWith('+')) {
    throw new Error('Phone number must include international country code (e.g. +91 or +1)');
  }

  return await signInWithPhoneNumber(auth, cleanedPhone, verifier);
};

/**
 * Verifies the 6-digit code received on the user's physical phone via SMS.
 */
export const verifyRealSmsOtp = async (
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<UserCredential> => {
  return await confirmationResult.confirm(otpCode);
};

/**
 * Sends a real verification email.
 * Supports EmailJS for immediate 6-digit OTP delivery directly into user's inbox,
 * or Firebase Email Sign-In Link.
 */
export const sendRealEmailOtp = async (
  email: string,
  otpCode: string
): Promise<{ success: boolean; method: 'emailjs' | 'firebase-link' }> => {
  // Method 1: EmailJS for direct 6-digit OTP in inbox
  if (isEmailJsConfigured()) {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,
        recipient_email: email,
        otp_code: otpCode,
        verification_code: otpCode,
        app_name: 'Invest-AI Pro Terminal',
        expiry_minutes: '10'
      },
      publicKey
    );

    return { success: true, method: 'emailjs' };
  }

  // Method 2: Firebase Email Link Verification
  const auth = getFirebaseAuth();
  if (auth) {
    const actionCodeSettings = {
      url: window.location.origin + '?email_verification=true',
      handleCodeInApp: true
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem('invest_ai_email_for_sign_in', email);
    return { success: true, method: 'firebase-link' };
  }

  throw new Error('No email delivery service configured. Please provide Firebase or EmailJS credentials.');
};
