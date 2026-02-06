
import React from 'react';
import { GameState, WorshipperType, RelicId } from '../../types';
import { calculatePassiveIncomeByType } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { BarChart2, Crown, Frown, Ghost, Sword, Orbit, Eye } from 'lucide-react';

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

interface CultTabProps {
  gameState: GameState;
  vesselsUnlocked: boolean;
  eodUnlocked: boolean;
}

export const CultTab: React.FC<CultTabProps> = ({ gameState, vesselsUnlocked, eodUnlocked }) => {
  const currentTypeRates = calculatePassiveIncomeByType(gameState.vesselLevels, gameState.relicLevels);
  const totalRate = Object.values(currentTypeRates).reduce((a: number, b: number) => a + b, 0);
  const abyssUnlocked = gameState.miracleLevel > 50;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        <div className="rounded-xl border border-eldritch-grey/20 bg-eldritch-dark p-4">
            <div className="flex items-center gap-2 mb-4"><BarChart2 className="h-5 w-5 text-eldritch-gold" /><h3 className="font-serif text-lg text-eldritch-gold">Ritual Audit</h3></div>
            <div className="mb-4 text-xs text-gray-500 italic">"The abyss below stirs to reveal new truths every frame. These visions represent real-time updates of your ascending influence."</div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded border border-white/5">
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Current Devoted Worshippers</div>
                    <div className="font-mono text-lg font-bold text-white">{formatNumber(gameState.totalWorshippers)}</div>
                </div>
                <div className="bg-black/40 p-3 rounded border border-white/5">
                    <div className="text-[10px] uppercase text-gray-500 mb-1">All That Have Ever Worshipped</div>
                    <div className="font-mono text-lg font-bold text-eldritch-gold">{formatNumber(gameState.totalAccruedWorshippers)}</div>
                </div>
                </div>
                
                {vesselsUnlocked && (
                    <>
                    <div className="bg-black/40 p-3 rounded border border-white/5 flex items-center justify-between">
                    <div className="text-[10px] uppercase text-gray-500">Worshippers Converted by the Vessels</div>
                    <div className="font-mono text-lg font-bold text-green-400">+{formatNumber(totalRate)}/s</div>
                    </div>
                    <div className="space-y-2 mt-4">
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/5 pb-1">Effectiveness of the Vessels</div>
                    {([WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY, WorshipperType.ZEALOUS]).map(type => {
                        const Icon = ICON_MAP[type];
                        const rate = currentTypeRates[type];
                        const current = gameState.worshippers[type];
                        const peak = gameState.maxWorshippersByType[type];
                        let tColor = 'text-gray-400';
                        if (type === WorshipperType.WORLDLY) tColor = 'text-green-400';
                        else if (type === WorshipperType.ZEALOUS) tColor = 'text-red-500';
                        else if (type === WorshipperType.INDOLENT) tColor = 'text-blue-400';
                        return (
                        <div key={type} className="flex flex-col gap-1 p-2 bg-black/20 rounded">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><Icon className={`h-3 w-3 ${tColor}`} /><span className={`text-xs font-bold ${tColor}`}>{type}</span></div>
                                <span className="font-mono text-xs text-green-500">+{formatNumber(rate)}/s</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]"><span className="text-gray-500">Tethered: {formatNumber(current)}</span><span className="text-gray-600">Peak: {formatNumber(peak)}</span></div>
                        </div>
                        )
                    })}
                    </div>
                    </>
                )}

                {!vesselsUnlocked && (
                    <div className="mt-4 p-4 text-center rounded bg-black/20 border border-white/5">
                        <p className="text-xs text-gray-500 italic">"The voices of the vessels are yet to be heard. Gather more Indolent souls to begin the liturgy."</p>
                    </div>
                )}

                {abyssUnlocked && (
                    <>
                    <div className="bg-black/40 p-3 rounded border border-purple-900/30 flex items-center justify-between mt-4">
                    <div className="text-[10px] uppercase text-purple-400">Abyssal Influence Stats</div>
                    <Eye className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="space-y-2 mt-4">
                        <div className="text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/5 pb-1">Influence Usage & Retention</div>
                        {([WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY]).map(type => {
                            const Icon = ICON_MAP[type];
                            const usage = gameState.influenceUsage[type] || 0;
                            
                            let relicId = RelicId.INFLUENCE_INDOLENT;
                            let color = 'text-gray-400';
                            if (type === WorshipperType.INDOLENT) { relicId = RelicId.INFLUENCE_INDOLENT; color='text-blue-400'; }
                            else if (type === WorshipperType.LOWLY) { relicId = RelicId.INFLUENCE_LOWLY; color='text-gray-400'; }
                            else if (type === WorshipperType.WORLDLY) { relicId = RelicId.INFLUENCE_WORLDLY; color='text-green-400'; }

                            const retention = Math.min((gameState.relicLevels[relicId] || 0), 100);

                            return (
                                <div key={type} className="flex flex-col gap-1 p-2 bg-black/20 rounded">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2"><Icon className={`h-3 w-3 ${color}`} /><span className={`text-xs font-bold ${color}`}>{type} Sacrifices</span></div>
                                        <span className="font-mono text-xs text-white">{usage} Times</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-500">Current Cost Penalty: +{usage * 2}%</span>
                                        <span className={`font-bold ${retention > 0 ? 'text-purple-300' : 'text-gray-600'}`}>Vessel Retention: {retention}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    </>
                )}

                {eodUnlocked && (
                    <>
                    <div className="bg-black/40 p-3 rounded border border-indigo-900/30 flex items-center justify-between mt-4">
                    <div className="text-[10px] uppercase text-indigo-400">Ancient Relic Resonance</div>
                    <Orbit className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="space-y-2 mt-4">
                        <div className="text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/5 pb-1">Relic Modifiers</div>
                        
                        <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                        <span className="text-xs font-bold text-gray-300">Dark Miracle Potency</span>
                        <span className="font-mono text-xs text-indigo-300">+{(gameState.relicLevels[RelicId.MIRACLE_BOOST] || 0) * 5}%</span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                        <span className="text-xs font-bold text-gray-300">Global Vessel Harmony</span>
                        <span className="font-mono text-xs text-indigo-300">+{(gameState.relicLevels[RelicId.ALL_VESSEL_BOOST] || 0) * 2}%</span>
                        </div>

                        {([WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY, WorshipperType.ZEALOUS]).map(type => {
                            const Icon = ICON_MAP[type];
                            let relicId = RelicId.INDOLENT_BOOST;
                            let color = 'text-gray-400';
                            
                            if (type === WorshipperType.INDOLENT) { relicId = RelicId.INDOLENT_BOOST; color='text-blue-400'; }
                            else if (type === WorshipperType.LOWLY) { relicId = RelicId.LOWLY_BOOST; color='text-gray-400'; }
                            else if (type === WorshipperType.WORLDLY) { relicId = RelicId.WORLDLY_BOOST; color='text-green-400'; }
                            else if (type === WorshipperType.ZEALOUS) { relicId = RelicId.ZEALOUS_BOOST; color='text-red-500'; }
                
                            const bonus = (gameState.relicLevels[relicId] || 0) * 5;
                
                            return (
                            <div key={type} className="flex items-center justify-between p-2 bg-black/20 rounded">
                                <div className="flex items-center gap-2"><Icon className={`h-3 w-3 ${color}`} /><span className={`text-xs font-bold ${color}`}>{type} Resonance</span></div>
                                <span className="font-mono text-xs text-indigo-300">+{bonus}%</span>
                            </div>
                            );
                        })}
                    </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};
