
import React from 'react';
import { GameState, WorshipperType, VesselDefinition, IncrementType, VesselId, WORSHIPPER_ORDER } from '../../types';
import { calculateBulkVesselBuy, calculateVesselOutput, calculateVesselEfficiency } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { Crown, Frown, Ghost, Sword, User, Info, Activity, ZapOff, AlertTriangle } from 'lucide-react';
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
}

export const VesselsTab: React.FC<VesselsTabProps> = ({
  gameState, vesselsUnlocked, visibleVessels, increment, onSetIncrement,
  vesselImages, onPurchaseVessel, onSelectVessel
}) => {
  if (!vesselsUnlocked) return null;
  
  // Group visible vessels by caste type using the predefined order
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

          return (
            <div key={group.type} className="flex flex-col gap-3">
              {/* Caste Group Header */}
              <div className={`flex items-center gap-2 border-b py-1 mb-1 font-serif text-[10px] font-bold uppercase tracking-[0.25em] ${casteColorClass}`}>
                <CasteIcon className="h-3 w-3" />
                <span>{group.type} Vessels</span>
              </div>

              <div className="flex flex-col gap-4">
                {group.vessels.map((vessel) => {
                    const level = gameState.vesselLevels[vessel.id] || 0;
                    const bulkVessel = calculateBulkVesselBuy(vessel.id, level, increment, gameState);
                    const potentialOutput = calculateVesselOutput(vessel.id, level);
                    const efficiency = calculateVesselEfficiency(gameState, vessel.id as VesselId);
                    const actualOutput = Math.floor(potentialOutput * efficiency);
                    const isStarving = efficiency < 1.0 && level > 0 && !gameState.vesselToggles[vessel.id];
                    
                    const canBuy = gameState.worshippers[bulkVessel.costType] >= bulkVessel.cost && bulkVessel.count > 0;
                    const CostIcon = ICON_MAP[bulkVessel.costType];
                    const typeColor = vessel.type === WorshipperType.WORLDLY ? 'text-green-400 border-green-900' : 
                                     vessel.type === WorshipperType.ZEALOUS ? 'text-red-500 border-red-900' : 
                                     vessel.type === WorshipperType.INDOLENT ? 'text-blue-400 border-blue-900' : 
                                     'text-gray-400 border-gray-700';

                    const imprisoned = gameState.vesselToggles[vessel.id];

                    return (
                        <div key={vessel.id} className={`relative rounded-xl border bg-eldritch-dark p-3 transition-all ${typeColor.split(' ')[1]} ${imprisoned ? 'opacity-40 grayscale' : ''}`}>
                            
                            {/* Roman Numeral Tier Badge */}
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
                                <button onClick={() => onSelectVessel(vessel)} className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 bg-black hover:scale-105 transition-transform overflow-hidden ${typeColor.split(' ')[1]}`}>
                                {vesselImages[vessel.id] ? <img src={vesselImages[vessel.id]} alt={vessel.name} className="h-full w-full object-cover object-top scale-125" /> : <User className={`h-8 w-8 ${typeColor.split(' ')[0]}`} />}
                                <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"><Info className="h-2 w-2 text-white" /></div>
                                </button>
                                <div className="flex-1 min-w-0 flex justify-between items-start">
                                    <div className="min-w-0 mr-1">
                                        <h4 className={`font-serif text-sm font-bold truncate ${typeColor.split(' ')[0]}`}>{vessel.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{vessel.subtitle}</p>
                                        <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400">
                                          {isStarving ? (
                                              <div className="flex items-center gap-1 text-red-400 font-bold">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>Output: <span className="text-red-500">{formatNumber(actualOutput)}</span> / <span className="text-gray-600">{formatNumber(potentialOutput)}</span></span>
                                              </div>
                                          ) : (
                                              <>
                                                <span>Rate: +{formatNumber(actualOutput)}/s</span>
                                                {level > 0 && !imprisoned && <Activity className="h-3 w-3 text-green-500 animate-pulse-fast ml-1" />}
                                              </>
                                          )}
                                        </div>
                                    </div>
                                    {level > 0 && <div className="shrink-0 rounded bg-black/40 px-2 py-1 border border-white/10"><span className="text-[10px] font-bold text-eldritch-gold">Lvl {level}</span></div>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <button 
                                    onClick={() => onPurchaseVessel(vessel.id)} 
                                    disabled={!canBuy} 
                                    className={`flex w-full items-center justify-between rounded px-3 py-2 transition-all ${canBuy ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 hover:border-white/30' : 'bg-black/40 cursor-not-allowed opacity-60'}`}
                                >
                                    <span className="text-xs font-bold text-gray-300">
                                        {level === 0 ? 'Recruit' : `Upgrade x${bulkVessel.count}`}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`font-mono text-sm font-bold ${!canBuy && gameState.worshippers[bulkVessel.costType] > 0 ? 'text-red-500' : ''}`}>
                                            {formatNumber(bulkVessel.cost)}
                                        </span>
                                        <CostIcon className={`h-3 w-3 ${!canBuy && gameState.worshippers[bulkVessel.costType] > 0 ? 'text-red-500' : ''}`} />
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
