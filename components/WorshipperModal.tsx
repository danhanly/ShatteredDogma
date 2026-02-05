import React from 'react';
import { WorshipperType } from '../types';
import { WORSHIPPER_DETAILS } from '../constants';
import { X } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface WorshipperModalProps {
  type: WorshipperType | null;
  count: number;
  onClose: () => void;
  imageUrl: string;
}

export const WorshipperModal: React.FC<WorshipperModalProps> = ({ type, count, onClose, imageUrl }) => {
  if (!type) return null;

  const details = WORSHIPPER_DETAILS[type];

  const getTypeColor = (t: WorshipperType) => {
    switch (t) {
      case WorshipperType.WORLDLY: return 'text-green-400 border-green-900';
      case WorshipperType.LOWLY: return 'text-gray-400 border-gray-700';
      case WorshipperType.ZEALOUS: return 'text-red-500 border-red-900';
      case WorshipperType.INDOLENT: return 'text-blue-400 border-blue-900';
      default: return 'text-white border-white';
    }
  };

  const typeColor = getTypeColor(type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-full max-w-md overflow-hidden rounded-xl border-2 bg-eldritch-dark shadow-[0_0_50px_rgba(0,0,0,0.9)] ${typeColor.split(' ')[1]}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header Image - Full cover display of the worshipper art */}
        <div className="relative h-80 w-full overflow-hidden bg-black">
            <div 
                className="absolute inset-0 bg-no-repeat" 
                style={{ 
                    backgroundImage: `url('${imageUrl}')`,
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                }} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-eldritch-dark/30 to-transparent" />
            
            <button 
                onClick={onClose}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black hover:text-red-500 transition-colors z-10"
            >
                <X className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-6 z-10">
                 <h2 className={`font-serif text-3xl font-bold uppercase tracking-widest drop-shadow-md ${typeColor.split(' ')[0]}`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {type}
                 </h2>
                 <p className="text-sm text-gray-300 italic drop-shadow-md">{details.description}</p>
            </div>
        </div>

        <div className="p-6">
            <div className="mb-6 flex items-center justify-between rounded-lg bg-black/40 p-3 border border-eldritch-grey/20">
                <span className="font-serif text-gray-400">Current Count</span>
                <span className={`font-mono text-xl font-bold ${typeColor.split(' ')[0]}`}>
                    {formatNumber(count)}
                </span>
            </div>

            <div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm">
                <p>{details.lore}</p>
            </div>

            <div className="mt-8 text-center text-xs text-gray-600 uppercase tracking-widest border-t border-white/5 pt-4">
                Sacrifice Priority determined by Ritual Order
            </div>
        </div>
      </div>
    </div>
  );
};