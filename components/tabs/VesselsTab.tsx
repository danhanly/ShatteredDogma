
import React from 'react';
import { GameState, WorshipperType, VesselDefinition } from '../../types';
import { calculateBulkVesselBuy, calculateVesselOutput } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { Crown, Frown, Ghost, Sword, User, Info, Activity, ZapOff, AlertTriangle, ShieldAlert } from 'lucide-react';
import { IncrementType } from '../IncrementSelector';

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

interface VesselsTabProps {
  gameState: GameState;
  vesselsUnlocked: boolean;
  visibleVessels: VesselDefinition[];
  increment: IncrementType;
  vesselImages: Record<string, string>;
  onPurchaseVessel: (id: string, type: WorshipperType, count: number) => void;
  onSelectVessel: (vessel: VesselDefinition) => void;
}

export const VesselsTab: React.FC<VesselsTabProps> = ({
  gameState,
  vesselsUnlocked,
  visibleVessels,
  increment,
  vesselImages,
  onPurchaseVessel,
  onSelectVessel
}) => {
  if (!vesselsUnlocked) return null;
  
  const hasAnyVessel = Object.values(gameState.vesselLevels).some(lvl => (lvl as number) > 0);
  const isCastePaused = (type: WorshipperType) => gameState.isPaused[type] && hasAnyVessel;

  return (
    <div className="flex flex-col gap-4">
        {visibleVessels.map((vessel) => {
            const level = gameState.vesselLevels[vessel.id] || 0;
            const bulkVessel = calculateBulkVesselBuy(vessel.id, level, increment, gameState, vessel.type);
            const currentOutput = calculateVesselOutput(vessel.id, level);
            
            // Check if user can afford at least 1 before checking sustainability for fixed increments
            const costOfOne = bulkVessel.cost / (bulkVessel.count || 1);
            const canAffordBase = gameState.worshippers[vessel.type] >= (increment === 'MAX' ? (bulkVessel.cost || 1) : costOfOne);
            
            const canBuy = gameState.worshippers[vessel.type] >= bulkVessel.cost && bulkVessel.count > 0;
            const TypeIcon = ICON_MAP[vessel.type];
            const typeColor = vessel.type === WorshipperType.WORLDLY ? 'text-green-400 border-green-900' : vessel.type === WorshipperType.ZEALOUS ? 'text-red-500 border-red-900' : vessel.type === WorshipperType.INDOLENT ? 'text-blue-400 border-blue-900' : 'text-gray-400 border-gray-700';

            const paused = isCastePaused(vessel.type);
            const isBlockedBySustainability = bulkVessel.isCappedBySustainability && bulkVessel.count === 0 && canAffordBase;

            return (
                <div key={vessel.id} className={`relative rounded-xl border bg-eldritch-dark p-3 transition-all ${typeColor.split(' ')[1]} ${paused ? 'bg-red-950/10 border-red-900 grayscale-[0.5]' : ''}`}>
                    
                    {paused && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded bg-red-900 px-2 py-0.5 border border-red-500">
                             <ZapOff className="h-2.5 w-2.5 text-white" />
                             <span className="text-[8px] font-bold text-white uppercase">Halted</span>
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
                                  {paused ? (
                                      <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Starving</span>
                                  ) : (
                                      <>
                                        <span>Rate: +{formatNumber(currentOutput)}/s</span>
                                        {level > 0 && <Activity className="h-3 w-3 text-green-500 animate-pulse-fast ml-1" />}
                                      </>
                                  )}
                                </div>
                            </div>
                            {level > 0 && <div className="shrink-0 rounded bg-black/40 px-2 py-1 border border-white/10"><span className="text-[10px] font-bold text-eldritch-gold">Lvl {level}</span></div>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        {isBlockedBySustainability && (
                            <div className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-bold text-red-500 uppercase animate-pulse">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                <span>Low Indolent Production</span>
                            </div>
                        )}
                        {bulkVessel.isCappedBySustainability && bulkVessel.count > 0 && (
                            <div className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-bold text-amber-500 uppercase">
                                <ShieldAlert className="h-3 w-3" />
                                <span>Capped by production capacity</span>
                            </div>
                        )}
                        <button 
                            onClick={() => onPurchaseVessel(vessel.id, vessel.type, bulkVessel.count)} 
                            disabled={!canBuy} 
                            className={`flex w-full items-center justify-between rounded px-3 py-2 transition-all ${canBuy ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 hover:border-white/30' : 'bg-black/40 cursor-not-allowed opacity-60'}`}
                        >
                            <span className="text-xs font-bold text-gray-300">
                                {level === 0 ? 'Recruit' : (bulkVessel.count === 0 ? 'Blocked' : `Upgrade x${bulkVessel.count}`)}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className={`font-mono text-sm font-bold ${!canBuy && canAffordBase ? 'text-red-500' : ''}`}>
                                    {formatNumber(bulkVessel.cost)}
                                </span>
                                <TypeIcon className={`h-3 w-3 ${!canBuy && canAffordBase ? 'text-red-500' : ''}`} />
                            </div>
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
  );
};
