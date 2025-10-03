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
        background: 'radial-gradient(ellipse at center, #2d1810 0%, #1a0f0a 50%, #0a0505 100%)'
      }}
    >
      {/* Sky Shot Fireworks Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="skyshot"
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: '0',
              animationDelay: `${Math.random() * 3}s`,
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
        <div className="flex justify-center gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="diya-large animate-float" />
          <div className="diya-large animate-float hidden sm:block" style={{ animationDelay: '0.3s' }} />
          <div className="diya-large animate-float" style={{ animationDelay: '0.6s' }} />
        </div>

        {/* Main Greeting */}
        <h1 className={`text-4xl sm:text-6xl md:text-8xl font-bold mb-3 sm:mb-5 animate-pulse-slow ${
          isMarathi ? 'font-marathi-diwali' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #ff8c00 50%, #ff6347 75%, #ffd700 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease infinite, pulse-slow 2s ease-in-out infinite'
        }}>
          {isMarathi ? '🪔 दिवाळीच्या हार्दिक शुभेच्छा! 🪔' : '🪔 Happy Diwali! 🪔'}
        </h1>

        {/* Message Card */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-red-900/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-amber-500/60 shadow-2xl mx-auto max-w-2xl">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-yellow-400 rounded-tl-2xl"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-yellow-400 rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-yellow-400 rounded-bl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-yellow-400 rounded-br-2xl"></div>
          
          <p className={`text-xl sm:text-3xl md:text-4xl font-semibold text-amber-200 mb-3 sm:mb-4 ${
            isMarathi ? 'font-marathi-diwali' : ''
          }`}>
            {isMarathi ? 'यांच्या तर्फे शुभेच्छा' : 'Warm Wishes From'}
          </p>
          <p className={`text-2xl sm:text-4xl md:text-5xl font-bold text-yellow-300 mb-2 sm:mb-3 ${
            isMarathi ? 'font-marathi-diwali' : ''
          }`}
          style={{
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 140, 0, 0.5)'
          }}>
            {isMarathi ? 'किरण रघुनाथ जाधव' : 'Kiran Raghunath Jadhav'}
          </p>
          <p className={`text-lg sm:text-2xl md:text-3xl text-orange-200 mb-4 sm:mb-6 ${
            isMarathi ? 'font-marathi-diwali' : ''
          }`}>
            {isMarathi ? '(श्री अलंकार मालक)' : '(Shree Alankar Owner)'}
          </p>
          
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-amber-400/40">
            <p className={`text-base sm:text-xl md:text-2xl text-amber-100 leading-relaxed ${
              isMarathi ? 'font-marathi-diwali' : ''
            }`}>
              {isMarathi 
                ? 'या दिवाळीच्या पावन सणाच्या निमित्ताने तुम्हा सर्वांना आणि तुमच्या कुटुंबाला आनंद, समृद्धी, सुख आणि शांती लाभो ही मनःपूर्वक शुभेच्छा! ✨' 
                : 'May this auspicious festival of Diwali bring abundant joy, prosperity, peace, and happiness to you and your family! ✨'
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
          className={`mt-6 sm:mt-8 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-5 sm:py-7 px-10 sm:px-16 rounded-full text-lg sm:text-xl shadow-2xl transform hover:scale-110 transition-all border-2 border-yellow-400/50 ${
            isMarathi ? 'font-marathi-diwali' : ''
          }`}
          style={{
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 140, 0, 0.4)'
          }}
        >
          {isMarathi ? '✨ श्री अलंकार वर जा ✨' : '✨ Enter Shree Alankar ✨'}
        </Button>
      </div>
    </div>
  );
};
