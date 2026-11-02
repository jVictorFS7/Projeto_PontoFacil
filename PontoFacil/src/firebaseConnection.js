// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAET2AFh88SRpIHOJ2hdVRwv-L5HXztGcQ",
  authDomain: "pontofacil-70088.firebaseapp.com",
  projectId: "pontofacil-70088",
  storageBucket: "pontofacil-70088.firebasestorage.app",
  messagingSenderId: "519729218969",
  appId: "1:519729218969:web:6211bc08a6aa7529363f08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);