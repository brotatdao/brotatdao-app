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
import "./App.css";

const projectId = import.meta.env.VITE_WALLETCONNECT_ID;

const metadata = {
    name: 'brotatdao', 
    description: 'brotatdao',
    url: 'https://brotatdao.eth.limo',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

const App = () => {
 Auth(); 

 return (
   <WagmiConfig config={wagmiConfig}>
     <Router>
         <div>
             <nav>
                <ul>
                   <li><Link to="/">Home</Link></li>
                   <li><Link to="/upload">Upload</Link></li>
                   <li><Link to="/explorer">Explorer</Link></li>
                </ul>
             </nav>

             <ConnectButton />

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