import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyADvsIXfgfoeQTtVO7J5xwcHbjUi7b31xc",
    authDomain: "nyaya-sahayak-core.firebaseapp.com",
    projectId: "nyaya-sahayak-core",
    storageBucket: "nyaya-sahayak-core.firebasestorage.app",
    messagingSenderId: "953796636203",
    appId: "1:953796636203:web:7d02f504569b7c395ec46e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
