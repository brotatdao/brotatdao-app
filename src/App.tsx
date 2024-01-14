import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Explorer from './pages/Explorer/Explorer';
import Auth from './components/Auth'; 
import { firebaseApp } from './components/firebaseConfig';
import { WagmiConfig } from 'wagmi';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet } from 'viem/chains';
import ConnectButton from './components/ConnectButton'
import Logo from './assets/brologo.svg'

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
    '--w3m-accent': '#757575', // Greyscale color for buttons, icons, labels, etc.
  }
 });

const App = () => {
 Auth();

 const [isMenuOpen, setIsMenuOpen] = useState(false); 

 return (
  <WagmiConfig config={wagmiConfig}>
  <Router>
  <div className="min-h-screen bg-white">
        <nav className="bg-white">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center">
            {/* Logo Placeholder */}
            <img src={Logo} alt="Logo" className="h-14 w-14 mr-2" />
          </div>
          {/* Navigation Links and Connect Button for larger screens */}
          <div className="hidden md:flex items-center justify-center flex-1">
                <Link to="/" className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link to="/upload" className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">Upload</Link>
                <Link to="/explorer" className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">Explorer</Link>
              </div>
              <div className="flex items-center">
                <ConnectButton />
                <div className="md:hidden">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800 hover:text-gray-600 focus:outline-none focus:text-gray-600 ml-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {isMenuOpen && (
              <div className="md:hidden">
                <Link to="/" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">Home</Link>
                <Link to="/upload" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">Upload</Link>
                <Link to="/explorer" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">Explorer</Link>
              </div>
            )}
          </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/explorer" element={<Explorer />} />
      </Routes>
    </div>
  </Router>
</WagmiConfig>
 );
};

export default App;
export { firebaseApp };