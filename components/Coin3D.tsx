import React, { useEffect, useRef, useState } from 'react';
import { CoinSide, Currency } from '../types';
import { COIN_GRADIENT_HEADS } from '../constants';

interface Coin3DProps {
  result: CoinSide;
  isFlipping: boolean;
  onFlipStart: () => void;
  currency: Currency;
}

export const Coin3D: React.FC<Coin3DProps> = ({ result, isFlipping, onFlipStart, currency }) => {
  // Current rotation in degrees
  const [rotation, setRotation] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isFlipping) {
      // Calculate new rotation
      // 1. Add significant spins (5 to 10 rotations = 1800 to 3600 degrees)
      const spins = 5 + Math.floor(Math.random() * 5);
      const spinDegrees = spins * 360;

      // 2. Determine target offset
      // If result is HEADS, we want a multiple of 360 (0).
      // If result is TAILS, we want a multiple of 360 + 180.
      const currentMod = rotation % 360;
      const targetMod = result === CoinSide.HEADS ? 0 : 180;

      // Calculate diff to reach target
      let adjustment = targetMod - currentMod;

      // Normalize adjustment to be positive to keep spinning forward
      if (adjustment < 0) adjustment += 360;

      // Final new rotation
      const newRotation = rotation + spinDegrees + adjustment;

      setRotation(newRotation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipping, result]);

  // Preload SVG images when currency changes
  useEffect(() => {
    setImagesLoaded(false);
    setImageError(false);

    const headsImg = new Image();
    const tailsImg = new Image();
    let headsLoaded = false;
    let tailsLoaded = false;

    const checkBothLoaded = () => {
      if (headsLoaded && tailsLoaded) {
        setImagesLoaded(true);
      }
    };

    headsImg.onload = () => {
      headsLoaded = true;
      checkBothLoaded();
    };

    tailsImg.onload = () => {
      tailsLoaded = true;
      checkBothLoaded();
    };

    headsImg.onerror = () => setImageError(true);
    tailsImg.onerror = () => setImageError(true);

    headsImg.src = currency.headsImage;
    tailsImg.src = currency.tailsImage;
  }, [currency]);

  return (
    <div className="relative w-64 h-64 cursor-pointer group" onClick={!isFlipping ? onFlipStart : undefined}>
      <div
        className="w-full h-full perspective-1000"
      >
        <div
          className={`w-full h-full relative transform-style-3d transition-transform duration-[3000ms] ease-out ${!isFlipping ? 'hover:scale-105 transition-transform duration-300' : ''}`}
          style={{ transform: `rotateX(${rotation}deg)` }}
        >
          {/* HEADS SIDE (Front) */}
          <div className={`absolute w-full h-full rounded-full backface-hidden shadow-[0_0_50px_rgba(234,179,8,0.4)] border-4 border-yellow-600 flex items-center justify-center overflow-hidden ${imageError || !imagesLoaded ? COIN_GRADIENT_HEADS : 'bg-slate-900'}`}>
            {imagesLoaded && !imageError ? (
              <>
                <img
                  src={currency.headsImage}
                  alt={`${currency.name} heads`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {/* Shine effect overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
              </>
            ) : (
              // Fallback to gradient with text
              <div className="w-[90%] h-[90%] rounded-full border-2 border-yellow-600/50 flex flex-col items-center justify-center p-4 border-dashed">
                <span className="text-6xl font-black text-yellow-900 drop-shadow-md">H</span>
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-yellow-800 mt-2">Heads</span>
              </div>
            )}
          </div>

          {/* TAILS SIDE (Back) */}
          <div
            className={`absolute w-full h-full rounded-full backface-hidden shadow-[0_0_50px_rgba(148,163,184,0.4)] border-4 border-slate-600 flex items-center justify-center overflow-hidden ${imageError || !imagesLoaded ? 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500' : 'bg-slate-900'}`}
            style={{ transform: 'rotateX(180deg)' }}
          >
            {imagesLoaded && !imageError ? (
              <>
                <img
                  src={currency.tailsImage}
                  alt={`${currency.name} tails`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {/* Shine effect overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
              </>
            ) : (
              // Fallback to gradient with text
              <div className="w-[90%] h-[90%] rounded-full border-2 border-slate-600/50 flex flex-col items-center justify-center p-4 border-dashed">
                <span className="text-6xl font-black text-slate-800 drop-shadow-md">T</span>
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-slate-700 mt-2">Tails</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shadow underneath */}
      <div className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-40 h-4 bg-black/30 blur-md rounded-[100%] transition-all duration-[3000ms] ${isFlipping ? 'scale-50 opacity-50' : 'scale-100 opacity-100'}`}></div>
    </div>
  );
};