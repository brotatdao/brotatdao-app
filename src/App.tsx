import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Explorer from './pages/Explorer/Explorer';
import { firebaseApp } from './components/firebaseConfig';
import { WagmiConfig } from 'wagmi';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet } from 'viem/chains';
import NavBar from './components/NavBar';
import Footer from './components/Footer';


const projectId = import.meta.env.VITE_WALLETCONNECT_ID;

const metadata = {
    name: 'brotatdao', 
    description: 'brotatdao',
    url: 'https://brotatdao.eth.limo',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeVariables: {
    '--w3m-accent': '#52525B', // Greyscale color for buttons, icons, labels, etc.
    '--w3m-color-mix': '#1A202C', // Dark zinc color for blending
    '--w3m-color-mix-strength': 40, // Strength of color mix blending
  }
 });

const App = () => {

 return (
  <WagmiConfig config={wagmiConfig}>
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        <NavBar /> {/* Existing NavBar component */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/explorer" element={<Explorer />} />
          </Routes>
        </div>
        <Footer /> {/* Include the Footer component */}
      </div>
    </Router>
  </WagmiConfig>
 );
};

export default App;
export { firebaseApp };