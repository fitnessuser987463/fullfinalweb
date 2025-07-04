// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANZaUf8MPwTml-6mNjW98eUnJVBOW3HbE",
  authDomain: "quiz-feb4b.firebaseapp.com",
  projectId: "quiz-feb4b",
  storageBucket: "quiz-feb4b.firebasestorage.app",
  messagingSenderId: "577174418942",
  appId: "1:577174418942:web:b7832d022e4460b7193caf",
  measurementId: "G-TL80GGGGDG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);