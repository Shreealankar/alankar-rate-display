import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

export const DiwaliBanner: React.FC = () => {
  const { language } = useLanguage();

  const diwaliMessages = {
    en: {
      greeting: 'Happy Diwali!',
      wish: 'May this festival of lights bring prosperity and joy',
    },
    mr: {
      greeting: 'दिवाळीच्या हार्दिक शुभेच्छा!',
      wish: 'या प्रकाशाच्या सणात तुमच्या जीवनात समृद्धी आणि आनंद येवो',
    },
  };

  const message = diwaliMessages[language as keyof typeof diwaliMessages] || diwaliMessages.en;

  return (
    <div className="diwali-banner bg-gradient-to-r from-amber-900 via-orange-800 to-red-900 text-white py-3 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.3),transparent_50%)]"></div>
      </div>
      <div className="relative z-10 flex items-center justify-center gap-3 flex-wrap">
        <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
        <div className="text-center">
          <h2 className="text-lg md:text-xl font-bold">{message.greeting}</h2>
          <p className="text-xs md:text-sm opacity-90 mt-1">{message.wish}</p>
        </div>
        <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
    </div>
  );
};
