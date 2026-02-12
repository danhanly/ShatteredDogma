
import React from 'react';
import { GameState, WorshipperType, FateId } from '../../types';
import { calculateProductionByType, calculateConsumptionByType } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { BarChart2, Crown, Frown, Ghost, Sword, Activity, Utensils, Orbit, Sparkles, Dna, MousePointer2, User, Flame } from 'lucide-react';
import { RELIC_DEFINITIONS, FATE_DEFINITIONS, ZEALOTRY_DEFINITIONS } from '../../constants';

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

interface CultTabProps {
  gameState: GameState;
}

export const CultTab: React.FC<CultTabProps> = ({ gameState }) => {
  const currentProdRates = calculateProductionByType(gameState);
  const currentConsRates = calculateConsumptionByType(gameState);
  
  const totalProd = Object.values(currentProdRates).reduce((a: number, b: number) => a + b, 0);
  const totalCons = Object.values(currentConsRates).reduce((a: number, b: number) => a + b, 0);

  const vesselsUnlocked = Object.values(gameState.vesselLevels).some(v => (v as number) > 0);
  const hasLegacy = gameState.souls > 0 || Object.values(gameState.relics).some(r => (r as number) > 0) || Object.keys(gameState.fates).length > 0;
  const zealotryUnlocked = gameState.hasUnlockedZealotry;

  return (
    <div className="flex flex-col gap-6">
        {/* Core Stats Section */}
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

                {/* Click Statistics */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-black/20 p-2 rounded border border-white/5 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-gray-800"><MousePointer2 className="h-4 w-4 text-gray-400" /></div>
                        <div>
                            <div className="text-[9px] uppercase text-gray-500 font-bold">Manual Clicks</div>
                            <div className="font-mono text-sm font-bold text-gray-200">{formatNumber(gameState.manualClicks || 0)}</div>
                        </div>
                    </div>
                    <div className="bg-black/20 p-2 rounded border border-white/5 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-purple-900/40"><User className="h-4 w-4 text-purple-400" /></div>
                        <div>
                            <div className="text-[9px] uppercase text-gray-500 font-bold">Mattelock Clicks</div>
                            <div className="font-mono text-sm font-bold text-purple-300">{formatNumber(gameState.mattelockClicks || 0)}</div>
                        </div>
                    </div>
                </div>
                
                {vesselsUnlocked && (
                    <div className="space-y-6 mt-4">
                      {/* Production Rates */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/5 pb-1">
                            <div className="flex items-center gap-1"><Activity className="h-3 w-3" /> Passive Gathering</div>
                            <span className="text-green-500 font-bold">+{formatNumber(totalProd)}/s</span>
                        </div>
                        {([WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY, WorshipperType.ZEALOUS]).map(type => {
                            const Icon = ICON_MAP[type];
                            const rate = currentProdRates[type];
                            const tColor = type === WorshipperType.WORLDLY ? 'text-green-400' : type === WorshipperType.ZEALOUS ? 'text-red-500' : type === WorshipperType.INDOLENT ? 'text-blue-400' : 'text-gray-400';
                            return (
                              <div key={`prod-${type}`} className="flex items-center justify-between p-2 bg-black/20 rounded">
                                  <div className="flex items-center gap-2"><Icon className={`h-3 w-3 ${tColor}`} /><span className={`text-xs font-bold ${tColor}`}>{type}</span></div>
                                  <span className="font-mono text-xs text-green-500">+{formatNumber(rate)}/s</span>
                              </div>
                            )
                        })}
                      </div>

                      {/* Consumption Rates */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/5 pb-1">
                            <div className="flex items-center gap-1"><Utensils className="h-3 w-3" /> Caste Hunger</div>
                            <span className="text-red-500 font-bold">-{formatNumber(totalCons)}/s</span>
                        </div>
                        {([WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY, WorshipperType.ZEALOUS]).map(type => {
                            const Icon = ICON_MAP[type];
                            const rate = currentConsRates[type];
                            if (rate === 0) return null;
                            const tColor = type === WorshipperType.WORLDLY ? 'text-green-400' : type === WorshipperType.ZEALOUS ? 'text-red-500' : type === WorshipperType.INDOLENT ? 'text-blue-400' : 'text-gray-400';
                            return (
                              <div key={`cons-${type}`} className="flex items-center justify-between p-2 bg-black/20 rounded">
                                  <div className="flex items-center gap-2"><Icon className={`h-3 w-3 ${tColor}`} /><span className={`text-xs font-bold ${tColor}`}>{type}</span></div>
                                  <span className="font-mono text-xs text-red-500">-{formatNumber(rate)}/s</span>
                              </div>
                            )
                        })}
                      </div>
                    </div>
                )}
            </div>
        </div>

        {/* Zealotry History */}
        {zealotryUnlocked && (
           <div className="rounded-xl border border-red-900/40 bg-eldritch-dark p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Flame className="h-5 w-5 text-red-500" />
                    <h3 className="font-serif text-lg text-red-400 uppercase tracking-widest">Decrees Enacted</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {ZEALOTRY_DEFINITIONS.map(def => {
                        const count = gameState.zealotryCounts?.[def.id] || 0;
                        if (count === 0) return null;
                        return (
                            <div key={def.id} className="flex justify-between items-center bg-black/20 p-2 rounded text-xs">
                                <span className="text-gray-300">{def.name}</span>
                                <span className="font-bold text-red-500">{count} times</span>
                            </div>
                        );
                    })}
                    {(!gameState.zealotryCounts || Object.values(gameState.zealotryCounts).every(c => c === 0)) && (
                        <p className="text-[10px] text-gray-600 italic">No decrees have been enacted yet.</p>
                    )}
                </div>
           </div>
        )}

        {/* End Times / Legacy Section */}
        {hasLegacy && (
            <div className="rounded-xl border border-indigo-900/40 bg-eldritch-dark p-4 shadow-[0_0_15px_rgba(49,46,129,0.1)]">
                <div className="flex items-center gap-2 mb-4">
                    <Orbit className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-serif text-lg text-indigo-300 uppercase tracking-widest">Divine Legacy</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {/* Souls Counter */}
                    <div className="bg-black/40 p-3 rounded border border-indigo-500/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Orbit className="h-4 w-4 text-indigo-400" />
                            <span className="text-xs text-gray-400">Total Souls Owned</span>
                        </div>
                        <span className="font-mono text-lg font-bold text-indigo-300">{formatNumber(gameState.souls)}</span>
                    </div>

                    {/* Relics Bonuses */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase text-gray-500 font-bold border-b border-white/5 pb-1">
                            <Sparkles className="h-3 w-3 text-eldritch-gold" /> Relic Mastery
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {RELIC_DEFINITIONS.filter(r => (gameState.relics[r.id] || 0) > 0).map(relic => {
                                const level = gameState.relics[relic.id] || 0;
                                return (
                                    <div key={relic.id} className="flex justify-between items-center bg-black/20 p-2 rounded text-xs">
                                        <span className="text-gray-300">{relic.name}</span>
                                        <span className="font-bold text-eldritch-gold">Lvl {level}</span>
                                    </div>
                                );
                            })}
                            {Object.values(gameState.relics).every(v => v === 0) && (
                                <p className="text-[10px] text-gray-600 italic">No permanent relics forged yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Fates Summary */}
                    {Object.keys(gameState.fates).length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase text-gray-500 font-bold border-b border-white/5 pb-1">
                                <Dna className="h-3 w-3 text-indigo-400" /> Fates Intertwined
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                                {Object.entries(gameState.fates).sort((a,b) => a[0].localeCompare(b[0])).map(([fateId, val]) => {
                                    const value = val as number;
                                    const def = FATE_DEFINITIONS[fateId as FateId];
                                    const displayValue = (value * 100).toFixed(1);
                                    return (
                                        <div key={`legacy-fate-${fateId}`} className="flex justify-between items-center text-[10px] py-1 border-b border-white/5 last:border-0">
                                            <span className="text-gray-400">{def.label}</span>
                                            <span className={`font-mono font-bold ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {value > 0 ? '+' : ''}{displayValue}{def.suffix}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};
