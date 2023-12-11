// useWallet.tsx
import { useState, useEffect } from 'react';
import WeaveDB from 'weavedb-sdk';
import { WEAVEDB_CONTRACT } from './Constants';
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { mainnet } from 'viem/chains';

// Get projectId at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_ID;

// Create wagmiConfig
const metadata = {
  name: 'brotatdao',
  description: 'brotatdao',
  url: 'https://brotatdao.eth.limo',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

const useWallet = () => {
  const [account, setAccount] = useState<string | null | undefined>(null);
  const [identity, setIdentity] = useState(null);
  const [db, setDb] = useState<WeaveDB | null>(null);
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  // Initialize WeaveDB
  useEffect(() => {
    const initDb = async () => {
      try {
        const _db = new WeaveDB({ contractTxId: WEAVEDB_CONTRACT });
        await _db.init();
        setDb(_db);
        console.log('WeaveDB initialized successfully');
      } catch (error) {
        console.error('Error initializing WeaveDB:', error);
      }
    };
    initDb();
  }, []);

  // Update the account state when the address changes
  useEffect(() => {
    setAccount(address); // Set the connected wallet address to the account state
  }, [address]);

  useEffect(() => {
    const createTempAddress = async () => {
      if (db && account && !identity) {
        try {
          const tempIdentity = await db.createTempAddress(null);
          setIdentity(tempIdentity.identity);
          console.log('Temporary identity created:', tempIdentity.identity);
        } catch (error) {
          console.error('Error creating temporary address:', error);
        }
      }
    };
    createTempAddress();
  }, [db, account]);

  return { account, identity, db, open };
};

export {wagmiConfig};

export default useWallet;
