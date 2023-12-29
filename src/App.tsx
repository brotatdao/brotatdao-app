// App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Explorer from './pages/Explorer/Explorer';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from './components/useWallet'; // Update the path as necessary
import "./App.css";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE,
  authDomain: "brotatdao.firebaseapp.com",
  projectId: "brotatdao",
  storageBucket: "brotatdao.appspot.com",
  messagingSenderId: "877410774360",
  appId: "1:877410774360:web:be6b8f80aa74ae4c0bc92d",
  measurementId: "G-JK4PS0HWGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
