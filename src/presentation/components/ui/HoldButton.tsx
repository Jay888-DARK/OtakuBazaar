'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface HoldButtonProps {
  children?: React.ReactNode;
  onHold?: () => void;
  holdTime?: number; // Duration in ms to trigger onHold (default 1000ms)
  backgroundColor?: string;
  fillColor?: string;
  textColor?: string;
  fillTextColor?: string;
  doneLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function HoldButton({
  children = 'HOLD TO OFFER',
  onHold,
  holdTime = 1000,
  backgroundColor = '#18181b',
  fillColor = '#f4f4f5',
  textColor = '#a1a1aa',
  fillTextColor = '#09090b',
  doneLabel = 'OFFER SENT',
  size = 'sm',
  className = '',
  disabled = false,
}: HoldButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHold = useCallback(() => {
    if (disabled || isDone) return;
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(1, elapsed / holdTime);
      setProgress(pct);

      if (pct >= 1) {
        setIsHolding(false);
        setIsDone(true);
        onHold?.();
        setTimeout(() => {
          setIsDone(false);
          setProgress(0);
        }, 1500);
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [disabled, isDone, holdTime, onHold]);

  const cancelHold = useCallback(() => {
    if (isDone) return;
    setIsHolding(false);
    startTimeRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setProgress(0);
  }, [isDone]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const sizeClasses = {
    sm: 'py-2 px-3 text-[10px]',
    md: 'py-2.5 px-4 text-xs',
    lg: 'py-3 px-5 text-sm',
  }[size];

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      onClick={() => {
        if (!isDone) {
          setIsDone(true);
          onHold?.();
          setTimeout(() => {
            setIsDone(false);
            setProgress(0);
          }, 1500);
        }
      }}
      style={{ backgroundColor }}
      className={`relative overflow-hidden select-none font-semibold uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
    >
      {/* Progress Fill Layer */}
      <div
        className="absolute inset-0 transition-all duration-75 pointer-events-none"
        style={{
          backgroundColor: fillColor,
          width: `${progress * 100}%`,
        }}
      />

      {/* Label Layer (Base Text) */}
      <span
        className="relative z-10 block transition-colors duration-150"
        style={{ color: progress > 0.5 ? fillTextColor : textColor }}
      >
        {isDone ? doneLabel : children}
      </span>
    </button>
  );
}

export default HoldButton;
