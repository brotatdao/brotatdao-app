// Explorer.tsx
import React, { useEffect, useState, useCallback } from 'react';
import WeaveDB from "weavedb-sdk";
import { WEAVEDB_CONTRACT, WEAVEDB_COLLECTION, IPFS_GATEWAY } from '../../components/Constants';
import './Explorer.css';

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
    age: number;
  };
  
  type DocType = {
    id: string;
    setter: string;
    data: Profile;
    block: {
      height: number;
      timestamp: number;
    };
  };

  interface ExplorerProps {
    dbRef: React.MutableRefObject<WeaveDB | null>;
}

const Explorer: React.FC<ExplorerProps> = ({ dbRef }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const fetchProfiles = async () => {
      if (dbRef.current) {
          const result = await dbRef.current.cget<Profile>(WEAVEDB_COLLECTION, ["age"]);
          const fetchedProfiles = result.map((doc: DocType) => doc.data);
          setProfiles(fetchedProfiles);
      }
  };

  useEffect(() => {
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
                      <img src={profile.profilePicUrl ? `https://${IPFS_GATEWAY}${profile.profilePicUrl.split('//')[1]}` : ''} alt="Profile Picture" />
                  </div>
                  <div className="profile-info">
                      <div className="name">{profile.name}</div>
                      <div className="bio">{profile.bio}</div>
                  </div>
              </div>
          ))}
      </div>
    );
  };
  
  export default Explorer;