import React, { useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import { FleekSdk, ApplicationAccessTokenService } from '@fleekxyz/sdk';
import axios from 'axios'
import ProfileCard from '../../components/ProfileCard';
import { listNftsByAccount } from '../../components/OpenSea';
import { WEAVEDB_COLLECTION, IPFS_GATEWAY } from "../../components/Constants";
import WeaveDB from "weavedb-sdk";
import './Upload.css';

const applicationService = new ApplicationAccessTokenService({
    clientId: import.meta.env.VITE_FLEEK_CLIENT_ID!,
});
const fleekSdk = new FleekSdk({ accessTokenService: applicationService });

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

interface UploadProps {
    account?: any;
    dbRef: React.MutableRefObject<WeaveDB | null>;
    identity: any;
}

const Upload: React.FC<UploadProps> = ({ account, dbRef, identity }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadLink, setUploadLink] = useState("");
    const [bio, setBio] = useState("");
    const [profileName, setProfileName] = useState("");
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
    const [twitterHandle, setTwitterHandle] = useState("");


    useEffect(() => {
        if (account) {
            fetchNfts(account);
        }
    }, [account]);

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

    const handleNftSelect = (nft: Nft) => {
        setSelectedNft(nft);
    };

    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBio(event.target.value);
    };

    const handleProfileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProfileName(event.target.value);
    };

    

    const handleUpload = async () => {
        if (!selectedNft || !bio || !profileName) {
            alert("Please select an NFT, enter a name and biography");
            return;
        }
    
        const profilePicUrl = selectedNft.image_url;
        const uploadTimestamp = new Date().getTime();
    
        const profileCardHtml = ReactDOMServer.renderToString(
            <ProfileCard profileName={profileName} bio={bio} profilePicUrl={profilePicUrl} />
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
    
        const htmlFile = new File([htmlContent], "index.html", { type: 'text/html' });
    
        const response = await fetch(selectedNft.image_url);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
    
        const files = [
            { path: htmlFile.name, content: await htmlFile.arrayBuffer() },
            { path: selectedNft.image_url.split('/').pop()!, content: arrayBuffer },
        ];
    
        try {
            setIsLoading(true);
            const uploadResult = await fleekSdk.ipfs().addAll(files);
    
            const contentHash = `ipfs://${uploadResult[0].cid}`;
            const ipfsProfilePicUrl = `ipfs://${uploadResult[1].cid}`;
    
            const profileInfo = {
                ...selectedNft,
                age: uploadTimestamp, 
                ipfsUrl: contentHash,
                profilePicUrl: ipfsProfilePicUrl,
                profileName,
                bio,
                walletAddress: account,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                twitterHandle,
            };
    

        // Check if dbRef.current and identity are valid
        if (dbRef.current && identity) {
            // Perform database operations using identity
            await dbRef.current.add(profileInfo, WEAVEDB_COLLECTION, identity);
        } else {
            console.error('Database not initialized or identity missing');
        }
    
        try {
            const ensSetSuccessfully = await setEnsSubdomain(contentHash, ipfsProfilePicUrl);
            if (!ensSetSuccessfully) {
                setIsLoading(false);
                return;
            }
        } catch (err) {
            console.error(err);
            return;
        } finally {
            setIsLoading(false);
        }
    } catch (err) {
        console.error('Error during upload:', err);
        alert('Upload failed. Please try again.');
    } finally {
        setIsLoading(false);
    }
    };
    

    const setEnsSubdomain = async (contentHash: string, ipfsProfilePicUrl: string) => {
        const domain = "brotatdao.eth";
        const address = account;
        const description = bio.substring(0, 255);

        const payload = {
            domain,
            name: profileName,
            address,
            contenthash: contentHash,
            text_records: {
                "com.twitter": twitterHandle,
                "description": description,
                "avatar": ipfsProfilePicUrl,
            },
            single_claim: 0,
        };

        // check if production or development environment for proxy or direct api calls
        const apiBaseUrl = import.meta.env.MODE === 'production' 
            ? 'https://namestone.xyz/api/public_v1' 
            : '/api/public_v1';

        
        try {
            const response = await axios.post(`${apiBaseUrl}/claim-name`, payload, {
                headers: { 'Authorization': import.meta.env.VITE_NAMESTONE }
            });
            console.log('ENS Subdomain Set:', response.data);
            return true;
            } catch (error) {
            console.error('Error setting ENS subdomain:', error);
            alert('Failed to set ENS subdomain. Please try again.');
            return false;
            }              
    };

    const reformatLink = (link: string) => {
        const hash = link.split('//')[1].split('.')[0];
        return `ipfs://${hash}`;
    };

    return (
        <div className="Upload">
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
                                    <label className="styled-label" htmlFor="profileName">Name your NFT:</label>
                                    <input id="name" onChange={handleProfileNameChange} className="styled-input" />
                                </div>
                                <div className="bio-container">
                                    <label className="styled-label" htmlFor="bio">Biography:</label>
                                    <textarea id="bio" onChange={handleBioChange} className="styled-textarea"></textarea>
                                </div>
                                <div className="twitter-handle-container">
                                    <label className="styled-label" htmlFor="twitterHandle">Twitter Handle:</label>
                                    <input id="twitterHandle" onChange={(e) => setTwitterHandle(e.target.value)} className="styled-input" />
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
    );
};

export default Upload;
