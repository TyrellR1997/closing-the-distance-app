// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration (replace with your own values from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyBNALuwH_6bXUbO5PWcQ3dS-Q3jcXotpI0",
    authDomain: "closing-the-distance.firebaseapp.com",
    projectId: "closing-the-distance",
    storageBucket: "closing-the-distance.firebasestorage.app",
    messagingSenderId: "1022136301174",
    appId: "1:1022136301174:web:ca127e66a6c2a3277e1157"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Export database and storage
export { db, storage, collection, addDoc, getDocs, orderBy, query };
