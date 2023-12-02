import React, { useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import { FleekSdk, ApplicationAccessTokenService } from '@fleekxyz/sdk';
import ProfileCard from '../../components/ProfileCard';
import { listNftsByAccount } from '../../components/OpenSea';
import { WEAVEDB_COLLECTION } from "../../components/Constants";
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
        const uploadTimestamp = new Date().getTime();

        const files = [
            { path: htmlFile.name, content: await htmlFile.arrayBuffer() },
            { path: selectedNft.image_url.split('/').pop()!, content: arrayBuffer },
        ];

        try {
            setIsLoading(true);
            const uploadResult = await fleekSdk.ipfs().addAll(files);
            setUploadLink(`ipfs://${uploadResult[0].cid}`);
      
            const profileInfo = {
                ...selectedNft,
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
