
import React, { useEffect, useRef, useState } from 'react';
import { GameState, GemType, WorshipperType, IncrementType, RelicId } from '../../types';
import { calculateBulkUpgrade, calculateAssistantInterval, calculateAssistantBulkVesselBuy, isMilestoneLevel, calculateManualClickPower } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { ArrowUpCircle, Sparkles, Timer, User, Info, Activity, Crown, CheckCircle2, Gift } from 'lucide-react';
import { IncrementSelector } from '../IncrementSelector';
import { GEM_DEFINITIONS, OBJECTIVES, VESSEL_DEFINITIONS } from '../../constants';
import { AbyssAssistantModal } from '../AbyssAssistantModal';

interface MiraclesTabProps {
  gameState: GameState;
  increment: IncrementType;
  onSetIncrement: (val: IncrementType) => void;
  onUpgrade: () => void;
  onPurchaseAssistant: () => void;
  onToggleAssistant: () => void;
  onActivateGem: (gem: GemType) => void;
  assistantUrl: string;
  highlightAssistant?: boolean;
  highlightGem?: GemType | null;
  lastGemRefresh?: { gem: GemType, timestamp: number } | null;
  gemImages?: Record<string, string>;
  onSetMattelockGem?: (gem: GemType | null) => void;
  onClaimObjective: () => void;
}

export const MiraclesTab: React.FC<MiraclesTabProps> = ({
  gameState,
  increment,
  onSetIncrement,
  onUpgrade,
  onPurchaseAssistant,
  onToggleAssistant,
  onActivateGem,
  assistantUrl,
  highlightAssistant,
  highlightGem,
  lastGemRefresh,
  gemImages,
  onSetMattelockGem,
  onClaimObjective
}) => {
  const [showAssistantDetails, setShowAssistantDetails] = useState(false);
  const [lastMilestoneTime, setLastMilestoneTime] = useState<number>(0);
  const prevCooldowns = useRef<Record<GemType, number>>(gameState.gemCooldowns);
  const [expiredCooldownGems, setExpiredCooldownGems] = useState<Record<string, number>>({});
  
  const bulkUpgrade = calculateBulkUpgrade(gameState.miracleLevel, increment, gameState);
  const canAfford = gameState.worshippers[WorshipperType.INDOLENT] >= bulkUpgrade.cost && bulkUpgrade.count > 0;

  const gemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const assistantRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const current = gameState.gemCooldowns;
    Object.keys(current).forEach(key => {
        const gem = key as GemType;
        if (prevCooldowns.current[gem] > 0 && current[gem] <= 0) {
            setExpiredCooldownGems(prev => ({ ...prev, [gem]: Date.now() }));
        }
    });
    prevCooldowns.current = current;
  }, [gameState.gemCooldowns]);

  const assistantUnlocked = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 1000;
  const mattelockGemsUnlocked = (gameState.relics[RelicId.MATTELOCKS_GEMS] || 0) > 0;
  
  const frenzyActive = gameState.frenzyTimeRemaining > 0;
  const currentInterval = calculateAssistantInterval(gameState.assistantLevel, gameState);
  const intervalSeconds = currentInterval === Infinity ? 0 : (currentInterval / 1000);
  const rateDisplay = intervalSeconds === 0 ? 'Inactive' : (intervalSeconds < 1.0 ? `${(1 / intervalSeconds).toFixed(1)} clicks/s` : `Every ${intervalSeconds.toFixed(1)}s`);

  const isActive = gameState.assistantActive;
  const isRecruited = gameState.assistantLevel > 0;
  const assistantBulkUpgrade = calculateAssistantBulkVesselBuy(gameState.assistantLevel, increment, gameState);
  const canAffordAssistant = gameState.worshippers[WorshipperType.WORLDLY] >= assistantBulkUpgrade.cost && assistantBulkUpgrade.count > 0;

  // Manual Power Calc for preview
  const nextLevelTotal = gameState.miracleLevel + bulkUpgrade.count;
  const currentManualPower = calculateManualClickPower(gameState.miracleLevel, gameState);
  const nextManualPower = calculateManualClickPower(nextLevelTotal, gameState);
  const powerDiff = nextManualPower - currentManualPower;

  // Milestone logic
  const isNextMilestone = isMilestoneLevel(gameState.miracleLevel + 1);
  const milestoneAnim = lastMilestoneTime > 0 && (Date.now() - lastMilestoneTime < 2000);

  const handleUpgrade = () => {
      let triggered = false;
      for (let i = 1; i <= bulkUpgrade.count; i++) {
          if (isMilestoneLevel(gameState.miracleLevel + i)) {
              triggered = true;
              break;
          }
      }
      if (triggered) setLastMilestoneTime(Date.now());
      onUpgrade();
  };

  return (
    <div className="flex flex-col gap-6">
        {/* Objective System */}
        {!gameState.objectivesCompletedOnce && OBJECTIVES[gameState.currentObjectiveIndex] && (
            <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-500 bg-eldritch-dark shadow-lg
                ${OBJECTIVES[gameState.currentObjectiveIndex].check(gameState) 
                    ? 'border-eldritch-gold/50 shadow-[0_0_20px_rgba(197,160,89,0.2)]' 
                    : 'border-white/10'}`}>
                
                <div className="flex items-start gap-4">
                    <div className={`rounded-full p-2 shrink-0 ${OBJECTIVES[gameState.currentObjectiveIndex].check(gameState) ? 'bg-eldritch-gold text-black animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                        {OBJECTIVES[gameState.currentObjectiveIndex].check(gameState) ? <CheckCircle2 className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-1 text-left">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 flex justify-between items-center">
                            <span>Objective {gameState.currentObjectiveIndex + 1} / {OBJECTIVES.length}</span>
                            {OBJECTIVES[gameState.currentObjectiveIndex].check(gameState) && <span className="text-eldritch-gold animate-pulse">Ready to Claim</span>}
                        </div>
                        <p className="text-sm font-medium text-white leading-tight">
                            {OBJECTIVES[gameState.currentObjectiveIndex].text}
                        </p>
                        
                        {OBJECTIVES[gameState.currentObjectiveIndex].check(gameState) ? (
                            <button 
                                onClick={onClaimObjective}
                                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-eldritch-gold py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-500 active:scale-95 transition-all shadow-lg shadow-yellow-900/20"
                            >
                                <Gift className="h-4 w-4" />
                                Claim {formatNumber(OBJECTIVES[gameState.currentObjectiveIndex].rewardAmount)} {OBJECTIVES[gameState.currentObjectiveIndex].rewardType}
                            </button>
                        ) : (
                            <div className="mt-3 flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500">
                                <Gift className="h-3 w-3" />
                                Reward: {formatNumber(OBJECTIVES[gameState.currentObjectiveIndex].rewardAmount)} {OBJECTIVES[gameState.currentObjectiveIndex].rewardType}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <IncrementSelector current={increment} onChange={onSetIncrement} />

        {/* Upgrade Button */}
        <div className="flex flex-col gap-2">
            <button 
                onClick={handleUpgrade}
                disabled={!canAfford}
                className={`relative flex items-center justify-between rounded-xl border-2 px-4 py-4 transition-all duration-200 overflow-hidden
                    ${canAfford 
                        ? 'border-eldritch-gold/50 bg-black hover:bg-eldritch-gold/10 active:scale-[0.98]' 
                        : 'border-gray-800 bg-gray-900/50 cursor-not-allowed opacity-60'}`}
            >
                {milestoneAnim && <div className="absolute inset-0 animate-flash-gold pointer-events-none z-0" />}
                
                <div className="flex items-center gap-4 z-10">
                    <div className={`rounded-full p-2 ${canAfford ? 'bg-eldritch-gold text-black' : 'bg-gray-700 text-gray-400'}`}>
                        {milestoneAnim ? <Sparkles className="h-6 w-6 animate-spin" /> : <ArrowUpCircle className="h-6 w-6" />}
                    </div>
                    <div className="text-left">
                        <div className="font-serif text-sm font-bold uppercase tracking-wider text-white">
                            {isNextMilestone ? 'Dark Miracle Ascension' : 'Enhance Dark Miracles'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Lvl {gameState.miracleLevel}</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-eldritch-gold">Lvl {nextLevelTotal}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                            <span className="text-gray-500">Power:</span>
                            <span className="font-mono text-white">{formatNumber(currentManualPower)}</span>
                            {powerDiff > 0 && <span className="font-mono text-green-400">+{formatNumber(powerDiff)}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end z-10">
                    <span className={`font-mono text-lg font-bold ${canAfford ? 'text-white' : 'text-red-500'}`}>
                        {formatNumber(bulkUpgrade.cost)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Indolent</span>
                </div>
            </button>
            {isNextMilestone && (
                <div className="text-center text-[10px] uppercase tracking-[0.2em] text-eldritch-gold/80 animate-pulse">
                    Milestone Imminent: Power × 2
                </div>
            )}
        </div>

        {/* Abyss Assistant - Vessel Style */}
        {assistantUnlocked && (
            <div ref={assistantRef} className={`relative rounded-xl border bg-eldritch-dark p-3 transition-all duration-500 ${highlightAssistant ? 'border-eldritch-gold shadow-[0_0_30px_rgba(197,160,89,0.3)] scale-[1.02]' : 'border-purple-900/40'}`}>
                {frenzyActive && <div className="absolute inset-0 animate-flash-gold z-0 pointer-events-none rounded-xl" />}

                {/* Toggle Button - Only visible if recruited */}
                {isRecruited && (
                    <div className="absolute top-3 right-3 z-20">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onToggleAssistant(); }}
                            className={`flex items-center gap-1 rounded px-2 py-1 border text-[10px] font-bold uppercase tracking-wider transition-all ${isActive ? 'bg-purple-900/50 text-purple-300 border-purple-500/50 hover:bg-purple-900' : 'bg-gray-900 text-gray-500 border-gray-700 hover:text-gray-400'}`}
                        >
                            <Activity className="h-3 w-3" />
                            {isActive ? 'Active' : 'Dormant'}
                        </button>
                    </div>
                )}
                
                <div className="flex items-center gap-3 mb-3 relative z-10">
                    <button onClick={() => setShowAssistantDetails(true)} className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-purple-500/30 bg-black hover:scale-105 transition-transform overflow-hidden group">
                         {assistantUrl ? <img src={assistantUrl} alt="Mattelock" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-purple-500" />}
                         <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"><Info className="h-2 w-2 text-white" /></div>
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                         <h4 className="font-serif text-sm font-bold text-purple-300">Mattelock Verbinsk</h4>
                         <p className="text-xs text-purple-400/60">{isRecruited ? `Level ${gameState.assistantLevel}` : 'Not Recruited'}</p>

                         {isRecruited && (
                             <div className="mt-1 flex items-center gap-3 text-[10px] uppercase tracking-wider text-gray-400">
                                <span className={`flex items-center gap-1 ${frenzyActive ? 'text-eldritch-gold animate-pulse font-bold' : ''}`}>
                                     <Timer className="h-3 w-3" />
                                     {rateDisplay}
                                </span>
                             </div>
                         )}
                    </div>
                </div>

                {/* Mattelock Gems (New Relic Feature) */}
                {mattelockGemsUnlocked && isRecruited && (
                    <div className="mb-3 px-1">
                        <p className="text-[10px] uppercase text-gray-500 mb-1.5 font-bold tracking-widest">Alignment</p>
                        <div className="flex gap-2">
                             {/* Default Button (Null) */}
                            <button
                                onClick={() => onSetMattelockGem?.(null)}
                                className={`h-8 flex-1 rounded border transition-all flex items-center justify-center ${gameState.mattelockGem === null ? 'bg-purple-900/50 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'bg-black/40 border-white/5 hover:border-white/20 text-gray-500'}`}
                                title="Default (Miracle)"
                            >
                                <Sparkles className="h-4 w-4" />
                            </button>
                            {Object.values(GemType).map(gem => {
                                const def = GEM_DEFINITIONS[gem];
                                const isSelected = gameState.mattelockGem === gem;
                                
                                // Check if this gem's worshipper type has any active vessels (level > 0)
                                const hasActiveVessels = VESSEL_DEFINITIONS
                                    .filter(v => v.type === def.type)
                                    .some(v => (gameState.vesselLevels[v.id] || 0) > 0);
                                    
                                if (!hasActiveVessels) return null;

                                return (
                                    <button 
                                        key={gem}
                                        onClick={() => onSetMattelockGem?.(gem)}
                                        className={`h-8 flex-1 rounded border transition-all flex items-center justify-center relative group
                                            ${isSelected ? 'bg-white/10 border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                        style={{ borderColor: isSelected ? def.color : undefined }}
                                    >
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: def.color, boxShadow: isSelected ? `0 0 8px ${def.color}` : 'none' }} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="space-y-1 relative z-10">
                    {gameState.assistantLevel < 5 ? (
                        <button 
                            onClick={onPurchaseAssistant}
                            disabled={!canAffordAssistant}
                            className={`flex w-full items-center justify-between rounded px-3 py-2 transition-all 
                                ${canAffordAssistant 
                                    ? 'bg-gradient-to-r from-purple-900/60 to-purple-800/60 border border-purple-500/30 hover:border-purple-400/50 text-purple-100' 
                                    : 'bg-black/40 border border-white/5 text-gray-600 cursor-not-allowed'
                                }`}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider">{isRecruited ? 'Strengthen Bond' : 'Recruit Mattelock'}</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`font-mono text-sm font-bold ${!canAffordAssistant ? 'text-red-500' : 'text-purple-200'}`}>
                                    {formatNumber(assistantBulkUpgrade.cost)}
                                </span>
                                <Crown className={`h-3 w-3 ${!canAffordAssistant ? 'text-red-500' : 'text-green-400'}`} />
                            </div>
                        </button>
                    ) : (
                        <div className="w-full text-center py-2 text-xs font-bold uppercase text-purple-500 border border-purple-900/30 rounded bg-purple-950/10">
                            Max Bond Achieved
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Focus Gems */}
        {gameState.unlockedGems.length > 0 && (
            <div className="space-y-3">
                <h3 className="font-serif text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">Focus Gems</h3>
                <div className="grid grid-cols-2 gap-3">
                    {gameState.unlockedGems.map(gem => {
                        const def = GEM_DEFINITIONS[gem];
                        const isActive = gameState.activeGem === gem;
                        const isOnCooldown = gameState.gemCooldowns[gem] > 0;
                        const isGlobalActive = !!gameState.activeGem;
                        
                        const cooldown = gameState.gemCooldowns[gem];
                        const remaining = gameState.activeGemTimeRemaining;
                        
                        // Just refreshed animation
                        const justRefreshed = lastGemRefresh && lastGemRefresh.gem === gem && (Date.now() - lastGemRefresh.timestamp < 1000);
                        const justExpired = expiredCooldownGems[gem] && (Date.now() - expiredCooldownGems[gem] < 1000);
                        const isHighlighted = highlightGem === gem;

                        const imageSrc = gemImages?.[gem] || def.image;

                        return (
                            <button
                                key={gem}
                                ref={(el) => { gemRefs.current[gem] = el; }}
                                onClick={() => onActivateGem(gem)}
                                disabled={isGlobalActive || isOnCooldown}
                                className={`relative h-24 overflow-hidden rounded-lg border transition-all duration-300 group
                                    ${isActive 
                                        ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-1 ring-white' 
                                        : (isOnCooldown ? 'border-gray-800 bg-gray-900/50 opacity-60' : 'border-gray-700 bg-black/40 hover:border-gray-500')}
                                    ${justRefreshed || justExpired ? 'animate-flash-gold' : ''}
                                    ${isHighlighted ? 'animate-glow-out' : ''}
                                `}
                            >
                                <img src={imageSrc} className={`absolute inset-0 h-full w-full object-cover object-top origin-top transition-transform duration-700 ${isActive ? 'scale-150 blur-sm' : 'grayscale group-hover:grayscale-0 scale-125'}`} alt={def.name} />
                                <div className={`absolute inset-0 bg-gradient-to-t ${isActive ? 'from-black/80 via-black/40 to-transparent' : 'from-black/90 via-black/60 to-black/30'}`} />
                                
                                {isActive && (
                                    <div className="absolute top-0 left-0 h-1 bg-white animate-progress" style={{ animationDuration: '30s' }} />
                                )}

                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                                    {isActive ? (
                                        <>
                                            <span className="font-serif text-lg font-bold text-white drop-shadow-md animate-pulse">{Math.ceil(remaining)}s</span>
                                            <span className="text-[9px] uppercase tracking-widest text-gray-300">Active</span>
                                        </>
                                    ) : isOnCooldown ? (
                                        <>
                                            <span className="font-mono text-lg font-bold text-gray-400">{Math.ceil(cooldown)}s</span>
                                            <span className="text-[9px] uppercase tracking-widest text-gray-500">Recharging</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="font-serif text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" style={{ color: def.color }}>{def.name.split(' ')[0]}</div>
                                            <div className="text-[8px] leading-tight text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{def.description}</div>
                                        </>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {showAssistantDetails && <AbyssAssistantModal onClose={() => setShowAssistantDetails(false)} imageUrl={assistantUrl} />}
    </div>
  );
};
