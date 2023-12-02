import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Explorer from './pages/Explorer/Explorer';
import WeaveDB from "weavedb-sdk";
import Web3Modal from "web3modal"; 
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from 'web3';
import "./App.css";
import { WEAVEDB_CONTRACT } from "./components/Constants";

const App = () => {
    const [account, setAccount] = useState("");
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

    // Wallet Connect
    const connectWallet = async () => {
        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider, 
                options: {
                    infuraId: import.meta.env.VITE_INFURA_ID  // Infura env variable
                }
            }
        };

        const web3Modal = new Web3Modal({
            network: "mainnet", 
            cacheProvider: true, 
            providerOptions,
        });

        const provider = await web3Modal.connect();  
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
    };

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

                <button onClick={connectWallet}>Connect Wallet</button>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={<Upload account={account} dbRef={dbRef} />} />
                    <Route path="/explorer" element={<Explorer dbRef={dbRef} />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
