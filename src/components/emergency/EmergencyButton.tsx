import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { audioAlerts } from '../../services/api';

interface EmergencyButtonProps {
  onTrigger?: () => void;
  size?: 'normal' | 'large';
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onTrigger, size = 'large' }) => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (tapCount === 1) {
      audioAlerts.playBeep(440, 'sine', 0.1);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setTapCount(0);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(3);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [tapCount]);

  const handleClick = () => {
    if (tapCount === 0) {
      setTapCount(1);
    } else if (tapCount === 1) {
      // Confirmed double tap!
      audioAlerts.playEmergencySiren();
      setTapCount(2);
      setTimeout(() => {
        if (onTrigger) {
          onTrigger();
        } else {
          navigate('/report?instantSos=true');
        }
      }, 300);
    }
  };

  const isLarge = size === 'large';

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative group cursor-pointer" onClick={handleClick}>
        {/* Outer glowing pulsing aura */}
        <div
          className={`absolute inset-0 rounded-full bg-red-600 blur-2xl opacity-40 group-hover:opacity-75 transition-opacity ${
            tapCount === 1 ? 'animate-ping opacity-80' : 'animate-pulse'
          }`}
        />

        {/* Concentric safety ring */}
        <div
          className={`relative rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 active:scale-95 ${
            isLarge ? 'w-44 h-44 sm:w-52 sm:h-52' : 'w-32 h-32'
          } ${
            tapCount === 1
              ? 'bg-gradient-to-tr from-amber-600 via-red-600 to-rose-600 ring-8 ring-amber-400/50 shadow-[0_0_60px_rgba(245,158,11,0.6)]'
              : 'bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 ring-8 ring-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.5)] group-hover:shadow-[0_0_70px_rgba(239,68,68,0.8)]'
          }`}
        >
          {/* Inner Button Core */}
          <div className="w-[82%] h-[82%] rounded-full bg-gradient-to-b from-red-950 via-[#150a0f] to-[#070a12] border-2 border-red-500/40 flex flex-col items-center justify-center text-center p-3">
            {tapCount === 1 ? (
              <>
                <AlertOctagon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-bounce mb-1" />
                <span className="text-xs sm:text-sm font-black uppercase text-amber-300 tracking-wider">
                  TAP TO CONFIRM
                </span>
                <span className="text-[11px] font-mono text-amber-400 font-bold mt-0.5">
                  ({countdown}s window)
                </span>
              </>
            ) : tapCount === 2 ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-spin mb-1" />
                <span className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-widest">
                  TRANSMITTING
                </span>
              </>
            ) : (
              <>
                <Siren className="w-10 h-10 sm:w-14 sm:h-14 text-white animate-pulse mb-1 group-hover:text-red-400 transition-colors" />
                <span className="text-2xl sm:text-3xl font-black text-white tracking-widest font-sans drop-shadow-md">
                  SOS
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-red-300/80 font-bold">
                  EMERGENCY PANIC
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Safety advisory under button */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          {tapCount === 1 ? (
            <span className="text-amber-400 font-bold animate-pulse">
              ⚠️ Safety Lock Disengaged — Tap again to dispatch emergency response immediately
            </span>
          ) : (
            'Double-tap protected to avoid accidental triggers • Instant GPS lock'
          )}
        </p>
      </div>
    </div>
  );
};
