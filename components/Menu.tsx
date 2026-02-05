import React, { useState } from 'react';
import { GameState, GemType, WorshipperType } from '../types';
import { GEM_DEFINITIONS, GEM_DISPLAY_ORDER } from '../constants';
import { Sparkles, ArrowUpCircle, ChevronUp, ChevronDown, Crown, Frown, Ghost, Sword } from 'lucide-react';

interface MenuProps {
  gameState: GameState;
  upgradeCost: number;
  clickPower: number;
  canAfford: boolean;
  onUpgrade: () => void;
  onEquipGem: (gem: GemType) => void;
  milestoneState: { isMilestone: boolean, definition?: any };
}

// Map WorshipperType to Lucide Icons
const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown, // Changed from Briefcase
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword, // Changed from Crown
  [WorshipperType.INDOLENT]: Ghost,
};

export const Menu: React.FC<MenuProps> = ({
  gameState,
  upgradeCost,
  clickPower,
  canAfford,
  onUpgrade,
  onEquipGem,
  milestoneState
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);

  // Helper to determine active gem color for button border
  const getActiveGemBorder = () => {
    if (gameState.equippedGem === GemType.NONE) return 'border-eldritch-crimson hover:border-red-400';
    
    // Extract base color class from GEM_DEFINITION (e.g., bg-green-900)
    // and map it to a border equivalent approximately
    const gemDef = GEM_DEFINITIONS[gameState.equippedGem];
    if (gemDef.favoredType === WorshipperType.WORLDLY) return 'border-green-600 hover:border-green-400';
    if (gemDef.favoredType === WorshipperType.LOWLY) return 'border-gray-500 hover:border-gray-300';
    if (gemDef.favoredType === WorshipperType.ZEALOUS) return 'border-red-600 hover:border-red-400';
    if (gemDef.favoredType === WorshipperType.INDOLENT) return 'border-blue-600 hover:border-blue-400';
    
    return 'border-eldritch-crimson hover:border-red-400';
  };

  const UpgradeIcon = milestoneState.isMilestone && milestoneState.definition 
    ? ICON_MAP[milestoneState.definition.type as WorshipperType] 
    : ArrowUpCircle;

  return (
    <div 
      className={`flex w-full shrink-0 flex-col bg-eldritch-black shadow-[0_-5px_20px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out lg:h-full lg:w-[400px] lg:border-l lg:border-eldritch-grey/30 lg:shadow-none
      ${isMobileExpanded ? 'h-[50vh]' : 'h-[12vh]'}
      `}
    >
      {/* Mobile Toggle Handle */}
      <button 
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="flex h-6 w-full items-center justify-center border-t border-eldritch-grey/50 bg-eldritch-dark hover:bg-eldritch-grey/20 lg:hidden"
      >
        {isMobileExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <div className="flex flex-col items-center">
             <ChevronUp className="h-4 w-4 text-eldritch-gold animate-bounce" />
          </div>
        )}
      </button>

      {/* Tabs area */}
      <div className="flex shrink-0 border-b border-eldritch-grey/30 px-4 pt-2">
        <button className="border-b-2 border-eldritch-gold pb-2 font-serif text-lg font-bold text-eldritch-gold">
          Miracles
        </button>
        <button className="ml-6 pb-2 font-serif text-lg text-gray-600 cursor-not-allowed hidden sm:block">
          Rituals
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pr-2 scrollbar-thin scrollbar-thumb-eldritch-grey/50">
        {/* Main Upgrade / Milestone Section */}
        <section className={`mb-6 rounded-xl border border-eldritch-grey/20 bg-eldritch-dark p-3 sm:p-4 ${milestoneState.isMilestone ? 'ring-1 ring-eldritch-gold/30' : ''}`}>
          <div className="flex items-center justify-between mb-2">
             <h3 className={`font-serif text-lg ${milestoneState.isMilestone ? 'text-eldritch-gold' : 'text-white'}`}>
                {milestoneState.isMilestone ? milestoneState.definition.name : 'Dark Miracle'}
             </h3>
             <span className="text-xs text-gray-400">Lvl {gameState.miracleLevel}</span>
          </div>
          
          <div className="mb-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-500">
               {milestoneState.isMilestone ? 'Milestone Reward:' : 'Power:'}
            </span>
            <span className="font-bold text-white">
               {milestoneState.isMilestone ? 'Ascension' : `+${clickPower} / Tap`}
            </span>
          </div>
          
          {milestoneState.isMilestone && (
            <div className="mb-3 text-xs italic text-gray-400">
               "{milestoneState.definition.description}"
            </div>
          )}

          <button
            onClick={onUpgrade}
            disabled={!canAfford}
            className={`group relative flex w-full items-center justify-between overflow-hidden rounded-lg border p-3 transition-all duration-300
              ${getActiveGemBorder()}
              ${canAfford 
                ? 'cursor-pointer bg-gradient-to-r from-eldritch-black to-eldritch-blood/20 shadow-[0_0_20px_rgba(138,3,3,0.3)]' 
                : 'cursor-not-allowed border-gray-800 bg-gray-900 opacity-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <UpgradeIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${canAfford ? 'text-white' : 'text-gray-600'} ${milestoneState.isMilestone ? 'text-eldritch-gold' : ''}`} />
              <div className="text-left">
                <div className={`text-sm sm:text-base font-bold ${canAfford ? 'text-white' : 'text-gray-500'}`}>
                  {milestoneState.isMilestone ? 'Unlock Milestone' : 'Enhance'}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400">
                   {milestoneState.isMilestone ? 'Specific Sacrifice' : 'Sacrifice followers'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-mono text-base sm:text-lg font-bold ${canAfford ? 'text-red-400' : 'text-gray-600'}`}>
                {upgradeCost.toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500">
                 {milestoneState.isMilestone && milestoneState.definition 
                    ? `${milestoneState.definition.type} Only`
                    : 'All Worshippers'
                 }
              </div>
            </div>
            
            {canAfford && (
              <div className="absolute inset-0 -z-10 animate-pulse bg-red-900/10" />
            )}
          </button>
        </section>

        {/* Gem Enhancement Section */}
        <section className="rounded-xl border border-eldritch-grey/20 bg-eldritch-dark p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
             <h3 className="font-serif text-lg text-white">Focus Gems</h3>
             {gameState.equippedGem !== GemType.NONE && (
               <div className={`h-2 w-2 rounded-full ${GEM_DEFINITIONS[gameState.equippedGem].color.split(' ')[0]}`} />
             )}
          </div>

          <div className="flex flex-col gap-2">
            {GEM_DISPLAY_ORDER.map((gem) => {
                const isEquipped = gameState.equippedGem === gem;
                const def = GEM_DEFINITIONS[gem];
                const GemIcon = def.favoredType ? ICON_MAP[def.favoredType] : Sparkles;
                
                return (
                  <button
                    key={gem}
                    onClick={() => onEquipGem(isEquipped ? GemType.NONE : gem)}
                    className={`group relative flex items-center gap-3 rounded-lg border p-2 transition-all text-left
                      ${isEquipped 
                        ? `border-white/30 bg-gradient-to-r from-gray-900 to-black` 
                        : 'border-transparent bg-black/20 hover:bg-white/5'
                      }`}
                  >
                    {/* Status Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors ${isEquipped ? def.color.split(' ')[0].replace('bg-', 'bg-') : 'bg-transparent'}`} />

                    <div className={`shrink-0 h-10 w-10 rounded-full border shadow-sm flex items-center justify-center ${def.color} ${isEquipped ? 'ring-2 ring-white/20' : 'opacity-70 group-hover:opacity-100'}`}>
                       <GemIcon className="h-5 w-5 text-white/90" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm truncate ${isEquipped ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                        {def.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate group-hover:text-gray-400">
                        {def.description}
                      </div>
                    </div>

                    {isEquipped && (
                       <div className="text-xs font-bold uppercase text-eldritch-gold tracking-widest mr-1">Active</div>
                    )}
                  </button>
                );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};