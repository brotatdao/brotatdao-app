import React, { useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import { FleekSdk, ApplicationAccessTokenService } from '@fleekxyz/sdk';
import axios from 'axios';
import ProfileCard from '../../components/ProfileCard';
import { listNftsByAccount } from '../../components/OpenSea';
import { useAccount } from 'wagmi'
import { db, auth } from '../../components/firebaseConfig';
import { collection, doc, setDoc } from "firebase/firestore"
import { Profile } from 'src/components/profileTypes';
import { FaXTwitter } from 'react-icons/fa6';


const applicationService = new ApplicationAccessTokenService({
    clientId: import.meta.env.VITE_FLEEK_CLIENT_ID!,
});
const fleekSdk = new FleekSdk({ accessTokenService: applicationService }); //Initialize Fleek

interface Nft {
    identifier: string;
    collection: string;
    contract: string;
    token_standard: string;
    name: string;
    description: string;
    image_url: string;
    metadata_url: string;
    is_disabled: boolean;
    is_nsfw: boolean;
    opensea_url: string;
}

const Upload: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [bio, setBio] = useState("");
    const [profileName, setProfileName] = useState("");
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
    const [twitterHandle, setTwitterHandle] = useState("");
    const { address: walletAddress } = useAccount();
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedProfile, setUploadedProfile] = useState<Profile | null>(null);
    const [ensSubdomain, setEnsSubdomainUrl] = useState("");

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
        if (walletAddress) {
            // Fetch NFTs for the connected account
            fetchNfts(walletAddress);
        }
    }, [walletAddress]);

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
            alert("Please select an NFT, enter a name and bio");
            return;
        }
    
        const profilePicUrl = selectedNft.image_url;

    
        const profileCardHtml = ReactDOMServer.renderToString(
            <ProfileCard profileName={profileName} bio={bio} profilePicUrl={profilePicUrl} />
        );
    
        const htmlContent = `
            <html>
            <head>
                <title>${profileName} - Profile Page</title>
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
                ipfsUrl: contentHash,
                profilePicUrl: ipfsProfilePicUrl,
                profileName,
                bio,
                walletAddress: walletAddress || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                twitterHandle,
            };

            //Firestore DB upload
            const firebaseUserId = auth.currentUser ? auth.currentUser.uid : null;

            if (!firebaseUserId) {
            console.error('No user is currently authenticated.');
            return;
            }
            // Generate a new document ID for the Profiles collection
            const newProfileDocRef = doc(collection(db, "Profiles"));

            // Add profileInfo to Profiles collection
            await setDoc(newProfileDocRef, profileInfo);

            // Add Firebase User ID and walletAddress to Users collection
            await setDoc(doc(db, "Users", firebaseUserId), { walletAddress });
    
    
        try {
            const ensSetSuccessfully = await setEnsSubdomain(contentHash, ipfsProfilePicUrl);
            if (!ensSetSuccessfully) {
                setIsLoading(false);
                return;
            }
            // Set state for successful upload
            setUploadSuccess(true);
            setUploadedProfile(profileInfo);
            setEnsSubdomainUrl(`${profileName}.brotatdao.eth.limo`);
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
        const address = walletAddress;
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

    return (
        <div className="min-h-screen bg-zinc-50 flex justify-center items-center">
            <header className="py-10">
                <div className="container mx-auto px-6">
                {isLoading ? (
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                            <span className="visually-hidden">...</span>
                        </div>
                        <div className="mt-3 text-lg font-semibold text-gray-700">Loading...</div>
                    </div>
                ) : uploadSuccess && uploadedProfile ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-green-600">Upload Successful!</h2>
                        <p className="text-gray-700 my-2">Your new profile page will take between 1 and 10 minutes to fully propagate across the interwebs.</p>
                        <div className="bg-gradient-to-br from-white to-zinc-150 rounded-lg shadow-md overflow-hidden flex flex-row mb-5 w-full max-w-4xl mx-auto">
                            <div className="flex-none w-1/3">
                                <img src={uploadedProfile.image_url || uploadedProfile.profilePicUrl} alt="Profile Pic" className="w-full h-full object-cover rounded-l-lg" />
                            </div>
                            <div className="flex-grow p-5">
                                <div className="text-left text-xl font-semibold text-gray-800">{uploadedProfile.profileName}</div>
                                <div className=" text-gray-600 mt-2">{uploadedProfile.bio}</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a href={uploadedProfile.ipfsUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition duration-300">
                                Raw IPFS Url
                            </a>
                            <br/>
                            <a href={`https://${setEnsSubdomainUrl}`} target="_blank" rel="noopener noreferrer" className="text-xl text-green-600 hover:text-green-800 transition duration-300">
                                {profileName}.brotatdao.eth subdomain
                            </a>
                        </div>
                        <button className="mt-6 w-full bg-zinc-600 text-white px-6 py-3 rounded-full hover:bg-zinc-500 transition duration-300" onClick={() => setUploadSuccess(false)}>Upload Another</button>
                    </div>
                    ) : (
                        <>
                            <h1 className="text-center text-2xl font-bold text-zinc-700 mb-5">Connect your wallet and sign in to choose your NFT.  This will not trigger a blockchain event, cost gas or any fees. </h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {nfts.map((nft, index) => (
                                            <div key={index}
                                                 className={`cursor-pointer p-2 border-2 ${selectedNft?.identifier === nft.identifier ? 'border-gray-700' : 'border-transparent'} rounded-md hover:shadow-lg transition-all`}
                                                 onClick={() => handleNftSelect(nft)}>
                                                <img src={nft.image_url} alt={nft.name} className="w-full h-40 object-cover rounded-md hover:opacity-75" />
                                                <div className="text-center text-sm font-semibold mt-2">{nft.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                                    {selectedNft && (
                                        <div className="mb-4 flex justify-center">
                                            <img src={selectedNft.image_url} alt={selectedNft.name} className="w-1/4 h-auto object-cover rounded-md" />
                                        </div>
                                    )}
                                    <div className="mb-4">
                                        <label htmlFor="profileName" className="block text-sm font-medium text-gray-800">Name?</label>
                                        <input 
                                            type="text" 
                                            id="profileName" 
                                            maxLength={50}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 p-2" 
                                            onChange={handleProfileNameChange} 
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-800">What it do?:</label>
                                        <textarea 
                                            id="bio" 
                                            maxLength={700}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 p-2" 
                                            rows={4} 
                                            onChange={handleBioChange}
                                        ></textarea>
                                    </div>
                                    <div className="mb-6">
                                        <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-800">
                                            <FaXTwitter className="h-5 w-5" aria-hidden="true" /> username only - no @ or URL
                                        </label>
                                        <input 
                                            type="text" 
                                            id="twitterHandle" 
                                            maxLength={15}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 p-2" 
                                            onChange={(e) => setTwitterHandle(e.target.value)} 
                                        />
                                    </div>
                                    <button className="w-full bg-zinc-600 text-white px-6 py-3 rounded-full hover:bg-zinc-500 transition duration-300" onClick={handleUpload}>Upload</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </header>
        </div>
    );
    
    
    
};

export default Upload;
