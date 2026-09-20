'use client';

import React, { useRef, useState, useCallback } from 'react';

export interface DepthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number | string;
  perspective?: number | string;
  style?: React.CSSProperties;
}

export function DepthCard({
  children,
  className = '',
  maxTilt = 7,
  perspective = 1400,
  style,
  ...rest
}: DepthCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false });

  const numMaxTilt = typeof maxTilt === 'string' ? parseFloat(maxTilt) || 7 : maxTilt;
  const numPerspective = typeof perspective === 'string' ? parseFloat(perspective) || 1400 : perspective;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalizing to range -1 to 1
      const normalizedX = (x - centerX) / centerX;
      const normalizedY = (y - centerY) / centerY;

      // Invert Y for standard natural 3D tilt
      const rotateX = -normalizedY * numMaxTilt;
      const rotateY = normalizedX * numMaxTilt;

      setTilt({ rotateX, rotateY, isHovered: true });
    },
    [numMaxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`.trim()}
      style={{
        perspective: `${numPerspective}px`,
        transform: `perspective(${numPerspective}px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg)`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default DepthCard;
