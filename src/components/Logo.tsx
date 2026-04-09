
import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className="flex items-center gap-3">
      <img 
        src="/lovable-uploads/177cb67f-d365-4177-b967-ece97a39e31e.png" 
        alt="Shree Alankar Logo" 
        className={className || "h-12 w-auto"}
      />
      <div className="flex flex-col">
        <span className="font-display font-bold text-lg whitespace-nowrap text-gradient-gold leading-tight">Shree Alankar</span>
        <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Lohoner</span>
      </div>
    </div>
  );
};
