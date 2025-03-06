import { getFirestore } from "@firebase/firestore";
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.PROJECT_ID || "",
    private_key_id: process.env.PRIVATE_KEY_ID || "",
    private_key: (process.env.FIRBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL || "",
    client_id: process.env.CLIENT_ID || "",
    auth_uri: process.env.AUTH_URI || "",
    token_uri: process.env.TOKEN_URI || "",
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL || "",
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL || "",
  } as admin.ServiceAccount),
  storageBucket: process.env.STORAGE_BUCKET || "",
});

export const db = admin.firestore();
