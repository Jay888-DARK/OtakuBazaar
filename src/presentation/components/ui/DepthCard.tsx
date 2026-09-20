'use client';

import React, { useRef, useState, MouseEvent } from 'react';

interface DepthCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;     // Max tilt angle in degrees (default: 8)
  perspective?: number; // Perspective distance in px (default: 1200)
}

export function DepthCard({
  children,
  className = '',
  maxTilt = 8,
  perspective = 1200,
}: DepthCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Calculate normalized pointer position (-1 to 1) from the card center
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setRotation({
      x: -y * maxTilt * 2,
      y: x * maxTilt * 2,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 }); // Smooth snap back to level
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block w-full"
    >
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotation.x.toFixed(2)}deg) rotateY(${rotation.y.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        }}
        className={`will-change-transform ${className}`}
      >
        <div style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default DepthCard;
