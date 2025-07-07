
import React, { useState, useEffect } from 'react';

interface LoadingAnimationProps {
  onComplete: () => void;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setShowLogo(true), 200);
    const timer2 = setTimeout(() => setShowText(true), 800);
    const timer3 = setTimeout(() => setFadeOut(true), 2500);
    const timer4 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        {/* Logo Animation */}
        <div className={`mb-8 transition-all duration-1000 transform ${showLogo ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8'}`}>
          <img 
            src="/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png" 
            alt="Shree Alankar Logo" 
            className="w-32 h-32 mx-auto object-contain animate-pulse"
          />
        </div>

        {/* Text Animation */}
        <div className={`transition-all duration-1000 transform ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wide">
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.1s' }}>S</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.2s' }}>h</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.3s' }}>r</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.4s' }}>e</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.5s' }}>e</span>
            <span className="inline-block animate-fade-in mx-3" style={{ animationDelay: '0.6s' }}></span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.7s' }}>A</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.8s' }}>l</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.9s' }}>a</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '1.0s' }}>n</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '1.1s' }}>k</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '1.2s' }}>a</span>
            <span className="inline-block animate-fade-in" style={{ animationDelay: '1.3s' }}>r</span>
          </h1>
          <p className="text-xl text-gold-light animate-fade-in" style={{ animationDelay: '1.5s' }}>
            Gold & Silver Jewelry Shop Since 1998
          </p>
        </div>

        {/* Loading indicator */}
        <div className="mt-8">
          <div className="w-16 h-1 bg-primary/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ 
              animation: 'loading-bar 3s ease-out forwards'
            }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
