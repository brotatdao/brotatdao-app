import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Explorer from './pages/Explorer/Explorer';
import WeaveDB from "weavedb-sdk";
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiConfig, useAccount, useDisconnect } from 'wagmi';
import { mainnet } from 'viem/chains';
import "./App.css";
import { WEAVEDB_CONTRACT } from "./components/Constants";

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

const { open } = useWeb3Modal();

const App = () => {
    const [identity, setIdentity] = useState(null);
    const dbRef = useRef<WeaveDB | null>(null);
    const [account, setAccount] = useState<string | null | undefined>(null);


    // Initialize WeaveDB
    useEffect(() => {
        const initDb = async () => {
            dbRef.current = new WeaveDB({ contractTxId: WEAVEDB_CONTRACT });
            await dbRef.current?.init();
        };
        initDb();
    }, []);

    const InnerApp = () => {
        const { address } = useAccount();
        const { disconnect } = useDisconnect();

        // Update the account state when the address changes
        useEffect(() => {
            setAccount(address); // Set the connected wallet address to the account state

            const createTempAddress = async () => {
                if (dbRef.current && address && !identity) {
                    const tempIdentity = await dbRef.current.createTempAddress(null);
                    console.log('Temp identity:', tempIdentity.identity);
                    setIdentity(tempIdentity.identity);
                }
            };

            createTempAddress();
        }, [address]);
        
        return (
            <Router>
                <div>
                    <nav>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/upload">Upload</Link></li>
                            <li><Link to="/explorer">Explorer</Link></li>
                        </ul>
                    </nav>

                    {address ? (
                        <button onClick={(event) => { event.preventDefault(); disconnect(); }}>Disconnect Wallet</button>
                    ) : (
                        <button onClick={() => open({ view: 'Connect' })}>Connect Wallet</button>
                    )}

                    <Routes>
                    <Route path="/" element={<Home />} />
                        <Route path="/upload" element={<Upload dbRef={dbRef} identity={identity} account={account} />} />
                        <Route path="/explorer" element={<Explorer dbRef={dbRef} />} />
                    </Routes>
                </div>
            </Router>
        );
    };

    return (
        <WagmiConfig config={wagmiConfig}>
            <InnerApp />
        </WagmiConfig>
    );
};

export default App;
