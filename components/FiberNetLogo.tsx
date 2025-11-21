
import React from 'react';

interface FiberNetLogoProps {
  className?: string;
}

const FiberNetLogo: React.FC<FiberNetLogoProps> = ({ className = '' }) => {
  const imageUrl = "https://images.unsplash.com/vector-1763660435338-9a2924075279?q=80&w=2098&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  return (
    <img 
      src={imageUrl} 
      alt="Fiber.Net Logo" 
      className={`h-8 w-auto object-contain ${className}`} 
      loading="lazy"
      width="2098" // Original width from Unsplash URL
      height="450" // Approximated height based on aspect ratio
    />
  );
};

export default FiberNetLogo;