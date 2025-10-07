import { useEffect, useState } from "react";
import { WordPullUp } from "@/components/ui/word-pull-up";
import advocateProfile from "@/assets/advocate-profile.jpg";
import lawOfficeBackground from "@/assets/new-law-office-background.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden bg-gradient-legal-bg">
      {/* Law Office Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${lawOfficeBackground})` }}
      ></div>
      
      {/* Main Content */}
      <div className="relative text-center z-10">
        <div className="mb-8">
          <img 
            src={advocateProfile} 
            alt="Babu Advocates - Legal Professional" 
            className={`w-52 h-52 rounded-full mx-auto shadow-glow object-cover border-4 border-white/30 transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        <div className={`space-y-6 transition-all duration-700 delay-300 ${imageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/90 px-8 py-4 rounded-lg backdrop-blur-sm border border-justice-gold/30 shadow-elegant">
            <WordPullUp
              words="BABU ADVOCATES"
              className="text-4xl font-bold bg-gradient-to-r from-justice-gold via-prestige-amber to-justice-gold bg-clip-text text-transparent tracking-wide"
              wrapperFramerProps={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.3,
                  },
                },
              }}
              framerProps={{
                hidden: { 
                  y: 30, 
                  opacity: 0,
                  rotateX: 90
                },
                show: { 
                  y: 0, 
                  opacity: 1,
                  rotateX: 0,
                  transition: { 
                    type: "spring",
                    damping: 20,
                    stiffness: 400,
                    duration: 0.6
                  }
                },
              }}
            />
          </div>
          
          <div className="bg-white/90 px-6 py-3 rounded-lg backdrop-blur-sm border border-justice-gold/30 shadow-elegant">
            <h4 className="text-2xl font-semibold bg-gradient-to-r from-legal-deep-blue via-justice-gold to-legal-deep-blue bg-clip-text text-transparent tracking-wider">
              YOUR LEGAL DOCTOR
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;