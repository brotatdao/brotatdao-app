import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, } from '../../components/firebaseConfig';
import { Profile } from 'src/components/profileTypes';


const Explorer: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
            const q = query(collection(db, "Profiles"), orderBy("created_at", "desc"));
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
        return <div className="text-zinc-800 font-semibold">Loading...</div>; // Or a loading spinner component
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-4">
            <h1 className="text-3xl font-bold text-zinc-800 mb-8">Profile Explorer</h1>
            {profiles.map((profile, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-200 rounded-lg shadow-md overflow-hidden flex flex-row mb-5 w-full max-w-4xl">
                    <div className="flex-none w-1/3">
                        <img src={profile.image_url} alt="Profile Pic" className="w-full h-full object-cover rounded-l-lg" />
                    </div>
                    <div className="flex-grow p-5">
                        <div className="text-xl font-semibold text-gray-800">{profile.profileName}</div>
                        <div className="text-gray-600 mt-2">{profile.bio}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Explorer;
