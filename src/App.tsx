import React, { useEffect, useState } from "react";
import { FleekSdk, ApplicationAccessTokenService } from '@fleekxyz/sdk';
import ReactDOMServer from 'react-dom/server';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Explorer from './pages/Explorer/Explorer';
import ProfileCard from './components/ProfileCard';
import { WEAVEDB_CONTRACT, WEAVEDB_COLLECTION } from "./components/Constants";
import { listNftsByAccount } from './components/OpenSea';
import WeaveDB from "weavedb-sdk";
import createModal, { wagmiConfig } from './components/WalletConnect';
import { WagmiConfig } from 'wagmi';
import "./App.css";



// Initialize Fleek SDK
const applicationService = new ApplicationAccessTokenService({
    clientId: import.meta.env.VITE_FLEEK_CLIENT_ID!,  // Fleek env variable
});
const fleekSdk = new FleekSdk({ accessTokenService: applicationService });

// Initialize WeaveDB
const db = new WeaveDB({ contractTxId: WEAVEDB_CONTRACT });  
// Create an async function to initialize the database
async function initDb() {
    await db.init();
}
// Call the function
initDb();

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
    
    const { open } = createModal();

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

    useEffect(() => {
        const initDb = async () => {
            await db.init();
            setDbIsInitialized(true);
        };

        initDb();
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
            await db.add(profileInfo, WEAVEDB_COLLECTION);  

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
        <WagmiConfig config={wagmiConfig}>
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
    
                <button onClick={() => open()}>Connect Wallet</button>

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
        </WagmiConfig>
    );
    

    
    }
    
    export default App;
    