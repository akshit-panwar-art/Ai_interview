import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "../serviceAccountKey.json";

function initFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();