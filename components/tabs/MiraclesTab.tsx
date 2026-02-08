
import React, { useEffect, useRef, useState } from 'react';
import { GameState, GemType, WorshipperType, IncrementType } from '../../types';
import { calculateBulkUpgrade, calculateAssistantInterval, calculateAssistantBulkVesselBuy } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { ArrowUpCircle, Sparkles, Timer, ShieldAlert, User, Info, Activity, Crown, Sword } from 'lucide-react';
import { IncrementSelector } from '../IncrementSelector';
import { GEM_DEFINITIONS } from '../../constants';
import { AbyssAssistantModal } from '../AbyssAssistantModal';

interface MiraclesTabProps {
  gameState: GameState;
  clickPower: number;
  increment: IncrementType;
  onSetIncrement: (val: IncrementType) => void;
  onUpgrade: () => void;
  onPurchaseAssistant: () => void;
  onToggleAssistant: () => void;
  onActivateGem: (gem: GemType) => void;
  assistantUrl: string;
  highlightAssistant?: boolean;
  highlightGem?: GemType | null;
}

export const MiraclesTab: React.FC<MiraclesTabProps> = ({
  gameState,
  clickPower,
  increment,
  onSetIncrement,
  onUpgrade,
  onPurchaseAssistant,
  onToggleAssistant,
  onActivateGem,
  assistantUrl,
  highlightAssistant,
  highlightGem
}) => {
  const [showAssistantDetails, setShowAssistantDetails] = useState(false);
  const bulkUpgrade = calculateBulkUpgrade(gameState.miracleLevel, increment, gameState);
  const canAfford = gameState.worshippers[WorshipperType.INDOLENT] >= bulkUpgrade.cost && bulkUpgrade.count > 0;

  const buttonTitle = increment === 1 ? 'Enhance' : `Enhance x${bulkUpgrade.count}`;
  const buttonSubtitle = 'Sacrifice followers';

  const gemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const assistantRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (highlightAssistant && assistantRef.current) {
        assistantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightAssistant]);

  useEffect(() => {
    if (highlightGem && gemRefs.current[highlightGem]) {
        gemRefs.current[highlightGem]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightGem]);

  // Unified Unlock Condition: 1000 Max Indolent Worshippers
  const assistantUnlocked = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 1000;
  
  const currentInterval = calculateAssistantInterval(gameState.assistantLevel);
  const intervalSeconds = currentInterval === Infinity ? 0 : (currentInterval / 1000).toFixed(3);
  const isActive = gameState.assistantActive;

  // Assistant Upgrade Logic
  const assistantBulkUpgrade = calculateAssistantBulkVesselBuy(gameState.assistantLevel, increment, gameState);
  const canAffordAssistant = gameState.worshippers[assistantBulkUpgrade.costType] >= assistantBulkUpgrade.cost && assistantBulkUpgrade.count > 0;
  
  // Dynamic icon and color based on cost type (though it is fixed to WORLDLY now)
  const AssistantCostIcon = assistantBulkUpgrade.costType === WorshipperType.WORLDLY ? Crown : Sword;
  const assistantCostColor = assistantBulkUpgrade.costType === WorshipperType.WORLDLY ? 'text-green-400' : 'text-red-500';
  
  const isAssistantMaxed = gameState.assistantLevel >= 5;

  return (
    <div className="flex flex-col gap-6">
        <IncrementSelector current={increment} onChange={onSetIncrement} />

        <section className="rounded-xl border border-eldritch-grey/20 bg-eldritch-dark p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg text-white">Dark Miracle</h3>
                <span className="text-xs text-gray-400">Lvl {gameState.miracleLevel}</span>
            </div>
            <div className="mb-3 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Power:</span>
                <span className="font-bold text-white">+{formatNumber(clickPower)} / Tap</span>
            </div>
            <button
                onClick={() => onUpgrade()}
                disabled={!canAfford}
                className={`group relative flex w-full items-center justify-between overflow-hidden rounded-lg border p-3 transition-all duration-300 
                    ${canAfford 
                    ? 'cursor-pointer border-eldritch-crimson bg-gradient-to-r from-eldritch-black to-eldritch-blood/20' 
                    : 'cursor-not-allowed border-gray-800 bg-gray-900 opacity-50'}`}
            >
                <div className="flex items-center gap-3">
                    <ArrowUpCircle className={`h-6 w-6 sm:h-8 sm:w-8 ${canAfford ? 'text-white' : 'text-gray-600'}`} />
                    <div className="text-left">
                        <div className={`text-sm sm:text-base font-bold ${canAfford ? 'text-white' : 'text-gray-500'}`}>{buttonTitle}</div>
                        <div className="text-[10px] sm:text-xs text-gray-400">{buttonSubtitle}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`font-mono text-base sm:text-lg font-bold ${canAfford ? 'text-red-400' : 'text-gray-600'}`}>{formatNumber(bulkUpgrade.cost)}</div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500">Indolent</div>
                </div>
            </button>
        </section>

        {assistantUnlocked && (
            <section 
                ref={assistantRef as any}
                className={`rounded-xl border p-3 sm:p-4 bg-eldritch-dark transition-all border-eldritch-purple/40 shadow-[0_0_15px_rgba(147,51,234,0.1)] ${highlightAssistant ? 'animate-highlight-glow animate-shake' : ''}`}
            >
                <div className="flex items-center gap-3 mb-3">
                    <button 
                        onClick={() => setShowAssistantDetails(true)} 
                        className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 bg-black hover:scale-105 transition-transform overflow-hidden shadow-[0_0_10px_rgba(147,51,234,0.2)] ${isActive ? 'border-eldritch-purple shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'border-eldritch-purple/40 grayscale'}`}
                    >
                        {assistantUrl ? <img src={assistantUrl} alt="Mattelock" className="h-full w-full object-cover object-top scale-125" /> : <User className={`h-8 w-8 text-eldritch-purple opacity-40`} />}
                        <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"><Info className="h-2 w-2 text-white" /></div>
                    </button>
                    <div className="flex-1 min-w-0 flex justify-between items-start">
                        <div className="min-w-0 mr-1">
                            <h4 className="font-serif text-sm font-bold truncate text-white">Mattelock Verbinsk</h4>
                            <p className="text-[10px] text-eldritch-purple/80 truncate uppercase tracking-tight">Assistant from the Abyss</p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400">
                                <span>Rate: Every {intervalSeconds}s</span>
                                {isActive && <Activity className="h-3 w-3 text-purple-500 animate-pulse-fast ml-1" />}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="rounded bg-black/40 px-2 py-1 border border-eldritch-purple/20">
                                <span className="text-[10px] font-bold text-eldritch-purple">Lvl {gameState.assistantLevel}</span>
                            </div>
                            <button 
                                onClick={() => onToggleAssistant()} 
                                className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-bold uppercase tracking-wider transition-all
                                ${isActive 
                                    ? 'bg-eldritch-purple/20 border-eldritch-purple text-eldritch-purple shadow-[0_0_5px_rgba(147,51,234,0.3)]' 
                                    : 'bg-black/40 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                            >
                                <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                                <span>{isActive ? 'Active' : 'Sleep'}</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <button
                        onClick={() => onPurchaseAssistant()}
                        disabled={!canAffordAssistant}
                        className={`flex w-full items-center justify-between rounded px-3 py-2.5 transition-all border ${canAffordAssistant ? 'bg-eldritch-purple/10 border-eldritch-purple/40 hover:bg-eldritch-purple/20' : 'bg-black/40 border-gray-800 opacity-60 cursor-not-allowed'}`}
                    >
                        <div className="flex items-center gap-2">
                            <ArrowUpCircle className={`h-4 w-4 ${canAffordAssistant ? 'text-eldritch-purple' : 'text-gray-600'}`} />
                            <span className={`text-xs font-bold uppercase tracking-widest ${canAffordAssistant ? 'text-white' : 'text-gray-500'}`}>
                                {isAssistantMaxed ? 'Max Level' : `Upgrade ${assistantBulkUpgrade.count > 1 ? `x${assistantBulkUpgrade.count}` : ''}`}
                            </span>
                        </div>
                         {!isAssistantMaxed && (
                             <div className="flex items-center gap-1.5">
                                 <span className={`font-mono text-sm font-bold ${canAffordAssistant ? 'text-white' : 'text-gray-500'}`}>{formatNumber(assistantBulkUpgrade.cost)}</span>
                                 <AssistantCostIcon className={`h-3 w-3 ${canAffordAssistant ? assistantCostColor : 'text-gray-600'}`} />
                            </div>
                         )}
                    </button>
                </div>
            </section>
        )}

        {gameState.unlockedGems.length > 0 && (
            <section className="rounded-xl border border-eldritch-grey/20 bg-eldritch-dark p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-eldritch-gold" />
                    <h3 className="font-serif text-lg text-white">Focus Gems</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {Object.entries(GEM_DEFINITIONS).map(([key, def]) => {
                        const gemKey = key as GemType;
                        const isUnlocked = gameState.unlockedGems.includes(gemKey);
                        if (!isUnlocked) return null;
                        const isActiveGem = gameState.activeGem === gemKey;
                        const onCooldown = gameState.gemCooldowns[gemKey] > 0;
                        const canActivate = !gameState.activeGem && !onCooldown;
                        const isHighlighted = highlightGem === gemKey;

                        return (
                            <button
                                key={gemKey}
                                ref={el => { gemRefs.current[gemKey] = el; }}
                                onClick={() => canActivate && onActivateGem(gemKey)}
                                disabled={!canActivate && !isActiveGem}
                                className={`relative flex w-full flex-col gap-2 rounded-lg border-2 p-3 transition-all ${isActiveGem ? 'bg-black animate-pulse shadow-lg' : 'bg-black/40'} ${onCooldown ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${isHighlighted ? 'animate-highlight-glow animate-shake' : ''}`}
                                style={{ borderColor: isActiveGem ? def.color : (onCooldown ? '#333' : `${def.color}33`) }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rotate-45" style={{ backgroundColor: def.color }} />
                                        <span className="font-serif text-sm font-bold" style={{ color: isActiveGem ? '#fff' : def.color }}>{def.name}</span>
                                    </div>
                                    {isActiveGem ? (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-white uppercase bg-red-900 px-2 py-0.5 rounded">
                                            <Timer className="h-3 w-3" /> {Math.ceil(gameState.activeGemTimeRemaining)}s
                                        </div>
                                    ) : onCooldown ? (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase border border-gray-700 px-2 py-0.5 rounded">
                                            <ShieldAlert className="h-3 w-3" /> Cooldown: {Math.ceil(gameState.gemCooldowns[gemKey])}s
                                        </div>
                                    ) : (
                                        <div className="text-[10px] uppercase font-bold text-gray-500">Ready</div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 text-left leading-relaxed">{(def as any).description}</p>
                            </button>
                        );
                    })}
                </div>
            </section>
        )}
        {showAssistantDetails && <AbyssAssistantModal imageUrl={assistantUrl} onClose={() => setShowAssistantDetails(false)} />}
    </div>
  );
};
