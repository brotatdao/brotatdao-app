// WalletConnect.tsx
import { createWeb3Modal as createWeb3ModalBase, defaultConfig } from '@web3modal/ethers5/react'

const projectId = process.env.REACT_APP_WALLETCONNECT_ID!  // Ensure you have this env variable set

const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/']
}

const createWeb3Modal = () => {
  return createWeb3ModalBase({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    projectId
  });
}

export default createWeb3Modal;  // Export the createWeb3Modal function
