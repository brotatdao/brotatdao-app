import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight text-gray-800">Welcome to Our Platform</h1>
            <p className="mt-2 text-gray-600">Explore, upload, and connect with the world of digital assets.</p>
            <Link to="/upload" className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300">Get Started</Link>
          </div>
        </div>
      </div>
  );
};

export default Home;
