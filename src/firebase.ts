// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo73N4A-uvAYv7IwI7A_CTJkJy58U7Gfk",
  authDomain: "chad-nus-finance.firebaseapp.com",
  projectId: "chad-nus-finance",
  storageBucket: "chad-nus-finance.firebasestorage.app",
  messagingSenderId: "50388968648",
  appId: "1:50388968648:web:e6915e94fa62eef14131fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
