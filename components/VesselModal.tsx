import React from 'react';
import { VesselDefinition, WorshipperType } from '../types';
import { X, User, Crown, Frown, Ghost, Sword } from 'lucide-react';
import { calculateVesselOutput } from '../services/gameService';

interface VesselModalProps {
  vessel: VesselDefinition | null;
  level: number;
  onClose: () => void;
  imageUrl?: string;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

export const VesselModal: React.FC<VesselModalProps> = ({ vessel, level, onClose, imageUrl }) => {
  if (!vessel) return null;

  const currentOutput = calculateVesselOutput(vessel.id, level);
  const nextOutput = calculateVesselOutput(vessel.id, level + 1);
  const TypeIcon = ICON_MAP[vessel.type];

  let typeColor = 'text-gray-400 border-gray-700 bg-gray-900';
  switch(vessel.type) {
    case WorshipperType.WORLDLY: typeColor = 'text-green-400 border-green-900 bg-green-950'; break;
    case WorshipperType.LOWLY: typeColor = 'text-gray-400 border-gray-700 bg-gray-900'; break;
    case WorshipperType.ZEALOUS: typeColor = 'text-red-500 border-red-900 bg-red-950'; break;
    case WorshipperType.INDOLENT: typeColor = 'text-blue-400 border-blue-900 bg-blue-950'; break;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-full max-w-md overflow-hidden rounded-xl border-2 bg-eldritch-dark shadow-[0_0_50px_rgba(0,0,0,0.9)] ${typeColor.split(' ')[1]}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header Image Area - Wide Format */}
        <div className="relative h-80 w-full overflow-hidden bg-black flex items-center justify-center">
            {imageUrl ? (
                <div 
                    className="absolute inset-0 bg-no-repeat" 
                    style={{ 
                        backgroundImage: `url('${imageUrl}')`,
                        backgroundSize: 'cover', 
                        backgroundPosition: 'top center' 
                    }} 
                />
            ) : (
                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black to-eldritch-dark`}>
                    <User className={`h-32 w-32 opacity-20 ${typeColor.split(' ')[0]}`} />
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-eldritch-dark/20 to-transparent" />
            
            <button 
                onClick={onClose}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black hover:text-red-500 transition-colors z-10"
            >
                <X className="h-6 w-6" />
            </button>

             <div className="absolute bottom-4 left-6 z-10">
                 <div className="flex items-center gap-2 mb-1">
                     <TypeIcon className={`h-4 w-4 ${typeColor.split(' ')[0]}`} />
                     <span className={`text-xs uppercase tracking-widest font-bold ${typeColor.split(' ')[0]}`}>{vessel.type} Vessel</span>
                 </div>
                 <h2 className={`font-serif text-3xl font-bold uppercase tracking-widest drop-shadow-md text-white`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {vessel.name}
                 </h2>
                 <p className="text-sm text-gray-300 italic drop-shadow-md">{vessel.subtitle}</p>
            </div>
        </div>

        <div className="p-6 relative">
            <div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm">
                <p>{vessel.lore}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded bg-black/40 p-3 border border-white/5 text-center">
                    <div className="text-[10px] uppercase text-gray-500 tracking-wider">Current Output</div>
                    <div className="font-mono text-lg font-bold text-white">+{currentOutput}/s</div>
                </div>
                <div className="rounded bg-black/40 p-3 border border-white/5 text-center">
                    <div className="text-[10px] uppercase text-gray-500 tracking-wider">Next Level</div>
                    <div className={`font-mono text-lg font-bold ${typeColor.split(' ')[0]}`}>+{nextOutput}/s</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};