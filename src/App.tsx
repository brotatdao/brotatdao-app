import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Explorer from './pages/Explorer/Explorer';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from './components/useWallet'; 
import "./App.css";

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (use your own configuration)
const firebaseConfig = {
  apiKey: "AIzaSyBDR4vkS-1fd0VeeyxlcGQXJNLBdYrK5zc",
  authDomain: "brotatdao.firebaseapp.com",
  projectId: "brotatdao",
  storageBucket: "brotatdao.appspot.com",
  messagingSenderId: "877410774360",
  appId: "1:877410774360:web:be6b8f80aa74ae4c0bc92d",
  measurementId: "G-JK4PS0HWGX"
};

// Initialize Firebase then Firestore
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Export Firebase services
export { firebaseApp, db };

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
