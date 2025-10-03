import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface DiwaliWelcomeScreenProps {
  onClose: () => void;
}

export const DiwaliWelcomeScreen: React.FC<DiwaliWelcomeScreenProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setShow(true), 100);
    
    // Auto-close after 7 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 7000);
    
    return () => clearTimeout(autoCloseTimer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 500);
  };

  const isMarathi = language === 'mr';

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #0f0520 50%, #1a0a2e 100%)'
      }}
    >
      {/* Fireworks Container - More fireworks for better effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="firework"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Close Button */}
      <Button
        onClick={handleClose}
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-white hover:bg-white/20 hover:text-white rounded-full"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Content */}
      <div className={`relative z-10 text-center px-4 sm:px-6 md:px-8 w-full max-w-4xl transition-all duration-700 delay-300 ${
        show ? 'scale-100 translate-y-0' : 'scale-50 translate-y-20'
      }`}>
        {/* Decorative Diyas */}
        <div className="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="diya-large" />
          <div className="diya-large hidden sm:block" style={{ animationDelay: '0.2s' }} />
          <div className="diya-large" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Main Greeting */}
        <h1 className={`text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 text-gradient-diwali animate-pulse-slow ${
          isMarathi ? 'font-marathi-diwali' : ''
        }`}>
          {isMarathi ? '🪔 दिवाळीच्या हार्दिक शुभेच्छा! 🪔' : '🪔 Happy Diwali! 🪔'}
        </h1>

        {/* Message */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-amber-400/50 shadow-2xl mx-auto">
          <p className={`text-lg sm:text-2xl md:text-3xl font-semibold text-amber-100 mb-2 sm:mb-4 ${
            isMarathi ? 'font-marathi-diwali' : ''
          }`}>
            {isMarathi ? 'यांच्या तर्फे' : 'From'}
          </p>
          <p className={`text-xl sm:text-3xl md:text-4xl font-bold text-yellow-300 mb-1 sm:mb-2 ${
            isMarathi ? 'font-marathi-diwali' : ''
          }`}>
            {isMarathi ? 'किरण रघुनाथ जाधव' : 'Kiran Raghunath Jadhav'}
          </p>
          <p className={`text-base sm:text-xl md:text-2xl text-amber-200 ${
            isMarathi ? 'font-marathi-diwali' : ''
          }`}>
            {isMarathi ? '(श्री अलंकार मालक)' : '(Shree Alankar Owner)'}
          </p>
          
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-amber-400/30">
            <p className={`text-sm sm:text-lg text-amber-100/90 italic ${
              isMarathi ? 'font-marathi-diwali' : ''
            }`}>
              {isMarathi 
                ? 'या दिवाळीच्या सणात तुमच्या जीवनात आनंद, समृद्धी आणि सुख यावो ही इच्छा! ✨' 
                : 'May this festival of lights bring joy, prosperity, and happiness to your life! ✨'
              }
            </p>
          </div>
        </div>

        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="sparkle-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleClose}
          className={`mt-6 sm:mt-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 sm:py-6 px-8 sm:px-12 rounded-full text-base sm:text-lg shadow-2xl transform hover:scale-105 transition-all ${
            isMarathi ? 'font-marathi-diwali' : ''
          }`}
        >
          {isMarathi ? 'श्री अलंकार वर जा' : 'Continue to Shree Alankar'}
        </Button>
      </div>
    </div>
  );
};
