
import React from 'react';
import { GameState, WorshipperType } from '../types';
import { WORSHIPPER_DETAILS, CONSUMPTION_RATES, VESSEL_DEFINITIONS } from '../constants';
import { Activity, Utensils, ZapOff, Factory, TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { calculateProductionByType, calculateConsumptionByType, calculateVesselOutput } from '../services/gameService';
import { BaseModal } from './BaseModal';

interface WorshipperModalProps {
  type: WorshipperType | null;
  count: number;
  onClose: () => void;
  imageUrl: string;
  gameState: GameState;
}

export const WorshipperModal: React.FC<WorshipperModalProps> = ({ type, count, onClose, imageUrl, gameState }) => {
  if (!type) return null;
  const details = WORSHIPPER_DETAILS[type];
  const typeColor = type === WorshipperType.WORLDLY ? 'text-green-400 border-green-900' : type === WorshipperType.ZEALOUS ? 'text-red-500 border-red-900' : type === WorshipperType.INDOLENT ? 'text-blue-400 border-blue-900' : 'text-gray-400 border-gray-700';
  
  const productionRate = calculateProductionByType(gameState.vesselLevels, gameState.isPaused)[type];
  const consumptionRate = calculateConsumptionByType(gameState.vesselLevels, gameState.isPaused)[type];
  const netRate = productionRate - consumptionRate;
  
  const hasAnyVessel = Object.values(gameState.vesselLevels).some(lvl => (lvl as number) > 0);
  const isPaused = gameState.isPaused[type] && hasAnyVessel;

  const hasRecruitedType = (vType: WorshipperType) => 
    VESSEL_DEFINITIONS.some(vd => vd.type === vType && (gameState.vesselLevels[vd.id] || 0) > 0);

  // Find who consumes THIS type
  const consumers: { type: WorshipperType, rate: number }[] = [];
  const prodByType = calculateProductionByType(gameState.vesselLevels, gameState.isPaused);
  (Object.keys(CONSUMPTION_RATES) as WorshipperType[]).forEach(consumerType => {
      const rates = CONSUMPTION_RATES[consumerType];
      if (rates[type] && hasRecruitedType(consumerType)) {
          const productionOfCaste = prodByType[consumerType];
          consumers.push({ type: consumerType, rate: (rates[type] || 0) * productionOfCaste });
      }
  });

  // Find production sources for THIS type
  const productionSources: { name: string, rate: number }[] = [];
  VESSEL_DEFINITIONS.forEach(vessel => {
    if (vessel.type === type) {
      const level = gameState.vesselLevels[vessel.id] || 0;
      if (level > 0 && !gameState.isPaused[type]) {
        productionSources.push({
          name: vessel.name,
          rate: calculateVesselOutput(vessel.id, level)
        });
      }
    }
  });

  return (
    <BaseModal onClose={onClose} showCloseButton={true} zIndex={50} containerClassName={`max-w-md w-full ${typeColor.split(' ')[1]}`}>
      <div className="relative h-80 w-full overflow-hidden bg-black">
          <div className="absolute inset-0 bg-no-repeat" style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-eldritch-dark/30 to-transparent" />
          
          {isPaused && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded bg-red-900 px-3 py-1 border border-red-500 animate-pulse">
                  <ZapOff className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white uppercase">Production Halted</span>
              </div>
          )}

          <div className="absolute bottom-4 left-6 z-10">
               <h2 className={`font-serif text-3xl font-bold uppercase tracking-widest drop-shadow-md ${typeColor.split(' ')[0]}`}>{type}</h2>
               <p className="text-sm text-gray-300 italic">{details.description}</p>
          </div>
      </div>
      <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex flex-col rounded-lg bg-black/40 p-3 border border-white/5">
                  <span className="text-[10px] uppercase text-gray-500">Current Count</span>
                  <span className={`font-mono text-lg font-bold ${typeColor.split(' ')[0]}`}>{formatNumber(count)}</span>
              </div>
              <div className="flex flex-col rounded-lg bg-black/40 p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {netRate >= 0 ? <TrendingUp className="h-2 w-2 text-green-500" /> : <TrendingDown className="h-2 w-2 text-red-500" />}
                    <span className="text-[10px] uppercase text-gray-500">Net Growth</span>
                  </div>
                  <span className={`font-mono text-lg font-bold ${netRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {netRate >= 0 ? '+' : ''}{formatNumber(netRate)}/s
                  </span>
              </div>
          </div>


          <div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm mb-4"><p>{details.lore}</p></div>

          {/* Production Sources Box */}
          {hasAnyVessel && (
            <div className="mb-4 rounded-lg bg-green-950/20 p-4 border border-green-900/30">
                <div className="flex items-center gap-2 mb-2 text-green-400">
                    <Factory className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Active Production</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-900/20 pb-2 mb-2">
                    <span className="text-sm text-gray-400">Total Yield:</span>
                    <span className="font-mono text-green-400 font-bold">+{formatNumber(productionRate)}/s</span>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Generated By:</p>
                    {productionSources.length > 0 ? productionSources.map(s => (
                        <div key={s.name} className="flex justify-between text-xs">
                            <span className="text-gray-300">{s.name}:</span>
                            <span className="text-green-400/70 font-mono">+{formatNumber(s.rate)}/s</span>
                        </div>
                    )) : (
                        <p className="text-xs text-gray-600 italic">No automated vessels active for this caste.</p>
                    )}
                </div>
            </div>
          )}

          {/* Consumption Box */}
          {consumptionRate > 0 && (
            <div className="mb-6 rounded-lg bg-red-950/20 p-4 border border-red-900/30">
                <div className="flex items-center gap-2 mb-2 text-red-400">
                    <Utensils className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Soul Consumption</span>
                </div>
                <div className="flex justify-between items-center border-b border-red-900/20 pb-2 mb-2">
                    <span className="text-sm text-gray-400">Total Lost:</span>
                    <span className="font-mono text-red-400 font-bold">-{formatNumber(consumptionRate)}/s</span>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Consumed By:</p>
                    {consumers.length > 0 ? consumers.map(c => (
                        <div key={c.type} className="flex justify-between text-xs">
                            <span className="text-gray-300">{c.type}:</span>
                            <span className="text-red-400/70 font-mono">-{formatNumber(c.rate)}/s</span>
                        </div>
                    )) : (
                        <p className="text-xs text-gray-600 italic">No higher castes feeding on these souls yet.</p>
                    )}
                </div>
            </div>
          )}
      </div>
    </BaseModal>
  );
};
