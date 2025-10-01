import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiwaliWelcomeScreenProps {
  onClose: () => void;
}

export const DiwaliWelcomeScreen: React.FC<DiwaliWelcomeScreenProps> = ({ onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setShow(true), 100);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 500);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #0f0520 50%, #1a0a2e 100%)'
      }}
    >
      {/* Fireworks Container */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="firework"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 hover:text-white rounded-full"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Content */}
      <div className={`relative z-10 text-center px-8 transition-all duration-700 delay-300 ${
        show ? 'scale-100 translate-y-0' : 'scale-50 translate-y-20'
      }`}>
        {/* Decorative Diyas */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="diya-large" />
          <div className="diya-large" style={{ animationDelay: '0.2s' }} />
          <div className="diya-large" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Main Greeting */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient-diwali animate-pulse-slow">
          🪔 Happy Diwali! 🪔
        </h1>

        {/* Message */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-8 border-2 border-amber-400/50 shadow-2xl max-w-2xl mx-auto">
          <p className="text-2xl md:text-3xl font-semibold text-amber-100 mb-4">
            From
          </p>
          <p className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
            Kiran Raghunath Jadhav
          </p>
          <p className="text-xl md:text-2xl text-amber-200">
            (Shree Alankar Owner)
          </p>
          
          <div className="mt-6 pt-6 border-t border-amber-400/30">
            <p className="text-lg text-amber-100/90 italic">
              May this festival of lights bring joy, prosperity, and happiness to your life! ✨
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
          className="mt-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-6 px-12 rounded-full text-lg shadow-2xl transform hover:scale-105 transition-all"
        >
          Continue to Shree Alankar
        </Button>
      </div>
    </div>
  );
};
