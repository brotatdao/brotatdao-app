import { useState, useEffect } from 'react';
import { getMoralisAuth } from '@moralisweb3/client-firebase-auth-utils';
import { signInWithMoralis } from '@moralisweb3/client-firebase-evm-auth';
import { auth, functions, firebaseApp } from './firebaseConfig';

const Auth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const moralisAuth = getMoralisAuth(firebaseApp, { auth, functions });

 const initiateConnection = async () => {
   try {
     await signInWithMoralis(moralisAuth);
     setIsAuthenticated(true);
   } catch (error) {
     console.error('Error in wallet connection:', error);
     setIsAuthenticated(false);
   }
 };

 useEffect(() => {
   if (!isAuthenticated) {
     initiateConnection();
   }
 }, [isAuthenticated]);

 return { initiateConnection, isAuthenticated };
};

export default Auth;