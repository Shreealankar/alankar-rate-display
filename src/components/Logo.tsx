
import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img 
      src="/lovable-uploads/177cb67f-d365-4177-b967-ece97a39e31e.png" 
      alt="Shree Alankar Logo" 
      className={className || "h-12 w-auto"}
    />
  );
};
