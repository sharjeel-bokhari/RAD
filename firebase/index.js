import { initializeApp } from "firebase/app";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, initializeAuth,getReactNativePersistence,createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs,getDoc, updateDoc, deleteDoc, onSnapshot, deleteField} from "firebase/firestore";

const firebaseConfig = {
    // your firebase configuration
    // api-key etc
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  // const auth = getAuth(app);
  // Use the below code to keep a user logged in 
    // the video: https://www.youtube.com/watch?v=GXlBvRmwwRQ find similar videos for this
    const auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
      });

export { app, db, auth, getFirestore, deleteDoc, createUserWithEmailAndPassword, updateDoc,signInWithEmailAndPassword, collection, addDoc, doc, setDoc, getDoc, getDocs, onSnapshot, deleteField};