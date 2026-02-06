
import React from 'react';
import { GameState, WorshipperType, RelicId } from '../types';
import { WORSHIPPER_DETAILS } from '../constants';
import { X, Activity, Lock, Unlock, AlertTriangle, Orbit } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { calculatePassiveIncomeByType } from '../services/gameService';

interface WorshipperModalProps {
  type: WorshipperType | null;
  count: number;
  onClose: () => void;
  imageUrl: string;
  gameState: GameState;
  toggleWorshipperLock: (type: WorshipperType) => void;
}

export const WorshipperModal: React.FC<WorshipperModalProps> = ({ type, count, onClose, imageUrl, gameState, toggleWorshipperLock }) => {
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
  const incomeByType = calculatePassiveIncomeByType(gameState.vesselLevels, gameState.relicLevels);
  const currentRate = incomeByType[type];
  const isLocked = gameState.lockedWorshippers.includes(type);

  // Calculate penalties and bonuses
  const penalty = (gameState.influenceUsage[type] || 0) * 2;
  
  let specificRelicId: RelicId = RelicId.INDOLENT_BOOST;
  if (type === WorshipperType.LOWLY) specificRelicId = RelicId.LOWLY_BOOST;
  if (type === WorshipperType.WORLDLY) specificRelicId = RelicId.WORLDLY_BOOST;
  if (type === WorshipperType.ZEALOUS) specificRelicId = RelicId.ZEALOUS_BOOST;

  const specificBonus = (gameState.relicLevels[specificRelicId] || 0) * 5;
  const globalBonus = (gameState.relicLevels[RelicId.ALL_VESSEL_BOOST] || 0) * 2;
  const totalBonus = specificBonus + globalBonus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-full max-w-md overflow-hidden rounded-xl border-2 bg-eldritch-dark shadow-[0_0_50px_rgba(0,0,0,0.9)] ${typeColor.split(' ')[1]}`}
        onClick={(e) => e.stopPropagation()} 
      >
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
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex flex-col rounded-lg bg-black/40 p-3 border border-white/5">
                    <span className="text-[10px] uppercase text-gray-500 tracking-wider">Current Count</span>
                    <span className={`font-mono text-lg font-bold ${typeColor.split(' ')[0]}`}>
                        {formatNumber(count)}
                    </span>
                </div>
                <div className="flex flex-col rounded-lg bg-black/40 p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Activity className="h-2 w-2 text-green-500" />
                        <span className="text-[10px] uppercase text-gray-500 tracking-wider">New Worshippers Rate</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-green-400">
                        +{formatNumber(currentRate)}/s
                    </span>
                </div>
            </div>

            {/* Penalties and Bonuses Breakdown */}
            <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between bg-red-950/20 p-2 rounded border border-red-900/30">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-300">Influence Penalty</span>
                    </div>
                    <div className="text-xs font-bold text-red-400">
                        +{penalty}% Cost
                    </div>
                </div>
                <div className="flex items-center justify-between bg-indigo-950/20 p-2 rounded border border-indigo-900/30">
                    <div className="flex items-center gap-2">
                        <Orbit className="h-3 w-3 text-indigo-400" />
                        <span className="text-xs text-indigo-300">Relic Bonus</span>
                    </div>
                    <div className="text-xs font-bold text-indigo-400">
                        +{totalBonus}% Output
                    </div>
                </div>
            </div>

            <div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm">
                <p>{details.lore}</p>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-xs text-gray-600 uppercase tracking-widest">
                    Sacrifice Status
                </div>
                <button 
                    onClick={() => toggleWorshipperLock(type)}
                    className={`flex items-center gap-2 rounded px-3 py-1.5 transition-colors ${isLocked ? 'bg-eldritch-crimson text-white border border-red-500' : 'bg-black/40 text-gray-400 border border-white/10 hover:bg-white/10'}`}
                >
                    {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    <span className="text-xs font-bold uppercase tracking-wider">{isLocked ? 'Locked' : 'Unlocked'}</span>
                </button>
            </div>
            {isLocked && (
                <div className="mt-4 rounded bg-red-950/40 border border-red-500/30 p-2 text-center animate-in fade-in slide-in-from-top-1">
                    <p className="text-xs text-red-300 font-bold italic">This worshipper type will NOT be sacrificed for miracles.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
