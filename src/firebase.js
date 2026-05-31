import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTfRVVqqnOUaC3F2ntrhtEuHTopzGWi18",
  authDomain: "gpsliveapp.firebaseapp.com",
  databaseURL: "https://gpsliveapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gpsliveapp",
  storageBucket: "gpsliveapp.firebasestorage.app",
  messagingSenderId: "376250786424",
  appId: "1:376250786424:web:697514b3e040827af3038d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
