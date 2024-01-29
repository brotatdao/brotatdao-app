import axios from 'axios';

const useEnsSubdomainSetter = () => {
    const setEnsSubdomain = async (profileName: string, walletAddress: string, bio: string, twitterHandle: string, ipfsProfilePicUrl: string, contentHash: string) => {
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
            ? 'https://us-central1-brotatdao.cloudfunctions.net/proxy' 
            : '/api/public_v1';      

        try {
        
            const response = await axios.post(`${apiBaseUrl}/claim-name`, payload);
            console.log('ENS Subdomain Set:', response.data);
            return true;
        } catch (error) {
            console.error('Error setting ENS subdomain:', error);
            return false;
        }
    };

    return setEnsSubdomain;
};

export default useEnsSubdomainSetter;
