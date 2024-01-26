import React, { useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import { FleekSdk, ApplicationAccessTokenService } from '@fleekxyz/sdk';
import ProfileCard from '../../components/ProfileCard';
import { listNftsByAccount } from '../../components/OpenSea';
import { useAccount } from 'wagmi'
import { db, auth } from '../../components/firebaseConfig';
import { collection, doc, setDoc, query, where, getDocs } from "firebase/firestore"
import { Profile } from 'src/components/profileTypes';
import { FaXTwitter } from 'react-icons/fa6';
import { AiOutlineLoading } from "react-icons/ai";
import useEnsSubdomainSetter from "../../components/useEnsSubdomainSetter"



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
    const [ensSubdomainUrl, setEnsSubdomainUrl] = useState("");
    const [isProfileNameTaken, setIsProfileNameTaken] = useState(false);
    const setEnsSubdomain = useEnsSubdomainSetter();



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

    const handleProfileNameChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setProfileName(newName);
    
        if (newName.length === 0) {
            setIsProfileNameTaken(false);
            return;
        }
    
        const newNameLower = newName.toLowerCase(); // Convert to lowercase
    
        try {
            const q = query(collection(db, "Profiles"), where("profileNameLower", "==", newNameLower));
            const querySnapshot = await getDocs(q);
            setIsProfileNameTaken(!querySnapshot.empty);
        } catch (error) {
            console.error("Error checking profile name:", error);
        }
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
            const firebaseUserId = auth.currentUser ? auth.currentUser.uid : null;

            if (!firebaseUserId) {
                console.error('No user is currently authenticated.');
                setIsLoading(false); // Ensure loading state is reset
                return;
            }
    

            const profileInfo = {
                ...selectedNft,
                ipfsUrl: contentHash,
                profilePicUrl: ipfsProfilePicUrl,
                profileName,
                profileNameLower: profileName.toLowerCase(),
                bio,
                walletAddress: walletAddress || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                twitterHandle,
                firebaseUserId
            };

            // Generate a new document ID for the Profiles collection
            const newProfileDocRef = doc(collection(db, "Profiles"));

            // Add profileInfo to Profiles collection
            await setDoc(newProfileDocRef, profileInfo);

    
        try {
            const ensSetSuccessfully = await setEnsSubdomain(profileName, walletAddress || '', bio, twitterHandle, ipfsProfilePicUrl, contentHash);
            if (!ensSetSuccessfully) {
                // Handle failure
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
    

    return (
        <div className="min-h-screen bg-zinc-50 flex justify-center items-center">
            <header className="pt-2 pb-10">
                <div className="container mx-auto px-6">
                {isLoading ? (
                    <div className="text-center">
                        <AiOutlineLoading className="animate-spin h-8 w-8 text-gray-800" />
                        <div className="mt-3 text-lg font-semibold text-gray-700">Loading...</div>
                    </div>
                ) : uploadSuccess && uploadedProfile ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-lime-600">Sick. You nailed that upload bro.</h2>
                        <p className="text-gray-700 my-2">Your new profile page will take like 1 to 10 minutes to fully propagate across the interwebs.</p>
                        <div className="bg-gradient-to-br from-white to-zinc-150 rounded-lg shadow-md overflow-hidden flex flex-row mb-5 w-full max-w-4xl mx-auto">
                            <div className="flex-none w-1/3">
                                <img src={uploadedProfile.image_url || uploadedProfile.profilePicUrl} alt="Profile Pic" className="w-full h-full object-cover rounded-l-lg" />
                            </div>
                            <div className="flex-grow p-5">
                                <div className="text-left text-3xl font-semibold text-gray-800">{uploadedProfile.profileName}</div>
                                <div className="text-left text-gray-600 mt-2">{uploadedProfile.bio}</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a href={uploadedProfile.ipfsUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-400 transition duration-300">
                                straight IPFS link for the inquisitive bros 
                            </a>
                            <br/>
                            
                            <a href={`https://${ensSubdomainUrl}`} target="_blank" rel="noopener noreferrer" className="text-xl text-lime-600 hover:text-lime-800 transition duration-300">
                                {profileName.toLowerCase()}.brotatdao.eth subdomain
                            </a>
                        </div>
                        <button className="mt-6 w-1/2 bg-zinc-600 text-white px-6 py-3 rounded-full hover:bg-zinc-500 transition duration-300" onClick={() => setUploadSuccess(false)}>Create another profile</button>
                    </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                    <p className="text-gray-700 text-center font-bold mb-4">Connect your wallet, sign in, and select a NFT</p>
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
                                    <p className="text-gray-700 text-center font-bold mb-4">Give us the scoop</p>
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
                                        {isProfileNameTaken && (
                                            <p className="text-red-600 text-xs italic">That name's taken bro</p>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-800">What it do?</label>
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
                                    <button 
                                        className={`w-full px-6 py-3 rounded-full transition duration-300 ${
                                            isProfileNameTaken ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-zinc-600 text-white hover:bg-zinc-500'
                                        }`}
                                        onClick={handleUpload}
                                        disabled={isProfileNameTaken}
                                    >
                                        Create Profile - Free
                                    </button>
                                    <p className="text-gray-700 text-center mb-4">This will NOT trigger a blockchain event, cost gas or fees.</p>
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
