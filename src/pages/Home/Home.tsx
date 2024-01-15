import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import LogoImage from '../../assets/brologo.svg';

const Home = () => {
  return (
    <div className="relative min-h-screen">
      {/* Logo Image */}
      <div className="absolute top-0 right-0 md:w-2/3 lg:w-3/4 xl:w-4/5 2xl:w-full h-full overflow-hidden z-10">
        <img src={LogoImage} alt="Logo" className="w-full h-full object-cover opacity-10" style={{ transform: 'translateX(15%) scale(1)' }} />
      </div>

      {/* Content Sections */}
      <div className="relative z-20">
        <HeroSection />
        <FeatureSection />
      </div>
    </div>
  );
};

export default Home;
