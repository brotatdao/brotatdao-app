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

  const Explorer = () => {
    const [sites, setSites] = useState<Profile[]>([]);
    const [dbIsInitialized, setDbIsInitialized] = useState(false);
  
    // Initialize WeaveDB
    const db = new WeaveDB({ contractTxId: WEAVEDB_CONTRACT });
  
    const fetchProfiles = useCallback(async () => {
      await db.init();
      const result = await db.cget<Profile>(WEAVEDB_COLLECTION, [ "age" ]); 
      const profiles = result.map((doc: DocType) => doc.data);
      setSites(profiles);
    }, []);
  
    useEffect(() => {
      const initDb = async () => {
        await db.init();
        setDbIsInitialized(true);
        fetchProfiles();
      };
  
      initDb();
    }, [fetchProfiles]);
  
    // If the database is not initialized, return null or a loading spinner
    if (!dbIsInitialized) {
        return null;  // Or return a loading spinner
    }
    
    return (
      <div>
          <h1>Explorer</h1>
          {sites.map((profile, index) => (
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