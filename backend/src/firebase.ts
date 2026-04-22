import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized");
  } catch (error) {
    console.error("Firebase Admin initialization failed", error);
  }
} else {
  console.log("FIREBASE_SERVICE_ACCOUNT env var missing. FCM will not work until configured.");
}

export default admin;
