import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db, } from '../../components/firebaseConfig';
import { Profile } from 'src/components/profileTypes';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../components/firebaseConfig';
import { AiOutlineLoading } from "react-icons/ai";
import { Switch } from '@headlessui/react';


const Explorer: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [viewOwnProfiles, setViewOwnProfiles] = useState(false);
    const [user] = useAuthState(auth);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {

        const fetchProfiles = async () => {
            try {
                let q;
                if (viewOwnProfiles && user) {
                    // Query to fetch profiles of the current user
                    q = query(collection(db, "Profiles"), where("firebaseUserId", "==", user.uid), orderBy("created_at", "desc"));
                } else {
                    // Query to fetch all profiles
                    q = query(collection(db, "Profiles"), orderBy("created_at", "desc"));
                }
                const querySnapshot = await getDocs(q);
                const fetchedProfiles = querySnapshot.docs.map(doc => doc.data() as Profile);
                setProfiles(fetchedProfiles);
            } catch (error) {
                console.error("Error fetching profiles from Firestore:", error);
            }
        };

        fetchProfiles();
    }, [viewOwnProfiles, user]); 


    useEffect(() => {
        // Filter logic
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = profiles.filter(profile => 
            profile.profileName.toLowerCase().includes(lowercasedSearchTerm) ||
            profile.bio.toLowerCase().includes(lowercasedSearchTerm) ||
            profile.twitterHandle?.toLowerCase().includes(lowercasedSearchTerm) ||
            profile.collection?.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredProfiles(filtered);
    }, [searchTerm, profiles]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const toggleView = () => setViewOwnProfiles(prev => !prev);

    if (!profiles.length) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <AiOutlineLoading className="animate-spin h-8 w-8 text-zinc-800" />
                <span className="text-zinc-800 font-semibold ml-2">Loading...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
            <h1 className="text-3xl font-bold text-zinc-800 mb-8">Profile Explorer</h1>

            <Switch.Group as="div" className="flex items-center space-x-4 mb-4">
                <Switch.Label passive>
                    View All Profiles
                </Switch.Label>
                <Switch
                    checked={viewOwnProfiles}
                    onChange={toggleView}
                    className={`${viewOwnProfiles ? 'bg-zinc-600' : 'bg-zinc-300'}
                                relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
                >
                    <span
                        className={`${viewOwnProfiles ? 'translate-x-6' : 'translate-x-1'}
                                    inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                    />
                </Switch>
                <Switch.Label passive>
                    View My Profiles
                </Switch.Label>
            </Switch.Group>

            <input
                type="text"
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-10 p-2 border rounded border-zinc-400"
            />

            {filteredProfiles.map((profile, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-zinc-200 rounded-lg shadow-md overflow-hidden flex flex-row mb-5 w-full max-w-4xl">
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
