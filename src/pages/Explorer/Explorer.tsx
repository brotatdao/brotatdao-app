import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import './Explorer.css';
import { db } from '../../App';


type Profile = {
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
    profileName: string;
    bio: string;
    walletAddress: string;
    ipfsUrl: string;
    profilePicUrl: string;
};

const Explorer: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const q = query(collection(db, "nftProfiles"), orderBy("created_at", "desc"));
                const querySnapshot = await getDocs(q);
                const fetchedProfiles = querySnapshot.docs.map(doc => doc.data() as Profile);
                setProfiles(fetchedProfiles);
            } catch (error) {
                console.error("Error fetching profiles from Firestore:", error);
            }
        };

        fetchProfiles();
    }, []);

    if (!profiles.length) {
        return <div>Loading...</div>; // Or a loading spinner component
    }

    return (
        <div className="Explorer">
            <h1>Profile Explorer</h1>
            {profiles.map((profile, index) => (
                <div key={index} className="profile-card">
                    <div className="profile-photo">
                        <img src={profile.image_url} alt="Profile" />
                    </div>
                    <div className="profile-info">
                        <div className="profileName">{profile.profileName}</div>
                        <div className="bio">{profile.bio}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Explorer;
