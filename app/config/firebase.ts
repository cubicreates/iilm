import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "iot-prj-ac910.firebaseapp.com",
  databaseURL: "https://iot-prj-ac910-default-rtdb.firebaseio.com",
  projectId: "iot-prj-ac910",
  storageBucket: "iot-prj-ac910.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);