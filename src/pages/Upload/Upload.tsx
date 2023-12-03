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
    account: string;
    dbRef: React.MutableRefObject<WeaveDB | null>;
}

const Upload: React.FC<UploadProps> = ({ account, dbRef }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadLink, setUploadLink] = useState("");
    const [bio, setBio] = useState("");
    const [name, setName] = useState("");
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

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleUpload = async () => {
        if (!selectedNft || !bio || !name) {
            alert("Please select an NFT, enter a name and biography");
            return;
        }

        const profilePicUrl = selectedNft.image_url;
        const uploadTimestamp = new Date().getTime();

        const profileCardHtml = ReactDOMServer.renderToString(
            <ProfileCard name={name} bio={bio} profilePicUrl={profilePicUrl} />
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

            const ensSetSuccessfully = await setEnsSubdomain(contentHash, ipfsProfilePicUrl);
            if (!ensSetSuccessfully) {
                setIsLoading(false);
                return;
            }

            const profileInfo = {
                ...selectedNft,
                age: uploadTimestamp, 
                ipfsUrl: contentHash,
                profilePicUrl: ipfsProfilePicUrl,
                profileName: name,
                bio,
                walletAddress: account,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                twitterHandle,
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

    const setEnsSubdomain = async (contentHash: string, ipfsProfilePicUrl: string) => {
        const domain = "brotatdao.eth";
        const address = account;
        const description = bio.substring(0, 255);

        const payload = {
            domain,
            name,
            address,
            contenthash: contentHash,
            text_records: {
                "com.twitter": twitterHandle,
                "description": description,
                "avatar": ipfsProfilePicUrl,
            },
            single_claim: 0,
        };

        // remove proxy config for production - use env variables to check if the enviornment is production or development
        
        try {
            const response = await axios.post('/api/public_v1/claim-name', payload, {
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
                                    <label className="styled-label" htmlFor="name">Name your NFT:</label>
                                    <input id="name" onChange={handleNameChange} className="styled-input" />
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
