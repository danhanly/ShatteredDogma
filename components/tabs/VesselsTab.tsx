
import React from 'react';
import { GameState, WorshipperType, VesselDefinition } from '../../types';
import { VESSEL_DEFINITIONS } from '../../constants';
import { calculateBulkVesselBuy, calculateVesselOutput } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { Crown, Frown, Ghost, Sword, User, Info, Activity } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-4">
        {visibleVessels.map((vessel) => {
            const level = gameState.vesselLevels[vessel.id] || 0;
            const bulkVessel = calculateBulkVesselBuy(vessel.id, level, increment, gameState, vessel.type);
            const currentOutput = calculateVesselOutput(vessel.id, level, gameState.relicLevels);
            const canBuy = gameState.worshippers[vessel.type] >= bulkVessel.cost && bulkVessel.count > 0;
            const imageUrl = vesselImages[vessel.id];
            const TypeIcon = ICON_MAP[vessel.type];
            
            let typeColor = 'text-gray-400 border-gray-700';
            switch(vessel.type) {
            case WorshipperType.WORLDLY: typeColor = 'text-green-400 border-green-900'; break;
            case WorshipperType.LOWLY: typeColor = 'text-gray-400 border-gray-700'; break;
            case WorshipperType.ZEALOUS: typeColor = 'text-red-500 border-red-900'; break;
            case WorshipperType.INDOLENT: typeColor = 'text-blue-400 border-blue-900'; break;
            }

            return (
                <div key={vessel.id} className={`relative rounded-xl border bg-eldritch-dark p-3 ${typeColor.split(' ')[1]}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <button onClick={() => onSelectVessel(vessel)} className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 bg-black hover:scale-105 transition-transform overflow-hidden ${typeColor.split(' ')[1]}`}>
                        {imageUrl ? <img src={imageUrl} alt={vessel.name} className="h-full w-full object-cover object-top scale-125" /> : <User className={`h-8 w-8 ${typeColor.split(' ')[0]}`} />}
                        <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"><Info className="h-2 w-2 text-white" /></div>
                        </button>
                        <div className="flex-1 min-w-0 flex justify-between items-start">
                            <div className="min-w-0 mr-1">
                                <h4 className={`font-serif text-sm font-bold truncate ${typeColor.split(' ')[0]}`}>{vessel.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{vessel.subtitle}</p>
                                <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 relative">
                                <span>Rate: +{formatNumber(currentOutput)}/s</span>
                                {level > 0 && <Activity className="h-3 w-3 text-green-500 animate-pulse-fast ml-1" />}
                                </div>
                            </div>
                            {level > 0 && <div className="shrink-0 rounded bg-black/40 px-2 py-1 border border-white/10"><span className="text-[10px] font-bold text-eldritch-gold">Lvl {level}</span></div>}
                        </div>
                    </div>
                    
                    {level > 0 && (
                    <div className="w-full h-0.5 bg-black/50 mb-3 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500/50 animate-progress" />
                    </div>
                    )}

                    <button
                    onClick={() => onPurchaseVessel(vessel.id, vessel.type, bulkVessel.count)}
                    disabled={!canBuy}
                    className={`flex w-full items-center justify-between rounded px-3 py-2 transition-all ${canBuy ? 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 border border-white/10' : 'bg-black/40 cursor-not-allowed opacity-60 border border-transparent'}`}
                    >
                        <span className="text-xs font-bold text-gray-300">{level === 0 ? 'Recruit' : (bulkVessel.count > 1 ? `Upgrade x${bulkVessel.count}` : 'Upgrade')}</span>
                        <div className="flex items-center gap-1.5"><span className={`font-mono text-sm font-bold ${canBuy ? 'text-white' : 'text-gray-500'}`}>{formatNumber(bulkVessel.cost)}</span><TypeIcon className={`h-3 w-3 ${typeColor.split(' ')[0]}`} /></div>
                    </button>
                </div>
            );
        })}
    </div>
  );
};
