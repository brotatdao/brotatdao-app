import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-6 md:px-12 py-12">
      <div className="flex items-center justify-center h-full">
        {/* Content */}
        <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 text-left">
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight text-zinc-800 mb-6">what it do?</h1>
          <p className="text-lg md:text-xl text-zinc-700 mb-4">Sweet NFT bro. But what it do?</p>
          <p className="text-lg md:text-xl text-zinc-700 mb-6">Give your NFT a story. Welcome to brotatdao where it do what it dao.</p>
          <div className="pt-4"> {/* Additional padding above the button */}
            <Link to="/upload" className="inline-block bg-zinc-400 text-white px-6 py-3 rounded-full hover:bg-zinc-500 transition duration-300">Get Started</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
