// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyr9WSc5U4O-utpUekuA9fIn4RkaobbEE",
  authDomain: "bananacash-db01c.firebaseapp.com",
  projectId: "bananacash-db01c",
  storageBucket: "bananacash-db01c.appspot.com",
  messagingSenderId: "518825357881",
  appId: "1:518825357881:web:5a0e413f95b36e373753e8"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
