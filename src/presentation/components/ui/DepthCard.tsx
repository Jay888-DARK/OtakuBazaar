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
}: DepthCardProps) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
}

export default DepthCard;
