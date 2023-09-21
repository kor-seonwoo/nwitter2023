import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCpxlUt6I19pzUXAZ6Zk7It2BnXCNs_xHI",
  authDomain: "nwitter2023-d4e9f.firebaseapp.com",
  projectId: "nwitter2023-d4e9f",
  storageBucket: "nwitter2023-d4e9f.appspot.com",
  messagingSenderId: "166931569591",
  appId: "1:166931569591:web:36e63ef9dd587698b32632"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);