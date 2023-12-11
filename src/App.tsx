// App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Explorer from './pages/Explorer/Explorer';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from './components/useWallet'; // Update the path as necessary
import "./App.css";

const App = () => {
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
