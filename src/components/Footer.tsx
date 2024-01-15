import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-zinc-200">
      <div className="container mx-auto px-5 py-6 flex justify-center md:justify-between">
        <div className="flex space-x-6 md:order-2">
          <a href="https://twitter.com/brotatdao" className="text-zinc-400 hover:text-zinc-500">
            <span className="sr-only">X</span>
            <FaXTwitter className="h-6 w-6" aria-hidden="true" />
          </a>
          {/* Add more socials here - copy a href= from above & look up icons from react-icons.github.io */}
        </div>
        <p className="mt-4 text-center text-sm text-gray-500 md:mt-0 md:order-1">
          &copy; {new Date().getFullYear()} brotatdao
        </p>
      </div>
    </footer>
  );
};

export default Footer;
