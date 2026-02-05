import React, { useState } from 'react';
import { GameState, GemType, WorshipperType, VesselDefinition } from '../types';
import { GEM_DEFINITIONS, GEM_DISPLAY_ORDER, VESSEL_DEFINITIONS } from '../constants';
import { calculateVesselCost, calculateVesselOutput } from '../services/gameService';
import { Sparkles, ArrowUpCircle, ChevronUp, ChevronDown, Crown, Frown, Ghost, Sword, User, Info } from 'lucide-react';
import { VesselModal } from './VesselModal';

interface MenuProps {
  gameState: GameState;
  upgradeCost: number;
  clickPower: number;
  canAfford: boolean;
  onUpgrade: () => void;
  onEquipGem: (gem: GemType) => void;
  milestoneState: { isMilestone: boolean, definition?: any };
  onPurchaseVessel: (id: string, type: WorshipperType) => void;
  vesselImages: Record<string, string>;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

type Tab = 'MIRACLES' | 'VESSELS';

export const Menu: React.FC<MenuProps> = ({
  gameState,
  upgradeCost,
  clickPower,
  canAfford,
  onUpgrade,
  onEquipGem,
  milestoneState,
  onPurchaseVessel,
  vesselImages
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('MIRACLES');
  const [selectedVessel, setSelectedVessel] = useState<VesselDefinition | null>(null);

  const getActiveGemBorder = () => {
    if (gameState.equippedGem === GemType.NONE) return 'border-eldritch-crimson hover:border-red-400';
    
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

  const unlockedGems = GEM_DISPLAY_ORDER.filter(gem => gameState.unlockedGems.includes(gem));

  // Determine unlocked vessels
  // Logic: Show all bought vessels, plus the next one in the array
  const visibleVessels: VesselDefinition[] = [];
  let nextFound = false;
  
  for (const vessel of VESSEL_DEFINITIONS) {
    if (gameState.vesselLevels[vessel.id]) {
        visibleVessels.push(vessel);
    } else if (!nextFound) {
        visibleVessels.push(vessel);
        nextFound = true;
    }
  }

  return (
    <>
    <div 
      className={`flex w-full shrink-0 flex-col bg-eldritch-black shadow-[0_-5px_20px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out lg:h-full lg:w-[400px] lg:border-l lg:border-eldritch-grey/30 lg:shadow-none
      ${isMobileExpanded ? 'h-[60vh]' : 'h-[12vh]'}
      `}
    >
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

      <div className="flex shrink-0 border-b border-eldritch-grey/30 px-4 pt-2 gap-6">
        <button 
            onClick={() => setActiveTab('MIRACLES')}
            className={`pb-2 font-serif text-lg font-bold transition-colors ${activeTab === 'MIRACLES' ? 'text-eldritch-gold border-b-2 border-eldritch-gold' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Miracles
        </button>
        <button 
            onClick={() => setActiveTab('VESSELS')}
            className={`pb-2 font-serif text-lg font-bold transition-colors ${activeTab === 'VESSELS' ? 'text-eldritch-gold border-b-2 border-eldritch-gold' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Vessels
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pr-2 scrollbar-thin scrollbar-thumb-eldritch-grey/50">
        
        {activeTab === 'MIRACLES' && (
          <>
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
              {canAfford && <div className="absolute inset-0 -z-10 animate-pulse bg-red-900/10" />}
            </button>
          </section>

          {unlockedGems.length > 0 && (
            <section className="relative rounded-xl border border-eldritch-gold/30 bg-eldritch-dark p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_20px_rgba(197,160,89,0.1)]">
              <div className="mb-3 flex items-center justify-between">
                 <h3 className="font-serif text-lg text-eldritch-gold">Focus Gems</h3>
                 <Sparkles className="h-4 w-4 text-eldritch-gold animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                {unlockedGems.map((gem) => {
                    const isEquipped = gameState.equippedGem === gem;
                    const def = GEM_DEFINITIONS[gem];
                    const GemIcon = def.favoredType ? ICON_MAP[def.favoredType] : Sparkles;
                    
                    return (
                      <button
                        key={gem}
                        onClick={() => onEquipGem(isEquipped ? GemType.NONE : gem)}
                        className={`group relative flex items-center gap-3 rounded-lg border p-2 transition-all text-left animate-in zoom-in-95 duration-500
                          ${isEquipped 
                            ? `border-white/30 bg-gradient-to-r from-gray-900 to-black` 
                            : 'border-transparent bg-black/20 hover:bg-white/5'
                          }`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors ${isEquipped ? def.color.split(' ')[0] : 'bg-transparent'}`} />

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
          )}
          </>
        )}

        {activeTab === 'VESSELS' && (
             <div className="flex flex-col gap-4 pb-8">
                 <div className="text-xs italic text-gray-400 text-center mb-2">
                     Recruit vessels to passively accrue worshippers.
                 </div>
                 
                 {visibleVessels.map((vessel) => {
                     const level = gameState.vesselLevels[vessel.id] || 0;
                     const cost = calculateVesselCost(vessel.id, level);
                     const output = calculateVesselOutput(vessel.id, level);
                     const canBuy = gameState.worshippers[vessel.type] >= cost;
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
                                 {/* Portrait Button */}
                                 <button 
                                    onClick={() => setSelectedVessel(vessel)}
                                    className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 bg-black hover:scale-105 transition-transform overflow-hidden ${typeColor.split(' ')[1]}`}
                                 >
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={vessel.name} className="h-full w-full object-cover object-top scale-125" />
                                    ) : (
                                        <User className={`h-8 w-8 ${typeColor.split(' ')[0]}`} />
                                    )}
                                    
                                    <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                                        <Info className="h-2 w-2 text-white" />
                                    </div>
                                 </button>
                                 
                                 <div className="flex-1 min-w-0 flex justify-between items-start">
                                     <div className="min-w-0 mr-1">
                                         <h4 className={`font-serif text-sm font-bold truncate ${typeColor.split(' ')[0]}`}>{vessel.name}</h4>
                                         <p className="text-xs text-gray-500 truncate">{vessel.subtitle}</p>
                                         <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400">
                                             <span>Rate: +{output}/s</span>
                                         </div>
                                     </div>
                                     
                                     {level > 0 && (
                                         <div className="shrink-0 rounded bg-black/40 px-2 py-1 border border-white/10">
                                            <span className="text-[10px] font-bold text-eldritch-gold">Lvl {level}</span>
                                         </div>
                                     )}
                                 </div>
                             </div>

                             {/* Upgrade Button */}
                             <button
                                onClick={() => onPurchaseVessel(vessel.id, vessel.type)}
                                disabled={!canBuy}
                                className={`flex w-full items-center justify-between rounded px-3 py-2 transition-all
                                    ${canBuy 
                                        ? 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 border border-white/10' 
                                        : 'bg-black/40 cursor-not-allowed opacity-60 border border-transparent'
                                    }
                                `}
                             >
                                 <span className="text-xs font-bold text-gray-300">
                                     {level === 0 ? 'Recruit' : 'Upgrade'}
                                 </span>
                                 <div className="flex items-center gap-1.5">
                                     <span className={`font-mono text-sm font-bold ${canBuy ? 'text-white' : 'text-gray-500'}`}>
                                         {cost.toLocaleString()}
                                     </span>
                                     <TypeIcon className={`h-3 w-3 ${typeColor.split(' ')[0]}`} />
                                 </div>
                             </button>
                         </div>
                     );
                 })}
             </div>
        )}
      </div>
    </div>
    
    <VesselModal 
        vessel={selectedVessel}
        level={selectedVessel ? (gameState.vesselLevels[selectedVessel.id] || 0) : 0}
        onClose={() => setSelectedVessel(null)}
        imageUrl={selectedVessel ? vesselImages[selectedVessel.id] : undefined}
    />
    </>
  );
};