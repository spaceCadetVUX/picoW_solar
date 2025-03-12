// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-9dYYV-vEuvm3IrynRmt0P4jGhZ27aC8",
  authDomain: "schooldatabase-63900.firebaseapp.com",
  databaseURL: "https://schooldatabase-63900-default-rtdb.firebaseio.com",
  projectId: "schooldatabase-63900",
  storageBucket: "schooldatabase-63900.firebasestorage.app",
  messagingSenderId: "19115404930",
  appId: "1:19115404930:web:07c9eca015849844da4e9b",
  measurementId: "G-SMSPG1V464"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// Export Firebase app (optional, in case you need it elsewhere)
export default app;
