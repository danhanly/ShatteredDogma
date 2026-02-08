
import React, { useState } from 'react';
import { GameState, RelicId, WorshipperType } from '../../types';
import { calculateSoulsEarned, calculateRelicCost } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { RELIC_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD } from '../../constants';
import { Skull, Orbit, AlertTriangle, Sparkles, ChevronUp, Lock } from 'lucide-react';

interface EndTimesTabProps {
  gameState: GameState;
  onPrestige: () => void;
  onPurchaseRelic: (id: RelicId) => void;
}

export const EndTimesTab: React.FC<EndTimesTabProps> = ({ gameState, onPrestige, onPurchaseRelic }) => {
  const [confirmStep, setConfirmStep] = useState(0);
  const soulsToEarn = calculateSoulsEarned(gameState);
  
  const isUnlocked = gameState.maxWorshippersByType[WorshipperType.ZEALOUS] >= PRESTIGE_UNLOCK_THRESHOLD;

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="relative">
          <Orbit className="h-24 w-24 text-gray-800 animate-pulse-slow" />
          <Lock className="absolute inset-0 m-auto h-8 w-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-white uppercase tracking-widest mb-2">The Cycle is Not Yet Full</h2>
          <p className="max-w-xs text-sm text-gray-500 italic">
            "The Abyss only acknowledges the fire of true devotion. Amass at least 1 Zealous worshipper to begin the ritual of ascension."
          </p>
        </div>
        <div className="rounded-lg bg-indigo-950/20 border border-indigo-500/20 px-6 py-3">
          <span className="text-xs uppercase tracking-tighter text-gray-400">Requirement: </span>
          <span className="font-mono text-sm font-bold text-red-500">1 Zealous Worshipper</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
        {/* Prestige Section */}
        <div className="relative w-full rounded-xl overflow-hidden border border-indigo-900/50 shadow-[0_0_30px_rgba(49,46,129,0.3)]">
            <div className="p-4 bg-eldritch-dark">
                <h2 className="font-serif text-xl font-bold text-white mb-2 flex items-center gap-2"><Skull className="h-5 w-5 text-indigo-400" /> Trigger The End Times</h2>
                <p className="text-xs text-gray-400 italic mb-4">"The logarithmic logic of the void demands a heavy price for divine permanence."</p>
                <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-indigo-500/20 mb-4">
                    <span className="text-gray-400 text-sm">Souls to Harvest:</span>
                    <div className="flex items-center gap-2"><Orbit className="h-5 w-5 text-indigo-400" /><span className="font-mono text-xl font-bold text-indigo-300">+{formatNumber(soulsToEarn)}</span></div>
                </div>
                <button 
                  onClick={() => confirmStep === 0 ? setConfirmStep(1) : onPrestige()} 
                  className={`w-full py-4 rounded-lg font-serif font-bold uppercase tracking-widest transition-all ${soulsToEarn > 0 ? (confirmStep === 1 ? 'bg-red-700 animate-pulse' : 'bg-indigo-900 hover:bg-indigo-800') : 'bg-gray-900 text-gray-500 cursor-not-allowed'}`}
                >
                  {confirmStep === 1 ? 'Confirm Apocalypse?' : 'Reset and Ascend'}
                </button>
            </div>
        </div>

        {/* Relics Section */}
        <div className="rounded-xl border border-eldritch-gold/20 bg-eldritch-dark p-4">
            <h2 className="font-serif text-lg font-bold text-eldritch-gold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5" /> Permanent Relics</h2>
            <div className="space-y-4">
                {RELIC_DEFINITIONS.map(relic => {
                    const lvl = gameState.relics[relic.id] || 0;
                    const cost = calculateRelicCost(relic.id, lvl);
                    const isMax = lvl >= relic.maxLevel;
                    const canAfford = gameState.souls >= cost && !isMax;

                    return (
                        <div key={relic.id} className={`rounded-lg p-3 border ${canAfford ? 'border-eldritch-gold/30 bg-black/40' : 'border-white/5 bg-black/20 opacity-80'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-bold text-white">{relic.name}</h4>
                                <span className="text-[10px] font-mono text-eldritch-gold">Lvl {lvl}/{relic.maxLevel}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mb-3">{relic.description}</p>
                            {!isMax ? (
                                <button 
                                    onClick={() => onPurchaseRelic(relic.id)}
                                    disabled={!canAfford}
                                    className={`w-full py-2 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${canAfford ? 'bg-eldritch-gold text-black' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                >
                                    Purchase for {formatNumber(cost)} Souls <ChevronUp className="h-3 w-3" />
                                </button>
                            ) : (
                                <div className="w-full py-2 rounded text-xs font-bold uppercase text-center bg-eldritch-gold/20 text-eldritch-gold border border-eldritch-gold/30">Mastered</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
