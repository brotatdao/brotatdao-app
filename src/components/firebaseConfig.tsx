import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions'
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBDR4vkS-1fd0VeeyxlcGQXJNLBdYrK5zc",
    authDomain: "brotatdao.firebaseapp.com",
    projectId: "brotatdao",
    storageBucket: "brotatdao.appspot.com",
    messagingSenderId: "877410774360",
    appId: "1:877410774360:web:be6b8f80aa74ae4c0bc92d",
    measurementId: "G-JK4PS0HWGX"
  };
  

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const functions = getFunctions(firebaseApp);
export const db = getFirestore(firebaseApp);