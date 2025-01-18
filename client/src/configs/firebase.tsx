import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { GithubAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDWpGEJDDhGStz5UdAlkyoYrt-k1ElK86A",
  authDomain: "ratna-supermaket.firebaseapp.com",
  projectId: "ratna-supermaket",
  storageBucket: "ratna-supermaket.appspot.com",
  messagingSenderId: "216769098384",
  appId: "1:216769098384:web:2f1f12b5ed716b96a3de15",
  measurementId: "G-C461L1N67L"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
const provider = new GithubAuthProvider();

export { auth, googleProvider, provider};