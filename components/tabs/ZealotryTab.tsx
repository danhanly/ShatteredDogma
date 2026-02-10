
import React from 'react';
import { GameState, ZealotryId, WorshipperType, RelicId } from '../../types';
import { ZEALOTRY_DEFINITIONS } from '../../constants';
import { formatNumber } from '../../utils/format';
import { Flame, Clock, Sword, Lock, ToggleLeft, ToggleRight } from 'lucide-react';

interface ZealotryTabProps {
  gameState: GameState;
  onActivate: (id: ZealotryId) => void;
  onToggleAuto: (id: ZealotryId) => void;
  isUnlocked: boolean;
}

export const ZealotryTab: React.FC<ZealotryTabProps> = ({ gameState, onActivate, onToggleAuto, isUnlocked }) => {
  
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center h-full">
        <div className="relative">
          <Flame className="h-24 w-24 text-gray-800 animate-pulse-slow" />
          <Lock className="absolute inset-0 m-auto h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-white uppercase tracking-widest mb-4">The Flame is Cold</h2>
          <p className="max-w-xs text-sm text-gray-400 italic mx-auto leading-relaxed">
            "Only those who have tasted the fire of Zeal may command it. Recruit your first Zealous worshipper to unlock these powers."
          </p>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const hasFuryRelic = (gameState.relics[RelicId.FURY_OF_ZEALOUS] || 0) > 0;

  return (
    <div className="flex flex-col gap-4">
       <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl text-center">
            <h3 className="font-serif text-lg text-red-500 uppercase tracking-widest mb-1">Fanatical Decrees</h3>
            <p className="text-xs text-gray-400 italic">Expend your Zealous followers to enforce temporary mandates.</p>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {ZEALOTRY_DEFINITIONS.map(def => {
             const activeUntil = gameState.zealotryActive[def.id] || 0;
             const isActive = activeUntil > now;
             const timeLeft = Math.max(0, (activeUntil - now) / 1000);
             const canAfford = gameState.worshippers[WorshipperType.ZEALOUS] >= def.cost;
             const isAuto = gameState.zealotryAuto[def.id];

             return (
                 <div key={def.id} className={`relative rounded-xl border p-3 transition-all duration-300 ${isActive ? 'bg-red-950/30 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-eldritch-dark border-red-900/30'}`}>
                     <div className="flex justify-between items-start mb-2">
                         <div className="flex-1">
                             <h4 className={`font-serif text-sm font-bold uppercase ${isActive ? 'text-red-400' : 'text-gray-300'}`}>{def.name}</h4>
                             <p className="text-[10px] text-gray-500 italic mt-0.5">{def.flavor}</p>
                         </div>
                         {hasFuryRelic && (
                             <button 
                                onClick={() => onToggleAuto(def.id)}
                                className={`ml-2 transition-colors ${isAuto ? 'text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                                title="Toggle Auto-Renew (Fury of the Zealous)"
                             >
                                 {isAuto ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                             </button>
                         )}
                     </div>

                     <div className="bg-black/40 rounded p-2 mb-3 border border-white/5">
                         <p className="text-xs font-bold text-white text-center">{def.description}</p>
                     </div>

                     <div className="flex items-center gap-2">
                        {isActive ? (
                            <div className="flex-1 flex items-center justify-center gap-2 bg-red-900/20 border border-red-500/50 rounded py-2 text-red-300 font-mono text-sm font-bold animate-pulse">
                                <Clock className="h-4 w-4" />
                                {timeLeft.toFixed(1)}s
                            </div>
                        ) : (
                            <button 
                                onClick={() => onActivate(def.id)}
                                disabled={!canAfford}
                                className={`flex-1 flex items-center justify-between px-3 py-2 rounded border transition-all 
                                    ${canAfford 
                                        ? 'bg-gradient-to-r from-red-900 to-red-800 border-red-700 text-white hover:bg-red-700' 
                                        : 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed opacity-60'}`}
                            >
                                <span className="text-xs font-bold uppercase">Enact Decree</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-mono text-sm font-bold">{formatNumber(def.cost)}</span>
                                    <Sword className="h-3 w-3" />
                                </div>
                            </button>
                        )}
                     </div>
                 </div>
             );
          })}
       </div>
    </div>
  );
};
