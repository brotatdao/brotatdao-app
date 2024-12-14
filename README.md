# 🥔 BrotatDAO App

BrotatDAO is a web3 application (dAPP) that allows users to create gasless NFT profile pages with custom ENS subdomains. The app enables users to select NFTs from their wallet, give them a name, and create personalized profile pages that are hosted on IPFS and accessible through custom brotatdao.eth subdomains.

## 🌟 Features

- **Gasless NFT Profile Creation**: Create a profile page for your NFT without any gas fees
- **ENS Subdomain Integration**: Get a free `name.brotatdao.eth` subdomain
- **IPFS Hosting**: Profile pages are automatically uploaded to IPFS via fleek.xyz
- **Profile Explorer**: Browse all created profiles through our Firebase-powered explorer
- **Wallet Integration**: Connect your wallet to select from your owned NFTs
- **Zero Transaction Costs**: Complete profile creation without any blockchain transactions

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- Web3 wallet (MetaMask or compatible) with owned ETH NFTs
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/brotatdao/brotatdao-app.git
cd brotatdao-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration values.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Frontend**: React
- **Hosting**: fleek.xyz
- **Database**: Firebase
- **Storage**: IPFS via fleek.xyz
- **Domain System**: ENS (Ethereum Name Service)
- **Web3 Integration**: ethers.js
- **Styling**: TailwindCSS

## 📦 Project Structure

```
brotatdao-app/
├── components/          # Reusable React components
├── pages/              # React pages
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── styles/             # Global styles and Tailwind config
├── utils/              # Helper functions and constants
└── public/             # Static assets
```

## 🔄 How It Works

1. **Connect Wallet**: Users connect their Web3 wallet to view their NFTs
2. **Select NFT**: Choose an NFT from your wallet to create a profile
3. **Customize Profile**: Add a name and profile information
4. **Profile Creation**:
   - Profile data is uploaded to IPFS through fleek.xyz
   - A subdomain (name.brotatdao.eth) is registered
   - Profile information is stored in Firebase
5. **CHECK OUT YOUR PROFILE PAGE**: view your new profile at name.brotatdao.xyz
5. **Browse Profiles**: Visit the explorer page to view all created profiles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🥔 About BrotatDAO

BrotatDAO is exploring innovative ways to create AI and web3 experiences. This project demonstrates how to leverage ENS, IPFS, and modern web3 infrastructure to create user-friendly, cost-free blockchain applications.

## 🌐 Links

- [Website](https://brotatdao.xyz)