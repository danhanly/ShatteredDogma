
import React, { useEffect, useState } from 'react';
import { WorshipperType } from '../types';
import { formatNumber } from '../utils/format';
import { Crown, Frown, Ghost, Sword, Clock } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface OfflineModalProps {
  gains: Record<WorshipperType, number> | null;
  timeOffline: number; // in seconds
  onClose: () => void;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

export const OfflineModal: React.FC<OfflineModalProps> = ({ gains, timeOffline, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (gains) {
      setIsVisible(true);
    }
  }, [gains]);

  if (!gains || !isVisible) return null;

  const totalGained = (Object.values(gains) as number[]).reduce((a, b) => a + b, 0);

  // Helper to format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const handleCollect = () => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow animation to finish
  };

  return (
    <BaseModal onClose={handleCollect} zIndex={70} containerClassName="max-w-md w-full border-eldritch-gold/30" backdropClassName="bg-black/90 backdrop-blur-md">
      {/* Header */}
      <div className="bg-gradient-to-b from-eldritch-black to-eldritch-dark p-6 text-center border-b border-white/10">
          <h2 className="font-serif text-2xl text-eldritch-gold mb-1">Welcome Back</h2>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Clock className="h-4 w-4" />
              <span>You were away for {formatTime(timeOffline)}</span>
          </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
          <div className="text-center mb-6">
              <p className="text-gray-300 text-sm mb-2">While you slumbered, your vessels continued their work.</p>
              <div className="font-mono text-3xl font-bold text-white drop-shadow-lg">
                  +{formatNumber(totalGained)}
              </div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Total Souls Harvested</div>
          </div>

          <div className="space-y-2">
              {Object.entries(gains).map(([type, amount]) => {
                  const val = amount as number;
                  if (val <= 0) return null;
                  const wType = type as WorshipperType;
                  const Icon = ICON_MAP[wType];
                  
                  let typeColor = 'text-gray-400';
                  switch(wType) {
                      case WorshipperType.WORLDLY: typeColor = 'text-green-400'; break;
                      case WorshipperType.LOWLY: typeColor = 'text-gray-400'; break;
                      case WorshipperType.ZEALOUS: typeColor = 'text-red-500'; break;
                      case WorshipperType.INDOLENT: typeColor = 'text-blue-400'; break;
                  }

                  return (
                      <div key={type} className="flex items-center justify-between rounded bg-black/40 p-3 border border-white/5">
                          <div className="flex items-center gap-3">
                              <Icon className={`h-5 w-5 ${typeColor}`} />
                              <span className={`text-sm font-bold ${typeColor}`}>{type}</span>
                          </div>
                          <span className="font-mono font-bold text-white">+{formatNumber(val)}</span>
                      </div>
                  );
              })}
          </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
          <button 
              onClick={handleCollect}
              className="w-full rounded-lg border border-eldritch-gold/50 bg-gradient-to-b from-eldritch-gold/20 to-eldritch-gold/5 py-3 font-serif font-bold text-eldritch-gold transition-all hover:from-eldritch-gold/30 hover:to-eldritch-gold/10 hover:scale-[1.02] active:scale-95"
          >
              Accept Tribute
          </button>
      </div>
    </BaseModal>
  );
};
