
import React from 'react';
import { GameState, GemType, WorshipperType, WORSHIPPER_ORDER } from '../../types';
import { GEM_DEFINITIONS, GEM_DISPLAY_ORDER } from '../../constants';
import { calculateBulkUpgrade } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { ArrowUpCircle, Crown, Frown, Ghost, Sword, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { IncrementType } from '../IncrementSelector';

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

interface MiraclesTabProps {
  gameState: GameState;
  milestoneState: { isMilestone: boolean, definition?: any };
  clickPower: number;
  increment: IncrementType;
  onUpgrade: (count: number) => void;
  onEquipGem: (gem: GemType) => void;
  onInfluence?: (source: WorshipperType, target: WorshipperType) => void;
  onInfluenceClick: (source: WorshipperType, target: WorshipperType, name: string) => void;
}

export const MiraclesTab: React.FC<MiraclesTabProps> = ({
  gameState,
  milestoneState,
  clickPower,
  increment,
  onUpgrade,
  onEquipGem,
  onInfluenceClick
}) => {
  
  const unlockedGems = GEM_DISPLAY_ORDER.filter(gem => gameState.unlockedGems.includes(gem));
  const abyssUnlocked = gameState.miracleLevel > 50;

  const UpgradeIcon = milestoneState.isMilestone && milestoneState.definition 
    ? ICON_MAP[milestoneState.definition.type as WorshipperType] 
    : ArrowUpCircle;

  const bulkUpgrade = calculateBulkUpgrade(gameState.miracleLevel, increment, gameState);
  
  let canAffordUpgrade = false;
  if (milestoneState.isMilestone && milestoneState.definition) {
     canAffordUpgrade = gameState.worshippers[milestoneState.definition.type as WorshipperType] >= bulkUpgrade.cost;
  } else {
     const availableFunds = WORSHIPPER_ORDER
        .filter(t => !gameState.lockedWorshippers.includes(t))
        .reduce((sum, t) => sum + gameState.worshippers[t], 0);
     
     canAffordUpgrade = availableFunds >= bulkUpgrade.cost && bulkUpgrade.count > 0;
  }

  const getActiveGemBorder = () => {
    if (gameState.equippedGem === GemType.NONE) return 'border-eldritch-crimson hover:border-red-400';
    const gemDef = GEM_DEFINITIONS[gameState.equippedGem];
    if (gemDef.favoredType === WorshipperType.WORLDLY) return 'border-green-600 hover:border-green-400';
    if (gemDef.favoredType === WorshipperType.LOWLY) return 'border-gray-500 hover:border-gray-300';
    if (gemDef.favoredType === WorshipperType.ZEALOUS) return 'border-red-600 hover:border-red-400';
    if (gemDef.favoredType === WorshipperType.INDOLENT) return 'border-blue-600 hover:border-blue-400';
    return 'border-eldritch-crimson hover:border-red-400';
  };

  const INFLUENCES = [
      { 
        name: 'Motivate the Torpid', 
        source: WorshipperType.INDOLENT, 
        target: WorshipperType.LOWLY, 
        action: 'Motivate',
        flavor: "Through suffering, the lazy are broken. Through breaking, they find purpose."
      },
      { 
        name: 'Invest in the Poor', 
        source: WorshipperType.LOWLY, 
        target: WorshipperType.WORLDLY, 
        action: 'Invest',
        flavor: "Lift them from the gutter, dress them in silk, and watch as their gratitude turns to ambition."
      },
      { 
        name: 'Stoke The Fires of Zeal', 
        source: WorshipperType.WORLDLY, 
        target: WorshipperType.ZEALOUS, 
        action: 'Stoke',
        flavor: "Strip away their gold, burn their estates, and leave them with nothing but the burning truth."
      },
  ];

  return (
    <>
      <section className={`mb-6 rounded-xl border border-eldritch-grey/20 bg-eldritch-dark p-3 sm:p-4 ${milestoneState.isMilestone ? 'ring-1 ring-eldritch-gold/30' : ''}`}>
        <div className="flex items-center justify-between mb-2">
            <h3 className={`font-serif text-lg ${milestoneState.isMilestone ? 'text-eldritch-gold' : 'text-white'}`}>{milestoneState.isMilestone ? milestoneState.definition.name : 'Dark Miracle'}</h3>
            <span className="text-xs text-gray-400">Lvl {gameState.miracleLevel}</span>
        </div>
        <div className="mb-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-500">{milestoneState.isMilestone ? 'Milestone Reward:' : 'Power:'}</span>
            <span className="font-bold text-white">{milestoneState.isMilestone ? 'Ascension' : `+${formatNumber(clickPower)} / Tap`}</span>
        </div>
        {milestoneState.isMilestone && <div className="mb-3 text-xs italic text-gray-400">"{milestoneState.definition.description}"</div>}
        <button
            onClick={() => onUpgrade(bulkUpgrade.count)}
            disabled={!canAffordUpgrade}
            className={`group relative flex w-full items-center justify-between overflow-hidden rounded-lg border p-3 transition-all duration-300 ${getActiveGemBorder()} ${canAffordUpgrade ? 'cursor-pointer bg-gradient-to-r from-eldritch-black to-eldritch-blood/20 shadow-[0_0_20px_rgba(138,3,3,0.3)]' : 'cursor-not-allowed border-gray-800 bg-gray-900 opacity-50'}`}
        >
            <div className="flex items-center gap-3">
            <UpgradeIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${canAffordUpgrade ? 'text-white' : 'text-gray-600'} ${milestoneState.isMilestone ? 'text-eldritch-gold' : ''}`} />
            <div className="text-left">
                <div className={`text-sm sm:text-base font-bold ${canAffordUpgrade ? 'text-white' : 'text-gray-500'}`}>{milestoneState.isMilestone ? 'Unlock Milestone' : increment === 1 ? 'Enhance' : `Enhance x${bulkUpgrade.count}`}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">{milestoneState.isMilestone ? 'Specific Sacrifice' : 'Sacrifice followers'}</div>
            </div>
            </div>
            <div className="text-right">
            <div className={`font-mono text-base sm:text-lg font-bold ${canAffordUpgrade ? 'text-red-400' : 'text-gray-600'}`}>{formatNumber(bulkUpgrade.cost)}</div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500">{milestoneState.isMilestone && milestoneState.definition ? `${milestoneState.definition.type} Only` : 'All Worshippers'}</div>
            </div>
        </button>
      </section>

      {unlockedGems.length > 0 && (
        <section className="relative rounded-xl border border-eldritch-gold/30 bg-eldritch-dark p-3 sm:p-4 animate-in fade-in duration-700 shadow-[0_0_20px_rgba(197,160,89,0.1)] mb-6">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-serif text-lg text-eldritch-gold">Focus Gems</h3><Sparkles className="h-4 w-4 text-eldritch-gold animate-pulse" /></div>
            <div className="flex flex-col gap-2">
            {unlockedGems.map((gem) => {
                const isEquipped = gameState.equippedGem === gem;
                const def = GEM_DEFINITIONS[gem];
                const GemIcon = def.favoredType ? ICON_MAP[def.favoredType] : Sparkles;
                return (
                    <button key={gem} onClick={() => onEquipGem(isEquipped ? GemType.NONE : gem)} className={`group relative flex items-center gap-3 rounded-lg border p-2 transition-all text-left ${isEquipped ? `border-white/30 bg-gradient-to-r from-gray-900 to-black` : 'border-transparent bg-black/20 hover:bg-white/5'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors ${isEquipped ? def.color.split(' ')[0] : 'bg-transparent'}`} />
                    <div className={`shrink-0 h-10 w-10 rounded-full border shadow-sm flex items-center justify-center ${def.color} ${isEquipped ? 'ring-2 ring-white/20' : 'opacity-70 group-hover:opacity-100'}`}><GemIcon className="h-5 w-5 text-white/90" /></div>
                    <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate ${isEquipped ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{def.name}</div>
                        <div className="text-xs text-gray-500 truncate group-hover:text-gray-400">{def.description}</div>
                    </div>
                    </button>
                );
            })}
            </div>
        </section>
      )}

      {abyssUnlocked && (
            <section className="relative rounded-xl border border-purple-900/50 bg-eldritch-dark p-3 sm:p-4 animate-in fade-in duration-700 shadow-[0_0_20px_rgba(88,28,135,0.2)]">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-serif text-lg text-purple-300">Influence of the Abyss</h3><Eye className="h-4 w-4 text-purple-500" /></div>
            <div className="space-y-4">
                {INFLUENCES.map((inf) => {
                    const canAfford = gameState.worshippers[inf.source] > 0;
                    const SourceIcon = ICON_MAP[inf.source];
                    const TargetIcon = ICON_MAP[inf.target];
                    const isGlowing = (Date.now() - (gameState.lastInfluenceTime[inf.source] || 0)) < 120000;
                    
                    const getColor = (t: WorshipperType) => {
                        if (t === WorshipperType.INDOLENT) return 'text-blue-400';
                        if (t === WorshipperType.LOWLY) return 'text-gray-400';
                        if (t === WorshipperType.WORLDLY) return 'text-green-400';
                        if (t === WorshipperType.ZEALOUS) return 'text-red-500';
                        return 'text-gray-400';
                    }

                    return (
                        <div key={inf.name} className={`rounded-lg bg-black/40 border p-3 transition-all duration-1000 ${isGlowing ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-purple-500/10'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-sm text-gray-300">{inf.name}</h4>
                                <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-white/5">
                                    <SourceIcon className={`h-4 w-4 ${getColor(inf.source)}`} />
                                    <ArrowRight className="h-3 w-3 text-purple-500/50" />
                                    <TargetIcon className={`h-4 w-4 ${getColor(inf.target)}`} />
                                </div>
                            </div>
                            
                            <p className="mb-4 text-xs italic text-purple-200/50 leading-relaxed px-1">
                                "{inf.flavor}"
                            </p>

                            <button
                                disabled={!canAfford}
                                onClick={() => onInfluenceClick(inf.source, inf.target, inf.name)}
                                className={`w-full py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors ${canAfford ? 'bg-purple-900/30 text-purple-200 hover:bg-purple-900/50 border border-purple-500/30' : 'bg-gray-900 text-gray-600 border border-transparent cursor-not-allowed'}`}
                            >
                                {inf.action}
                            </button>
                        </div>
                    )
                })}
            </div>
            </section>
      )}
    </>
  );
};
