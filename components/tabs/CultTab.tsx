
import React from 'react';
import { GameState, WorshipperType } from '../../types';
import { calculateProductionByType } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { BarChart2, Crown, Frown, Ghost, Sword } from 'lucide-react';

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

interface CultTabProps {
  gameState: GameState;
  vesselsUnlocked: boolean;
}

export const CultTab: React.FC<CultTabProps> = ({ gameState, vesselsUnlocked }) => {
  const currentTypeRates = calculateProductionByType(gameState.vesselLevels, gameState.isPaused);
  const totalRate = Object.values(currentTypeRates).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-eldritch-grey/20 bg-eldritch-dark p-4">
            <div className="flex items-center gap-2 mb-4"><BarChart2 className="h-5 w-5 text-eldritch-gold" /><h3 className="font-serif text-lg text-eldritch-gold">Ritual Audit</h3></div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-3 rounded border border-white/5">
                      <div className="text-[10px] uppercase text-gray-500 mb-1">Current Cult</div>
                      <div className="font-mono text-lg font-bold text-white">{formatNumber(gameState.totalWorshippers)}</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded border border-white/5">
                      <div className="text-[10px] uppercase text-gray-500 mb-1">Lifetime Accrued</div>
                      <div className="font-mono text-lg font-bold text-eldritch-gold">{formatNumber(gameState.totalAccruedWorshippers)}</div>
                  </div>
                </div>
                {vesselsUnlocked && (
                    <div className="space-y-2 mt-4">
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/5 pb-1">Passive Gathering (Total: +{formatNumber(totalRate)}/s)</div>
                    {([WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY, WorshipperType.ZEALOUS]).map(type => {
                        const Icon = ICON_MAP[type];
                        const rate = currentTypeRates[type];
                        const tColor = type === WorshipperType.WORLDLY ? 'text-green-400' : type === WorshipperType.ZEALOUS ? 'text-red-500' : type === WorshipperType.INDOLENT ? 'text-blue-400' : 'text-gray-400';
                        return (
                        <div key={type} className="flex items-center justify-between p-2 bg-black/20 rounded">
                            <div className="flex items-center gap-2"><Icon className={`h-3 w-3 ${tColor}`} /><span className={`text-xs font-bold ${tColor}`}>{type}</span></div>
                            <span className="font-mono text-xs text-green-500">+{formatNumber(rate)}/s</span>
                        </div>
                        )
                    })}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
