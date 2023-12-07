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

    // Initialize WeaveDB
    useEffect(() => {
        const initDb = async () => {
            dbRef.current = new WeaveDB({ contractTxId: WEAVEDB_CONTRACT });
            if (dbRef.current) {
                await dbRef.current.init();
            }
        };

        initDb();
    }, []);

    // Create a temporary address for WeaveDB
    useEffect(() => {
        const createTempAddress = async () => {
            if (dbRef.current) {
                const expiry = 60 * 60 * 24 * 7; // Set expiry to one week
                const tempIdentity = await dbRef.current.createTempAddress(null, expiry);
                setIdentity(tempIdentity.identity);
            }
        };

        createTempAddress();
    }, []);

    const InnerApp = () => {
        const { address } = useAccount();
        const { disconnect } = useDisconnect();

        useEffect(() => {
            const createTempAddress = async () => {
                if (dbRef.current && address && !identity) {
                    const expiry = 60 * 60 * 24 * 7; // Set expiry to one week
                    const tempIdentity = await dbRef.current.createTempAddress(null, expiry);
                    console.log('Temp identity:', tempIdentity.identity); // Log to fix possible error.
                    setIdentity(tempIdentity.identity);
                }
            };
        
            createTempAddress();
        }, [address, identity]);

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
                        <Route path="/upload" element={<Upload account={address || ''} dbRef={dbRef} identity={identity} />} />
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
