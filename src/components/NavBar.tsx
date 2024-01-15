import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConnectButton from './ConnectButton';
import Logo from '../assets/brologo.svg';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
        <Link to="/" className="flex items-center group">
            <img src={Logo} alt="Logo" className="h-14 w-14 mr-2 cursor-pointer group-hover:opacity-70 transition-opacity duration-300" />
            <span className="text-lg font-semibold text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200">brotatdao</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center justify-center flex-1 text-lg font-semibold">
          <Link to="/" className="text-zinc-600 hover:text-zinc-400 px-4 py-2 rounded-md transition duration-200">Home</Link>
          <Link to="/upload" className="text-zinc-600 hover:text-zinc-400 px-4 py-2 rounded-md transition duration-200">Upload</Link>
          <Link to="/explorer" className="text-zinc-600 hover:text-zinc-400 px-4 py-2 rounded-md transition duration-200">Explorer</Link>
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
        <div className="md:hidden text-lg font-semibold">
          <Link to="/" className="block px-4 py-2 text-zinc-600 hover:bg-zinc-200">Home</Link>
          <Link to="/upload" className="block px-4 py-2 text-zinc-600 hover:bg-zinc-200">Upload</Link>
          <Link to="/explorer" className="block px-4 py-2 text-zinc-600 hover:bg-zinc-200">Explorer</Link>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
