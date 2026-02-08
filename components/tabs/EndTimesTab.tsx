
import React, { useState, useEffect } from 'react';
import { GameState, RelicId, WorshipperType, FateId } from '../../types';
import { calculateSoulsEarned, calculateRelicCost } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { RELIC_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD, FATE_DEFINITIONS } from '../../constants';
import { Skull, Orbit, AlertTriangle, Sparkles, ChevronUp, Lock, Dna } from 'lucide-react';

interface EndTimesTabProps {
  gameState: GameState;
  onPrestige: () => void;
  onPurchaseRelic: (id: RelicId) => void;
  onPurchaseFate: () => void;
  endOfDaysUrl?: string;
}

export const EndTimesTab: React.FC<EndTimesTabProps> = ({ gameState, onPrestige, onPurchaseRelic, onPurchaseFate, endOfDaysUrl }) => {
  const [confirmStep, setConfirmStep] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const soulsToEarn = calculateSoulsEarned(gameState);
  
  const isUnlocked = gameState.maxWorshippersByType[WorshipperType.ZEALOUS] >= PRESTIGE_UNLOCK_THRESHOLD;
  const fateCost = Math.floor(10 * Math.pow(1.2, gameState.fatePurchases));

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const handleFateClick = () => {
    if (gameState.souls < fateCost || isSpinning) return;
    setIsSpinning(true);
    setTimeout(() => {
        onPurchaseFate();
        setIsSpinning(false);
    }, 1500);
  };

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
            <div className="h-40 w-full overflow-hidden relative bg-black flex items-center justify-center">
                <img 
                    src={endOfDaysUrl || "./public/endofdays.jpeg"} 
                    className="w-full h-full object-cover transition-all duration-1000" 
                    alt="End of Days" 
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-eldritch-dark/20 to-transparent" />
            </div>
            <div className="p-4 bg-eldritch-dark">
                <h2 className="font-serif text-xl font-bold text-white mb-2 flex items-center gap-2"><Skull className="h-5 w-5 text-indigo-400" /> Trigger The End Times</h2>
                <p className="text-xs text-gray-400 italic mb-4">"The logarithmic logic of the void demands a heavy price for divine permanence."</p>
                <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-indigo-500/20 mb-4">
                    <span className="text-gray-400 text-sm">Harvest Potential:</span>
                    <div className="flex items-center gap-2"><Orbit className="h-5 w-5 text-indigo-400" /><span className="font-mono text-xl font-bold text-indigo-300">+{formatNumber(soulsToEarn)}</span></div>
                </div>
                <button 
                  onClick={() => confirmStep === 0 ? setConfirmStep(1) : onPrestige()} 
                  className={`w-full py-4 rounded-lg font-serif font-bold uppercase tracking-widest transition-all ${soulsToEarn > 0 ? (confirmStep === 1 ? 'bg-red-700 animate-pulse text-white' : 'bg-indigo-900 hover:bg-indigo-800 text-white') : 'bg-gray-900 text-gray-500 cursor-not-allowed'}`}
                >
                  {confirmStep === 1 ? 'Confirm Apocalypse?' : 'Reset and Ascend'}
                </button>
            </div>
        </div>

        {/* Permanent Relics Section */}
        <div className="rounded-xl border border-eldritch-gold/20 bg-eldritch-dark p-4">
            <h2 className="font-serif text-lg font-bold text-eldritch-gold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5" /> Permanent Relics</h2>
            <div className="space-y-4">
                {RELIC_DEFINITIONS.map(relic => {
                    const lvl = gameState.relics[relic.id] || 0;
                    const cost = calculateRelicCost(relic.id, lvl);
                    const isMax = lvl >= relic.maxLevel;
                    const canAfford = gameState.souls >= cost && !isMax;
                    
                    const isJustPurchased = gameState.lastPurchasedRelicId === relic.id && (currentTime - gameState.lastPurchasedRelicTime < 1000);

                    return (
                        <div key={relic.id} className={`rounded-lg p-3 border transition-all duration-300 ${isJustPurchased ? 'animate-flash-gold border-eldritch-gold' : (canAfford ? 'border-eldritch-gold/30 bg-black/40' : 'border-white/5 bg-black/20 opacity-80')}`}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm font-bold ${isJustPurchased ? 'text-black' : 'text-white'}`}>{relic.name}</h4>
                                <span className={`text-[10px] font-mono ${isJustPurchased ? 'text-black font-bold' : 'text-eldritch-gold'}`}>Lvl {lvl}/{relic.maxLevel}</span>
                            </div>
                            <p className={`text-[10px] mb-3 ${isJustPurchased ? 'text-black/80 font-medium' : 'text-gray-400'}`}>{relic.description}</p>
                            {!isMax ? (
                                <button 
                                    onClick={() => onPurchaseRelic(relic.id)}
                                    disabled={!canAfford}
                                    className={`w-full py-3 px-4 rounded text-xs font-bold uppercase flex items-center justify-between transition-all active:scale-95 ${canAfford ? 'bg-eldritch-gold text-black hover:bg-yellow-600' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                >
                                    <span className="flex items-center gap-2">Forge Relic <ChevronUp className="h-3 w-3" /></span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono">{formatNumber(cost)}</span>
                                        <Orbit className={`h-3.5 w-3.5 ${canAfford ? 'text-black' : 'text-gray-600'}`} />
                                    </div>
                                </button>
                            ) : (
                                <div className="w-full py-2 rounded text-xs font-bold uppercase text-center bg-eldritch-gold/20 text-eldritch-gold border border-eldritch-gold/30">Mastered</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Fates of the Abyss Section */}
        <div className="rounded-xl border border-indigo-500/20 bg-eldritch-dark p-4 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <h2 className="font-serif text-lg font-bold text-indigo-400 mb-1 flex items-center gap-2"><Dna className="h-5 w-5" /> The Fates of the Abyss</h2>
            <p className="text-[10px] text-gray-500 italic mb-4">"The void weaves chaotic threads into your soul..."</p>
            
            <button 
                onClick={handleFateClick}
                disabled={gameState.souls < fateCost || isSpinning}
                className={`w-full p-4 rounded-lg font-serif transition-all mb-4 relative overflow-hidden group flex flex-col items-center justify-center
                    ${gameState.souls >= fateCost && !isSpinning 
                        ? 'bg-gradient-to-r from-indigo-900 to-indigo-700 border border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                        : 'bg-gray-900 border border-gray-800 text-gray-600 opacity-60 cursor-not-allowed'
                    }`}
            >
                <div className={`absolute inset-0 bg-white/10 transition-transform duration-1000 ${isSpinning ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}`} />
                
                {isSpinning ? (
                    <span className="relative z-10 font-bold uppercase tracking-widest animate-pulse text-sm">Weaving Fates...</span>
                ) : (
                    <>
                        <div className="relative z-10 flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-xl font-black">{formatNumber(fateCost)}</span>
                            <Orbit className={`h-6 w-6 ${gameState.souls >= fateCost ? 'text-indigo-200' : 'text-gray-600'}`} />
                        </div>
                        <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Discover What Fate Awaits Me</span>
                    </>
                )}
            </button>

            <div className="bg-black/40 rounded-lg p-3 border border-white/5 h-auto">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold border-b border-white/10 pb-1">Cumulative Bonuses</h4>
                <div className="grid grid-cols-1 gap-1">
                    {Object.entries(gameState.fates).length > 0 ? (
                        Object.entries(gameState.fates).sort((a,b) => a[0].localeCompare(b[0])).map(([fateId, value]) => {
                            const def = FATE_DEFINITIONS[fateId as FateId];
                            const displayValue = (value * 100).toFixed(1);
                            const isPositive = value > 0;
                            
                            const isNew = gameState.lastPurchasedFateId === fateId && (currentTime - gameState.lastPurchasedFateTime < 5000);
                            const isFlashing = gameState.lastPurchasedFateId === fateId && (currentTime - gameState.lastPurchasedFateTime < 1000);

                            return (
                                <div key={fateId} className={`flex justify-between items-center text-[10px] py-1.5 transition-all duration-1000 border-b border-white/5 last:border-0 ${isFlashing ? 'bg-eldritch-gold/30 text-white' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`${isFlashing ? 'text-white font-bold' : 'text-gray-400'}`}>{def.label}</span>
                                        {isNew && <span className="bg-eldritch-gold text-black text-[8px] px-1 rounded font-bold animate-pulse">(new)</span>}
                                    </div>
                                    <span className={`font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'} ${isFlashing ? 'text-white' : ''}`}>
                                        {isPositive ? '+' : ''}{displayValue}{def.suffix}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-[10px] text-gray-600 italic">No fates discovered yet.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
