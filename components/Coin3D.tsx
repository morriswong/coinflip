import React, { useEffect, useRef, useState } from 'react';
import { CoinSide } from '../types';
import { COIN_GRADIENT_HEADS } from '../constants';

interface Coin3DProps {
  result: CoinSide;
  isFlipping: boolean;
  onFlipStart: () => void;
}

export const Coin3D: React.FC<Coin3DProps> = ({ result, isFlipping, onFlipStart }) => {
  // Current rotation in degrees
  const [rotation, setRotation] = useState(0);
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
          <div className={`absolute w-full h-full rounded-full backface-hidden ${COIN_GRADIENT_HEADS} shadow-[0_0_50px_rgba(234,179,8,0.4)] border-4 border-yellow-600 flex items-center justify-center`}>
            <div className="w-[90%] h-[90%] rounded-full border-2 border-yellow-600/50 flex flex-col items-center justify-center p-4 border-dashed">
              <span className="text-6xl font-black text-yellow-900 drop-shadow-md">H</span>
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-yellow-800 mt-2">Heads</span>
              <span className="text-[10px] text-yellow-800/60 mt-1">IN CODE WE TRUST</span>
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>
          </div>

          {/* TAILS SIDE (Back) */}
          <div
            className="absolute w-full h-full rounded-full backface-hidden bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-[0_0_50px_rgba(148,163,184,0.4)] border-4 border-slate-600 flex items-center justify-center"
            style={{ transform: 'rotateX(180deg)' }}
          >
            <div className="w-[90%] h-[90%] rounded-full border-2 border-slate-600/50 flex flex-col items-center justify-center p-4 border-dashed">
              <span className="text-6xl font-black text-slate-800 drop-shadow-md">T</span>
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-slate-700 mt-2">Tails</span>
              <span className="text-[10px] text-slate-800/60 mt-1">EST. 2024</span>
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Shadow underneath */}
      <div className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-40 h-4 bg-black/30 blur-md rounded-[100%] transition-all duration-[3000ms] ${isFlipping ? 'scale-50 opacity-50' : 'scale-100 opacity-100'}`}></div>
    </div>
  );
};