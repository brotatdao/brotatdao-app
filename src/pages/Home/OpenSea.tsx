export async function listNftsByAccount(address: string) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-api-key': process.env.REACT_APP_OPENSEA_KEY!  // Ensure you have this env variable set
        }
    };

    try {
        const response = await fetch(`https://api.opensea.io/api/v2/chain/ethereum/account/${address}/nfts?limit=50`, options);
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const responseData = await response.json();  
        return responseData;  
    } catch (err) {
        console.error(err);
        throw new Error('Failed to fetch NFTs from OpenSea');
    }
}
