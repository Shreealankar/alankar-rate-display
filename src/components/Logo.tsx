
import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 3L4 9L4 21L20 21L20 9L12 3Z" />
      <path d="M10 12L8 17H16L14 12L12 15L10 12Z" />
      <circle cx="12" cy="7" r="1" fill="currentColor" />
    </svg>
  );
};
