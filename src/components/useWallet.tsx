import { useState, useEffect } from 'react';
import axios from 'axios';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Web3Provider } from "@ethersproject/providers";

// Import Firestore and Firebase app instance from App.tsx
import { db, firebaseApp } from '../App';

// Get projectId from your environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_ID;

// Create wagmiConfig
const metadata = {
  name: 'brotatdao', 
  description: 'brotatdao',
  url: 'https://brotatdao.eth.limo',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, sepolia];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// Create modal
const web3Modal = createWeb3Modal({ wagmiConfig, projectId, chains });

const useWallet = () => {
  const [account, setAccount] = useState<string | null | undefined>(null);
  const { open: initiateConnection } = useWeb3Modal();
  const { address } = useAccount();

  useEffect(() => {
    setAccount(address);
  }, [address]);

  // Firestore helper functions
  const getUserData = async (userAddress: string) => {
    const docRef = doc(db, 'users', userAddress);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('User data:', docSnap.data());
      return docSnap.data();
    } else {
      console.log('No such user!');
      return null;
    }
  }

  const setUserData = async (userAddress: string, data: Record<string, any>) => {
    await setDoc(doc(db, 'users', userAddress), data);
    console.log('User data set:', data);
  };

  // Function to request a message for the user to sign
  const requestMessage = async (address: string, networkType: string = 'evm', chainId: number) => {
    try {
      const response = await axios.post('/path-to-requestMessage-function', {
        address, networkType, chain: chainId
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting message:', error);
      throw error;
    }
  };

  // Function to issue a token after getting the user's signature
  const issueToken = async (message: string, signature: string, networkType: string = 'evm') => {
    try {
      const response = await axios.post('/path-to-issueToken-function', {
        message, signature, networkType
      });
      return response.data;
    } catch (error) {
      console.error('Error issuing token:', error);
      throw error;
    }
  };

  const authenticateWithMoralis = async () => {
    if (address) {
      console.log('Initializing WalletConnectProvider...');
      const provider = new WalletConnectProvider({
        rpc: {
          1: 'https://mainnet.infura.io/v3/1f2fbd3ff31e4f4f9cf0901c26d85363',
          11155111: 'https://sepolia.infura.io/v3/1f2fbd3ff31e4f4f9cf0901c26d85363'
        }
      });

      try {
        await provider.enable();
        console.log('Provider enabled, requesting message...');

        const chainId = 1; // Mainnet, adjust as needed
        const messageData = await requestMessage(address, 'evm', chainId);

        // TODO: User needs to sign this message with their wallet
        // const signature = await signMessageWithWallet(messageData);

        // const tokenData = await issueToken(messageData, signature);
        // TODO: Handle the received token for user authentication

      } catch (error) {
        console.error('Error during authentication:', error);
      }
    }
  };

  useEffect(() => {
    authenticateWithMoralis();
  }, [address]);

  return { account, initiateConnection, getUserData, setUserData };
};

export { wagmiConfig };
export default useWallet;
