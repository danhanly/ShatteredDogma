
import React, { useEffect, useRef, useState } from 'react';
import { GameState, WORSHIPPER_ORDER, GemType, WorshipperType } from '../../types';
import { calculateBulkUpgrade, calculateAssistantBulkVesselBuy, calculateAssistantInterval } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { ArrowUpCircle, Sparkles, Timer, ShieldAlert, User, Info, Activity, Crown, Sword } from 'lucide-react';
import { IncrementType } from '../IncrementSelector';
import { GEM_DEFINITIONS } from '../../constants';
import { AbyssAssistantModal } from '../AbyssAssistantModal';

interface MiraclesTabProps {
  gameState: GameState;
  clickPower: number;
  increment: IncrementType;
  onUpgrade: (count: number) => void;
  onPurchaseAssistant: (count: number) => void;
  onActivateGem: (gem: GemType) => void;
  assistantUrl: string;
  highlightAssistant?: boolean;
  highlightGem?: GemType | null;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Info, 
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Info, 
};

export const MiraclesTab: React.FC<MiraclesTabProps> = ({
  gameState,
  clickPower,
  increment,
  onUpgrade,
  onPurchaseAssistant,
  onActivateGem,
  assistantUrl,
  highlightAssistant,
  highlightGem
}) => {
  const [showAssistantDetails, setShowAssistantDetails] = useState(false);
  const bulkUpgrade = calculateBulkUpgrade(gameState.miracleLevel, increment, gameState);
  const availableFunds = WORSHIPPER_ORDER.reduce((sum, t) => sum + gameState.worshippers[t], 0);
  const canAfford = availableFunds >= bulkUpgrade.cost && bulkUpgrade.count > 0;

  const isTenthLevel = gameState.miracleLevel % 10 === 0 && increment === 1;
  const buttonTitle = isTenthLevel ? 'Reach into the Abyss' : (increment === 1 ? 'Enhance' : `Enhance x${bulkUpgrade.count}`);
  const buttonSubtitle = isTenthLevel ? 'Tear open a rift for more power' : 'Sacrifice followers';

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

  const worldlyLevels = Object.entries(gameState.vesselLevels)
    .filter(([id]) => id.startsWith('WORLDLY'))
    .reduce((sum, [_, lvl]) => sum + (lvl as number), 0);

  const assistantUnlocked = gameState.totalClicks >= 100 && worldlyLevels >= 2;
  const assistantBulk = calculateAssistantBulkVesselBuy(gameState.assistantLevel, increment, gameState);
  const nextType = assistantBulk.costType || WorshipperType.WORLDLY;
  const canAffordAssistant = gameState.worshippers[nextType] >= assistantBulk.cost && assistantBulk.count > 0;
  const CostIcon = ICON_MAP[nextType] || Crown;

  const currentInterval = calculateAssistantInterval(gameState.assistantLevel);
  const currentRate = currentInterval === Infinity ? 0 : (1000 / currentInterval).toFixed(2);
  const isMaxLevel = gameState.assistantLevel >= 5;

  return (
    <div className="flex flex-col gap-6">
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
                onClick={() => onUpgrade(bulkUpgrade.count)}
                disabled={!canAfford}
                className={`group relative flex w-full items-center justify-between overflow-hidden rounded-lg border p-3 transition-all duration-300 
                    ${canAfford 
                    ? (isTenthLevel 
                        ? 'cursor-pointer border-eldritch-gold bg-gradient-to-r from-eldritch-black to-eldritch-gold/30 shadow-[0_0_20px_rgba(197,160,89,0.3)]' 
                        : 'cursor-pointer border-eldritch-crimson bg-gradient-to-r from-eldritch-black to-eldritch-blood/20') 
                    : 'cursor-not-allowed border-gray-800 bg-gray-900 opacity-50'}`}
            >
                <div className="flex items-center gap-3">
                    {isTenthLevel ? (
                        <Sparkles className={`h-6 w-6 sm:h-8 sm:w-8 text-eldritch-gold animate-pulse`} />
                    ) : (
                        <ArrowUpCircle className={`h-6 w-6 sm:h-8 sm:w-8 ${canAfford ? 'text-white' : 'text-gray-600'}`} />
                    )}
                    <div className="text-left">
                        <div className={`text-sm sm:text-base font-bold ${canAfford ? (isTenthLevel ? 'text-eldritch-gold' : 'text-white') : 'text-gray-500'}`}>{buttonTitle}</div>
                        <div className="text-[10px] sm:text-xs text-gray-400">{buttonSubtitle}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`font-mono text-base sm:text-lg font-bold ${canAfford ? (isTenthLevel ? 'text-eldritch-gold' : 'text-red-400') : 'text-gray-600'}`}>{formatNumber(bulkUpgrade.cost)}</div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500">Total Cult</div>
                </div>
            </button>
        </section>

        {assistantUnlocked && (
            <section 
                ref={assistantRef}
                className={`rounded-xl border p-3 sm:p-4 bg-eldritch-dark transition-all ${isMaxLevel ? 'border-eldritch-purple shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'border-eldritch-purple/30 shadow-[0_0_10px_rgba(147,51,234,0.1)]'} ${highlightAssistant ? 'animate-highlight-glow animate-shake' : ''}`}
            >
                <div className="flex items-center gap-3 mb-3">
                    <button 
                        onClick={() => setShowAssistantDetails(true)} 
                        className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 bg-black hover:scale-105 transition-transform overflow-hidden shadow-[0_0_10px_rgba(147,51,234,0.2)] ${isMaxLevel ? 'border-eldritch-purple' : 'border-eldritch-purple/40'}`}
                    >
                        {assistantUrl ? <img src={assistantUrl} alt="Mattelock" className="h-full w-full object-cover object-top scale-125" /> : <User className={`h-8 w-8 text-eldritch-purple opacity-40`} />}
                        <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"><Info className="h-2 w-2 text-white" /></div>
                    </button>
                    <div className="flex-1 min-w-0 flex justify-between items-start">
                        <div className="min-w-0 mr-1">
                            <h4 className="font-serif text-sm font-bold truncate text-white">Mattelock Verbinsk</h4>
                            <p className="text-[10px] text-eldritch-purple/80 truncate uppercase tracking-tight">Assistant from the Abyss</p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400">
                                <span>Rate: {currentRate} clicks/s</span>
                                {gameState.assistantLevel > 0 && <Activity className="h-3 w-3 text-purple-500 animate-pulse-fast ml-1" />}
                            </div>
                        </div>
                        {gameState.assistantLevel > 0 && <div className="shrink-0 rounded bg-black/40 px-2 py-1 border border-eldritch-purple/20"><span className="text-[10px] font-bold text-eldritch-purple">Lvl {gameState.assistantLevel}</span></div>}
                    </div>
                </div>
                {!isMaxLevel ? (
                    <button 
                        onClick={() => onPurchaseAssistant(assistantBulk.count)} 
                        disabled={!canAffordAssistant} 
                        className={`flex w-full items-center justify-between rounded px-3 py-2 transition-all ${canAffordAssistant ? 'bg-gradient-to-r from-eldritch-purple/20 to-black border border-eldritch-purple/30 hover:border-eldritch-purple/50' : 'bg-black/40 cursor-not-allowed opacity-60'}`}
                    >
                        <span className="text-xs font-bold text-gray-300">
                            {gameState.assistantLevel === 0 ? 'Recruit' : 'Upgrade'}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-sm font-bold ${!canAffordAssistant ? 'text-red-500' : 'text-eldritch-purple'}`}>
                                {formatNumber(assistantBulk.cost)}
                            </span>
                            <CostIcon className={`h-3 w-3 ${!canAffordAssistant ? 'text-red-500' : (nextType === WorshipperType.ZEALOUS ? 'text-red-500' : 'text-green-400')}`} />
                        </div>
                    </button>
                ) : (
                    <div className="flex w-full items-center justify-center rounded bg-black/40 border border-eldritch-purple/20 py-2">
                        <span className="text-xs font-serif font-bold text-eldritch-purple uppercase tracking-widest">Mastered</span>
                    </div>
                )}
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
                        const isActive = gameState.activeGem === gemKey;
                        const onCooldown = gameState.gemCooldowns[gemKey] > 0;
                        const canActivate = !gameState.activeGem && !onCooldown;
                        const isHighlighted = highlightGem === gemKey;

                        return (
                            <button
                                key={gemKey}
                                // Fix: Ensure ref assignment returns undefined to satisfy React's Ref type
                                ref={el => { gemRefs.current[gemKey] = el; }}
                                onClick={() => canActivate && onActivateGem(gemKey)}
                                disabled={!canActivate && !isActive}
                                className={`relative flex w-full flex-col gap-2 rounded-lg border-2 p-3 transition-all ${isActive ? 'bg-black animate-pulse shadow-lg' : 'bg-black/40'} ${onCooldown ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${isHighlighted ? 'animate-highlight-glow animate-shake' : ''}`}
                                style={{ borderColor: isActive ? def.color : (onCooldown ? '#333' : `${def.color}33`) }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rotate-45" style={{ backgroundColor: def.color }} />
                                        <span className="font-serif text-sm font-bold" style={{ color: isActive ? '#fff' : def.color }}>{def.name}</span>
                                    </div>
                                    {isActive ? (
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
