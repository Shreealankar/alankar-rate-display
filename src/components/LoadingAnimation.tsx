
import React, { useState, useEffect } from 'react';

interface LoadingAnimationProps {
  onComplete: () => void;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1500);
    const t4 = setTimeout(() => setFadeOut(true), 3500);
    const t5 = setTimeout(() => onComplete(), 4000);

    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
         style={{ background: 'radial-gradient(ellipse at center, hsl(240 10% 8%) 0%, hsl(240 10% 2%) 100%)' }}>
      
      {/* Ambient gold particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              ['--tx' as any]: `${(Math.random() - 0.5) * 100}px`,
              ['--ty' as any]: `${-50 - Math.random() * 100}px`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center">
        {/* Logo with glow */}
        <div className={`mb-8 transition-all duration-1000 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="relative inline-block">
            <img 
              src="/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png" 
              alt="Shree Alankar Logo" 
              className="w-28 h-28 mx-auto object-contain relative z-10"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
          </div>
        </div>

        {/* Brand name */}
        <div className={`transition-all duration-1000 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="text-gradient-gold">Shree Alankar</span>
          </h1>
        </div>

        {/* Tagline */}
        <div className={`transition-all duration-1000 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-muted-foreground text-lg tracking-[0.2em] uppercase font-light">
            Gold & Silver Jewelry Since 1998
          </p>
        </div>

        {/* Loading bar */}
        <div className="mt-10">
          <div className="w-48 h-[2px] bg-primary/10 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{ 
                background: 'linear-gradient(90deg, hsl(43 90% 62%), hsl(43 100% 75%))',
                animation: 'loading-bar 4s ease-out forwards',
                width: '0%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
