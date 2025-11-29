import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD5vIDTkuSbY1IMZQS-4phQkXiIoj2FCKA",
    authDomain: "habit-tracker-78771.firebaseapp.com",
    projectId: "habit-tracker-78771",
    storageBucket: "habit-tracker-78771.appspot.com",
    messagingSenderId: "1062526169749",
    appId: "1:1062526169749:web:48cb9fa4979f4c0d0b619c",
    measurementId: "G-FE8LD4CF08"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
