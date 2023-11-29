import React, { useEffect, useState, useRef } from "react";
import { FleekSdk, ApplicationAccessTokenService } from '@fleekxyz/sdk';
import ReactDOMServer from 'react-dom/server';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Explorer from './pages/Explorer/Explorer';
import ProfileCard from './components/ProfileCard';
import { WEAVEDB_CONTRACT, WEAVEDB_COLLECTION } from "./components/Constants";
import { listNftsByAccount } from './components/OpenSea';
import WeaveDB from "weavedb-sdk";
import Web3Modal from "web3modal"; 
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from 'web3';
import "./App.css";


// Initialize Fleek SDK
const applicationService = new ApplicationAccessTokenService({
    clientId: import.meta.env.VITE_FLEEK_CLIENT_ID!,  // Fleek env variable
});
const fleekSdk = new FleekSdk({ accessTokenService: applicationService });


function App() {
    // State hooks
    const [isLoading, setIsLoading] = useState(false);
    const [uploadLink, setUploadLink] = useState("");
    const [bio, setBio] = useState("");
    const [name, setName] = useState("");
    const [account, setAccount] = useState("");
    const [nft, setNft] = useState<Nft | null>(null);
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [dbIsInitialized, setDbIsInitialized] = useState(false);
    const dbRef = useRef<WeaveDB | null>(null);

    const fetchNfts = async (account: string) => {
    try {
        const data = await listNftsByAccount(account);
        if (data && data.nfts) {
            setNfts(data.nfts);
        } else {
            console.error('Unexpected response format from OpenSea API:', data);
        }
    } catch (error) {
        alert((error as Error).message);
    }
};

//WalletConnect
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
    fetchNfts(accounts[0]);
};

// Weave DB 
    useEffect(() => {
        const initDb = async () => {
            // Initialize db here and store it in the ref
            dbRef.current = new WeaveDB({ contractTxId: WEAVEDB_CONTRACT });
            if (dbRef.current) {
                await dbRef.current.init();
                setDbIsInitialized(true);
            }
        };

        initDb();
    }, []);

// Add a useEffect hook for the 'accountsChanged' event
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                // Time to reload interface with accounts[0]!
                console.log(accounts[0]);
                // Potentially call any functions that update the state of the app like setAccount(accounts[0]
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            // Return a cleanup function to remove the event listener when the component unmounts
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);    

    useEffect(() => {
        if (account) {
            fetchNfts(account);
        }
    }, [account]);

    
    interface Nft {
        identifier: string;
        collection: string;
        contract: string;
        token_standard: string;
        name: string;
        description: string;
        image_url: string;
        metadata_url: string;
        created_at: string;
        updated_at: string;
        is_disabled: boolean;
        is_nsfw: boolean;
    }
     

    const handleNftSelect = (nft: Nft) => {
        setNft(nft);
    };

    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBio(event.target.value);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleUpload = async () => {
        if (!nft || !bio || !name) {
            alert("Please select an NFT, enter a name and biography");
            return;
        }

        const profilePicUrl = nft.image_url;

        // Generate HTML content using renderToString
        const profileCardHtml = ReactDOMServer.renderToString(
            <ProfileCard name={name} bio={bio} profilePicUrl={nft.image_url} />
        );
    
        const htmlContent = `
            <html>
            <head>
                <title>Profile Page</title>
            </head>
            <body>
                ${profileCardHtml}
            </body>
            </html>
        `;

        // Creating HTML file
        const htmlFile = new File([htmlContent], "index.html", { type: 'text/html' });

        // File array for upload
        const response = await fetch(nft.image_url);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
        const uploadTimestamp = new Date().getTime();

        
        const files = [
          { path: htmlFile.name, content: await htmlFile.arrayBuffer() },
          { path: nft.image_url.split('/').pop()!, content: arrayBuffer },
        ];

        // Upload to IPFS
        try {
            setIsLoading(true);
            const uploadResult = await fleekSdk.ipfs().addAll(files);
            setUploadLink(`ipfs://${uploadResult[0].cid}`);
      
            // Add document to WeaveDB
            const profileInfo = {
                ...nft,
                age: uploadTimestamp, 
                ipfsUrl: `ipfs://${uploadResult[0].cid}`,
                profilePicUrl: `ipfs://${uploadResult[1].cid}`,
                profileName: name,
                bio,
                walletAddress: account,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            if (dbRef.current) {
                await dbRef.current.add(profileInfo, WEAVEDB_COLLECTION);
            } else {
                console.error('db is not initialized');
            }

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
          
    };


    // Function to reformat link
    const reformatLink = (link: string) => {
        const hash = link.split('//')[1].split('.')[0];
        return `ipfs://${hash}`;
    };

    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/upload">Upload</Link>
                        </li>
                        <li>
                            <Link to="/explorer">Explorer</Link>
                        </li>
                    </ul>
                </nav>
    
                <button onClick={connectWallet}>Connect Wallet</button>

                <Routes>
                    <Route path="/explorer" element={<Explorer />} />
                    <Route path="/upload" element={
                        <div className="App">
                            <header className="App-header">
                                {isLoading ? (
                                    <div className="uploading-text">Uploading...</div>
                                ) : (
                                    <>
                                        <p className="title-text">Face Fables :)</p>
                                        <div className="flex-container">
                                            <div className="input-container">
                                                <div className="nft-grid">
                                                    {nfts.map((nft, index) => (
                                                        <div key={index} className="nft-item" onClick={() => handleNftSelect(nft)}>
                                                            <img src={nft.image_url} alt={nft.name} />
                                                            <div>{nft.name}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="name-container">
                                                    <label className="styled-label" htmlFor="name">Name your NFT:</label>
                                                    <input id="name" onChange={handleNameChange} className="styled-input" />
                                                </div>
                                                <div className="bio-container">
                                                    <label className="styled-label" htmlFor="bio">Biography:</label>
                                                    <textarea id="bio" onChange={handleBioChange} className="styled-textarea"></textarea>
                                                </div>
                                                <div className="button-container">
                                                    <button
                                                        className="styled-button"
                                                        onClick={handleUpload}
                                                    >
                                                        Upload
                                                    </button>
                                                    {uploadLink && (
                                                        <a
                                                            className="upload-link"
                                                            href={reformatLink(uploadLink)}
                                                            target="__blank"
                                                        >
                                                            <b>Copy this link to your subdomain content hash in the ENS app : <br /></b>
                                                            {reformatLink(uploadLink)}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </header>
                        </div>
                    } />
                    <Route path="/" element={
                        <div>
                            <h1>Welcome to our App</h1>
                            <p>To upload, navigate to the Upload page. To explore existing uploads, navigate to the Explorer page.</p>
                        </div>
                    } />
                </Routes>
            </div>
        </Router>
    );
    

    
    }
    
    export default App;
    