import React, { useState } from 'react';
import { GameState, WorshipperType, VesselDefinition, IncrementType, VesselId, WORSHIPPER_ORDER } from '../../types';
import { calculateBulkVesselBuy, calculateVesselOutput, calculateVesselEfficiency, calculateSingleVesselConsumption, isMilestoneLevel, calculateMilestoneMultiplier } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { Crown, Frown, Ghost, Sword, User, Info, Activity, ZapOff, AlertTriangle, Utensils, Lock, Unlock, ChevronUp } from 'lucide-react';
import { IncrementSelector } from '../IncrementSelector';

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV'
};

interface VesselsTabProps {
  gameState: GameState;
  vesselsUnlocked: boolean;
  visibleVessels: VesselDefinition[];
  increment: IncrementType;
  onSetIncrement: (val: IncrementType) => void;
  vesselImages: Record<string, string>;
  onPurchaseVessel: (id: string) => void;
  onSelectVessel: (vessel: VesselDefinition) => void;
  onToggleAllVessels: (caste: WorshipperType, imprison: boolean) => void;
}

export const VesselsTab: React.FC<VesselsTabProps> = ({
  gameState, vesselsUnlocked, visibleVessels, increment, onSetIncrement,
  vesselImages, onPurchaseVessel, onSelectVessel, onToggleAllVessels
}) => {
  const [lastMilestoneUpgrades, setLastMilestoneUpgrades] = useState<Record<string, number>>({});

  if (!vesselsUnlocked) return null;
  
  const handlePurchase = (id: string, currentLevel: number, bulkCount: number) => {
    let triggered = false;
    for (let i = 1; i <= bulkCount; i++) {
        if (isMilestoneLevel(currentLevel + i)) {
            triggered = true;
            break;
        }
    }

    if (triggered) {
        setLastMilestoneUpgrades(prev => ({ ...prev, [id]: Date.now() }));
    }
    onPurchaseVessel(id);
  };

  const groupedVessels = WORSHIPPER_ORDER.map(type => ({
    type,
    vessels: visibleVessels.filter(v => v.type === type)
  })).filter(group => group.vessels.length > 0);

  return (
    <div className="flex flex-col gap-6">
        <IncrementSelector current={increment} onChange={onSetIncrement} />

        {groupedVessels.map((group) => {
          const casteColorClass = group.type === WorshipperType.WORLDLY ? 'text-green-400 border-green-900/50' : 
                                 group.type === WorshipperType.ZEALOUS ? 'text-red-500 border-red-900/50' : 
                                 group.type === WorshipperType.INDOLENT ? 'text-blue-400 border-blue-900/50' : 
                                 'text-gray-400 border-gray-700/50';
          const CasteIcon = ICON_MAP[group.type];
          
          const activeVessels = group.vessels.filter(v => gameState.vesselLevels[v.id] > 0);
          const hasImprisonedVessel = activeVessels.some(v => gameState.vesselToggles[v.id]);
          const hasAnyActive = activeVessels.length > 0;
          
          const canImprisonCaste = !group.vessels.every(v => v.isGenerator);

          return (
            <div key={group.type} className="flex flex-col gap-3">
              <div className={`flex items-center justify-between border-b py-1 mb-1 font-serif text-[10px] font-bold uppercase tracking-[0.25em] ${casteColorClass}`}>
                <div className="flex items-center gap-2">
                    <CasteIcon className="h-3 w-3" />
                    <span>{group.type} Vessels</span>
                </div>
                {hasAnyActive && canImprisonCaste && (
                    <button 
                        onClick={() => onToggleAllVessels(group.type, !hasImprisonedVessel)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] transition-colors border ${hasImprisonedVessel ? 'bg-green-900/30 text-green-400 border-green-500/30 hover:bg-green-900/50' : 'bg-red-900/30 text-red-400 border-red-500/30 hover:bg-red-900/50'}`}
                    >
                        {hasImprisonedVessel ? <Unlock className="h-2 w-2" /> : <Lock className="h-2 w-2" />}
                        {hasImprisonedVessel ? 'Release All' : 'Imprison All'}
                    </button>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {group.vessels.map((vessel) => {
                    const level = gameState.vesselLevels[vessel.id] || 0;
                    const bulkVessel = calculateBulkVesselBuy(vessel.id, level, increment, gameState);
                    const efficiency = calculateVesselEfficiency(gameState, vessel.id as VesselId);
                    
                    const actualOutput = calculateVesselOutput(vessel.id, level, gameState);
                    const consumption = calculateSingleVesselConsumption(gameState, vessel.id as VesselId, level);
                    
                    const nextLevelTotal = level + bulkVessel.count;
                    const nextOutput = calculateVesselOutput(vessel.id, nextLevelTotal, gameState);
                    const nextConsumption = calculateSingleVesselConsumption(gameState, vessel.id as VesselId, nextLevelTotal);
                    
                    const prodDelta = nextOutput - actualOutput;
                    const consDelta = nextConsumption && consumption ? nextConsumption.amount - consumption.amount : (nextConsumption?.amount || 0);

                    const isStarving = efficiency < 1.0 && level > 0 && !gameState.vesselToggles[vessel.id];
                    
                    const canBuy = gameState.worshippers[bulkVessel.costType] >= bulkVessel.cost && bulkVessel.count > 0;
                    const CostIcon = ICON_MAP[bulkVessel.costType];
                    const typeColor = vessel.type === WorshipperType.WORLDLY ? 'text-green-400 border-green-900' : 
                                     vessel.type === WorshipperType.ZEALOUS ? 'text-red-500 border-red-900' : 
                                     vessel.type === WorshipperType.INDOLENT ? 'text-blue-400 border-blue-900' : 
                                     'text-gray-400 border-gray-700';

                    const imprisoned = gameState.vesselToggles[vessel.id];
                    const isNextMilestone = isMilestoneLevel(level + 1);

                    const milestoneAnim = lastMilestoneUpgrades[vessel.id];
                    const isAnimating = milestoneAnim && (Date.now() - milestoneAnim < 2000);

                    const higherTierUnlocked = group.vessels.some(v => v.tier > vessel.tier && gameState.vesselLevels[v.id] > 0);
                    const useSlimDesign = higherTierUnlocked;

                    if (useSlimDesign) {
                        return (
                            <div key={vessel.id} 
                                onClick={() => imprisoned && onSelectVessel(vessel)}
                                className={`relative flex items-center gap-3 rounded-lg border bg-eldritch-dark p-2 transition-all ${typeColor.split(' ')[1]} ${imprisoned ? 'opacity-60 grayscale cursor-pointer' : ''}`}
                            >
                                <div 
                                    onClick={(e) => { e.stopPropagation(); onSelectVessel(vessel); }}
                                    className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded bg-black/50 border border-white/10 font-serif font-bold text-eldritch-gold cursor-pointer hover:bg-black/80 hover:scale-105 transition-all shadow-md overflow-hidden"
                                >
                                    {isAnimating && <div className="absolute inset-0 animate-flash-gold z-0" />}
                                    <span className="relative z-10">{ROMAN_NUMERALS[vessel.tier]}</span>
                                    {isAnimating && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                                            <span className="animate-x2-pop font-black text-eldritch-gold text-lg">X2</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-serif text-xs font-bold truncate ${typeColor.split(' ')[0]}`}>{vessel.name}</h4>
                                        {level > 0 && <span className="text-[9px] font-bold text-gray-500 bg-black/40 px-1 rounded">Lvl {level}</span>}
                                        {imprisoned && <span className="text-[9px] font-bold text-red-500 uppercase flex items-center gap-0.5"><Lock className="h-2 w-2"/> Halted</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] text-gray-400 relative">
                                         <span className="flex items-center gap-1">
                                             <Activity className="h-2 w-2 text-green-500" /> +{formatNumber(actualOutput)}/s
                                             {prodDelta > 0 && <span className="text-[8px] text-green-600/60 ml-0.5">+{formatNumber(prodDelta)}</span>}
                                             {isAnimating && <ChevronUp className="h-3 w-3 text-eldritch-gold animate-fade-out-up-2s ml-1" />}
                                         </span>
                                         {consumption && consumption.amount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Utensils className="h-2 w-2 text-red-500" /> -{formatNumber(consumption.amount)}/s
                                                {consDelta > 0 && <span className="text-[8px] text-red-600/60 ml-0.5">+{formatNumber(consDelta)}</span>}
                                                {isAnimating && <ChevronUp className="h-3 w-3 text-eldritch-gold animate-fade-out-up-2s ml-1" />}
                                            </span>
                                         )}
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); handlePurchase(vessel.id, level, bulkVessel.count); }}
                                    disabled={!canBuy || imprisoned} 
                                    className={`shrink-0 flex items-center gap-1 rounded px-2 py-1.5 transition-all ${isNextMilestone && canBuy ? 'bg-gradient-to-r from-yellow-600 to-eldritch-gold text-black border-yellow-400 shadow-[0_0_10px_rgba(197,160,89,0.5)]' : (canBuy && !imprisoned ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 hover:border-white/30' : 'bg-black/40 cursor-not-allowed opacity-60')}`}
                                >
                                    <span className={`text-[10px] font-bold ${isNextMilestone && !canBuy ? 'text-gray-200' : ''}`}>{isNextMilestone ? 'ASCEND' : 'UPG'}</span>
                                    <div className="flex items-center gap-1">
                                        <span className={`font-mono text-[10px] font-bold ${!canBuy && gameState.worshippers[bulkVessel.costType] > 0 ? 'text-red-500' : (isNextMilestone && !canBuy ? 'text-gray-200' : '')}`}>
                                            {formatNumber(bulkVessel.cost)}
                                        </span>
                                        <CostIcon className={`h-2 w-2 ${!canBuy && gameState.worshippers[bulkVessel.costType] > 0 ? 'text-red-500' : (isNextMilestone && !canBuy ? 'text-gray-200' : '')}`} />
                                    </div>
                                </button>
                            </div>
                        )
                    }

                    return (
                        <div key={vessel.id} 
                             onClick={() => imprisoned && onSelectVessel(vessel)}
                             className={`relative rounded-xl border bg-eldritch-dark p-3 transition-all ${typeColor.split(' ')[1]} ${imprisoned ? 'opacity-40 grayscale cursor-pointer' : ''}`}
                        >
                            <div className="absolute -top-1.5 -right-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-black font-serif text-[10px] font-bold text-eldritch-gold shadow-lg ring-1 ring-white/5">
                                {ROMAN_NUMERALS[vessel.tier]}
                            </div>

                            {imprisoned && (
                                <div className="absolute top-2 right-8 z-10 flex items-center gap-1 rounded bg-red-900 px-2 py-0.5 border border-red-500">
                                     <ZapOff className="h-2.5 w-2.5 text-white" />
                                     <span className="text-[8px] font-bold text-white uppercase">Imprisoned</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-3">
                                <button onClick={(e) => { e.stopPropagation(); onSelectVessel(vessel); }} className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 bg-black hover:scale-105 transition-transform overflow-hidden ${typeColor.split(' ')[1]}`}>
                                {isAnimating && <div className="absolute inset-0 animate-flash-gold z-30 pointer-events-none" />}
                                {isAnimating && (
                                    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                                        <span className="animate-x2-pop font-black text-eldritch-gold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">X2</span>
                                    </div>
                                )}
                                {vesselImages[vessel.id] ? <img src={vesselImages[vessel.id]} alt={vessel.name} className="h-full w-full object-cover object-top scale-125" /> : <User className={`h-8 w-8 ${typeColor.split(' ')[0]}`} />}
                                <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"><Info className="h-2 w-2 text-white" /></div>
                                </button>
                                <div className="flex-1 min-w-0 flex justify-between items-start">
                                    <div className="min-w-0 mr-1">
                                        <h4 className={`font-serif text-sm font-bold truncate ${typeColor.split(' ')[0]}`}>{vessel.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{vessel.subtitle}</p>
                                        <div className="mt-1 flex flex-col gap-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                                          {isStarving ? (
                                              <div className="flex items-center gap-1 text-red-400 font-bold">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>Output Starved</span>
                                              </div>
                                          ) : (
                                              <>
                                                <div className="flex items-center gap-1 relative">
                                                    <Activity className="h-3 w-3 text-green-500" />
                                                    <span className="text-gray-300">Prod:</span>
                                                    <span className="font-mono text-green-400 font-bold">+{formatNumber(actualOutput)}/s</span>
                                                    {prodDelta > 0 && <span className="text-[9px] text-green-600/50 font-bold ml-1 tracking-tighter">+{formatNumber(prodDelta)}</span>}
                                                    {isAnimating && <ChevronUp className="h-4 w-4 text-eldritch-gold animate-fade-out-up-2s ml-1" />}
                                                </div>
                                                {consumption && consumption.amount > 0 && (
                                                    <div className="flex items-center gap-1 relative">
                                                        <Utensils className="h-3 w-3 text-red-500" />
                                                        <span className="text-gray-300">Cons:</span>
                                                        <span className="font-mono text-red-400 font-bold">-{formatNumber(consumption.amount)}/s</span>
                                                        {consDelta > 0 && <span className="text-[9px] text-red-600/50 font-bold ml-1 tracking-tighter">+{formatNumber(consDelta)}</span>}
                                                        {isAnimating && <ChevronUp className="h-4 w-4 text-eldritch-gold animate-fade-out-up-2s ml-1" />}
                                                    </div>
                                                )}
                                              </>
                                          )}
                                        </div>
                                    </div>
                                    {level > 0 && <div className="shrink-0 rounded bg-black/40 px-2 py-1 border border-white/10"><span className="text-[10px] font-bold text-eldritch-gold">Lvl {level}</span></div>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handlePurchase(vessel.id, level, bulkVessel.count); }} 
                                    disabled={!canBuy || imprisoned} 
                                    className={`flex w-full items-center justify-between rounded px-3 py-2 transition-all ${isNextMilestone && canBuy ? 'bg-gradient-to-r from-yellow-600 to-eldritch-gold text-black border-yellow-400 shadow-[0_0_15px_rgba(197,160,89,0.6)]' : (canBuy && !imprisoned ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 hover:border-white/30' : 'bg-black/40 cursor-not-allowed opacity-60')}`}
                                >
                                    <span className={`text-xs font-bold ${isNextMilestone && canBuy ? 'text-black' : (isNextMilestone && !canBuy ? 'text-gray-200' : 'text-gray-300')}`}>
                                        {isNextMilestone ? 'Accept Influence of the Abyss' : (level === 0 ? 'Recruit' : `Upgrade x${bulkVessel.count}`)}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`font-mono text-sm font-bold ${isNextMilestone && canBuy ? 'text-black' : (!canBuy && gameState.worshippers[bulkVessel.costType] > 0 ? 'text-red-500' : (isNextMilestone && !canBuy ? 'text-gray-200' : ''))}`}>
                                            {formatNumber(bulkVessel.cost)}
                                        </span>
                                        <CostIcon className={`h-3 w-3 ${isNextMilestone && canBuy ? 'text-black' : (!canBuy && gameState.worshippers[bulkVessel.costType] > 0 ? 'text-red-500' : (isNextMilestone && !canBuy ? 'text-gray-200' : ''))}`} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
};