// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyArPVUjnx568wKoXOTFp1oed_aVsSatEio",
    authDomain: "banana-cash-54b3a.firebaseapp.com",
    projectId: "banana-cash-54b3a",
    storageBucket: "banana-cash-54b3a.appspot.com",
    messagingSenderId: "665483889540",
    appId: "1:665483889540:web:feb751fdf9b88af7f86bd1"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
