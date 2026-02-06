
import React from 'react';
import { VesselDefinition, WorshipperType, RelicId } from '../types';
import { X, User, Crown, Frown, Ghost, Sword, AlertTriangle, Orbit } from 'lucide-react';
import { calculateVesselOutput } from '../services/gameService';
import { formatNumber } from '../utils/format';

interface VesselModalProps {
  vessel: VesselDefinition | null;
  level: number;
  onClose: () => void;
  imageUrl?: string;
  relicLevels?: Record<string, number>;
  influenceUsage?: Record<WorshipperType, number>;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

export const VesselModal: React.FC<VesselModalProps> = ({ 
  vessel, 
  level, 
  onClose, 
  imageUrl, 
  relicLevels = {},
  influenceUsage = {}
}) => {
  if (!vessel) return null;

  const currentOutput = calculateVesselOutput(vessel.id, level, relicLevels);
  const nextOutput = calculateVesselOutput(vessel.id, level + 1, relicLevels);
  const TypeIcon = ICON_MAP[vessel.type];

  let typeColor = 'text-gray-400 border-gray-700 bg-gray-900';
  switch(vessel.type) {
    case WorshipperType.WORLDLY: typeColor = 'text-green-400 border-green-900 bg-green-950'; break;
    case WorshipperType.LOWLY: typeColor = 'text-gray-400 border-gray-700 bg-gray-900'; break;
    case WorshipperType.ZEALOUS: typeColor = 'text-red-500 border-red-900 bg-red-950'; break;
    case WorshipperType.INDOLENT: typeColor = 'text-blue-400 border-blue-900 bg-blue-950'; break;
  }

  // Penalty and Bonus Calculations
  const penalty = (influenceUsage[vessel.type] || 0) * 2;
  
  let specificRelicId: RelicId = RelicId.INDOLENT_BOOST;
  if (vessel.type === WorshipperType.LOWLY) specificRelicId = RelicId.LOWLY_BOOST;
  if (vessel.type === WorshipperType.WORLDLY) specificRelicId = RelicId.WORLDLY_BOOST;
  if (vessel.type === WorshipperType.ZEALOUS) specificRelicId = RelicId.ZEALOUS_BOOST;

  const specificBonus = (relicLevels[specificRelicId] || 0) * 5;
  const globalBonus = (relicLevels[RelicId.ALL_VESSEL_BOOST] || 0) * 2;
  const totalBonus = specificBonus + globalBonus;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-full max-w-md overflow-hidden rounded-xl border-2 bg-eldritch-dark shadow-[0_0_50px_rgba(0,0,0,0.9)] ${typeColor.split(' ')[1]}`}
        onClick={(e) => e.stopPropagation()} 
      >
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
            <div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm mb-6">
                <p>{vessel.lore}</p>
            </div>

            {/* Penalties and Bonuses Breakdown - Only show if > 0 */}
            {(penalty > 0 || totalBonus > 0) && (
              <div className="mb-6 space-y-2">
                  {penalty > 0 && (
                    <div className="flex items-center justify-between bg-red-950/20 p-2 rounded border border-red-900/30">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-300">Influence Penalty</span>
                        </div>
                        <div className="text-xs font-bold text-red-400">
                            +{penalty}% Cost
                        </div>
                    </div>
                  )}
                  {totalBonus > 0 && (
                    <div className="flex items-center justify-between bg-indigo-950/20 p-2 rounded border border-indigo-900/30">
                        <div className="flex items-center gap-2">
                            <Orbit className="h-3 w-3 text-indigo-400" />
                            <span className="text-xs text-indigo-300">Relic Bonus</span>
                        </div>
                        <div className="text-xs font-bold text-indigo-400">
                            +{totalBonus}% Output
                        </div>
                    </div>
                  )}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded bg-black/40 p-3 border border-white/5 text-center">
                    <div className="text-[10px] uppercase text-gray-500 tracking-wider">Current Output</div>
                    <div className="font-mono text-lg font-bold text-white">+{formatNumber(currentOutput)}/s</div>
                </div>
                <div className="rounded bg-black/40 p-3 border border-white/5 text-center">
                    <div className="text-[10px] uppercase text-gray-500 tracking-wider">Next Level</div>
                    <div className={`font-mono text-lg font-bold ${typeColor.split(' ')[0]}`}>+{formatNumber(nextOutput)}/s</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
