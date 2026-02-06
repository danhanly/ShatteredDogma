
import React, { useState, useEffect, useRef } from 'react';
import { GameState, GemType, WorshipperType, VesselId, VesselDefinition, RelicId, WORSHIPPER_ORDER } from '../types';
import { GEM_DEFINITIONS, GEM_DISPLAY_ORDER, VESSEL_DEFINITIONS, RELIC_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD } from '../constants';
import { calculateVesselCost, calculateVesselOutput, calculateBulkUpgrade, calculateBulkVesselBuy, calculateSoulsEarned, calculateRelicCost, calculatePassiveIncomeByType } from '../services/gameService';
import { Sparkles, ArrowUpCircle, ChevronUp, ChevronDown, Crown, Frown, Ghost, Sword, User, Info, Skull, Orbit, BarChart2, Lock, Activity } from 'lucide-react';
import { VesselModal } from './VesselModal';
import { formatNumber } from '../utils/format';
import { IncrementSelector, IncrementType } from './IncrementSelector';

interface MenuProps {
  gameState: GameState;
  clickPower: number;
  activeTab: 'MIRACLES' | 'VESSELS' | 'CULT' | 'END_TIMES';
  setActiveTab: (tab: any) => void;
  onUpgrade: (count: number) => void;
  onEquipGem: (gem: GemType) => void;
  milestoneState: { isMilestone: boolean, definition?: any };
  onPurchaseVessel: (id: string, type: WorshipperType, count: number) => void;
  vesselImages: Record<string, string>;
  onPrestige: () => void;
  onPurchaseRelic: (relicId: string) => void;
  endOfDaysUrl: string;
  highlightVessels?: boolean;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

export const Menu: React.FC<MenuProps> = ({
  gameState,
  clickPower,
  activeTab,
  setActiveTab,
  onUpgrade,
  onEquipGem,
  milestoneState,
  onPurchaseVessel,
  vesselImages,
  onPrestige,
  onPurchaseRelic,
  endOfDaysUrl,
  highlightVessels = false
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<VesselDefinition | null>(null);
  const [miracleIncrement, setMiracleIncrement] = useState<IncrementType>(1);
  const [vesselIncrement, setVesselIncrement] = useState<IncrementType>(1);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Independent increment tracking
  const increment = activeTab === 'MIRACLES' ? miracleIncrement : vesselIncrement;
  const setIncrement = (val: IncrementType) => {
    if (activeTab === 'MIRACLES') setMiracleIncrement(val);
    else if (activeTab === 'VESSELS') setVesselIncrement(val);
  };

  // Reset scroll on tab switch
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

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

  const vesselsUnlocked = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 100;
  const eodUnlocked = gameState.maxTotalWorshippers >= PRESTIGE_UNLOCK_THRESHOLD;

  const visibleVessels: VesselDefinition[] = [];
  if (vesselsUnlocked) {
    let nextFound = false;
    for (const vessel of VESSEL_DEFINITIONS) {
      if (gameState.vesselLevels[vessel.id]) visibleVessels.push(vessel);
      else if (!nextFound) { visibleVessels.push(vessel); nextFound = true; }
    }
  }

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

  const soulsToEarn = calculateSoulsEarned(gameState.totalAccruedWorshippers);

  const handlePrestigeClick = () => {
      if (window.confirm("Are you sure? This will wipe your worshippers and vessels to grant you Souls based on your total accrued population for this era.")) {
          onPrestige();
      }
  };

  const currentTypeRates = calculatePassiveIncomeByType(gameState.vesselLevels, gameState.relicLevels);
  const totalRate = Object.values(currentTypeRates).reduce((a: number, b: number) => a + b, 0);

  const tabs = ['MIRACLES', 'VESSELS', 'END_TIMES', 'CULT'];

  return (
    <>
    <div 
      className={`flex w-full shrink-0 flex-col bg-eldritch-black shadow-[0_-5px_20px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out lg:h-full lg:w-[400px] lg:border-l lg:border-eldritch-grey/30 lg:shadow-none
      ${isMobileExpanded ? 'h-[60dvh]' : 'h-[12dvh]'}
      `}
    >
      <button 
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="flex h-6 w-full items-center justify-center border-t border-eldritch-grey/50 bg-eldritch-dark hover:bg-eldritch-grey/20 lg:hidden"
      >
        {isMobileExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronUp className="h-4 w-4 text-eldritch-gold animate-bounce" />}
      </button>

      <div className="flex shrink-0 border-b border-eldritch-grey/30 px-4 pt-2 gap-4 sm:gap-6 overflow-x-auto scrollbar-none">
        {tabs.map(tab => {
          let isLocked = false;
          if (tab === 'VESSELS' && !vesselsUnlocked) isLocked = true;
          if (tab === 'END_TIMES' && !eodUnlocked) isLocked = true;
          
          let highlightClass = "";
          if (tab === 'VESSELS' && highlightVessels) {
              highlightClass = "animate-pulse text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]";
          }

          return (
            <button 
                key={tab}
                onClick={() => !isLocked && setActiveTab(tab)}
                disabled={isLocked}
                className={`flex items-center gap-1.5 pb-2 font-serif text-xs sm:text-sm font-bold transition-all whitespace-nowrap 
                  ${activeTab === tab 
                      ? 'text-eldritch-gold border-b-2 border-eldritch-gold' 
                      : (isLocked ? 'text-gray-600 opacity-50 cursor-not-allowed' : 'text-gray-500 hover:text-gray-300')
                  }
                  ${highlightClass}
                `}
            >
              {isLocked && <Lock className="h-3 w-3" />}
              {tab.replace('_', ' ')}
            </button>
          )
        })}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pr-2 scrollbar-thin scrollbar-thumb-eldritch-grey/50 pb-32"
      >
        {(activeTab === 'MIRACLES' || (activeTab === 'VESSELS' && vesselsUnlocked)) && <IncrementSelector current={increment} onChange={setIncrement} />}

        {activeTab === 'MIRACLES' && (
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
            <section className="relative rounded-xl border border-eldritch-gold/30 bg-eldritch-dark p-3 sm:p-4 animate-in fade-in duration-700 shadow-[0_0_20px_rgba(197,160,89,0.1)]">
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
          </>
        )}

        {activeTab === 'VESSELS' && vesselsUnlocked && (
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
                                 <button onClick={() => setSelectedVessel(vessel)} className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 bg-black hover:scale-105 transition-transform overflow-hidden ${typeColor.split(' ')[1]}`}>
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
        )}

        {activeTab === 'CULT' && (
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
        )}

        {activeTab === 'END_TIMES' && eodUnlocked && (
            <div className={`flex flex-col gap-6 animate-in fade-in duration-700`}>
                <div className="relative w-full rounded-xl overflow-hidden border border-indigo-900/50 shadow-[0_0_30px_rgba(49,46,129,0.3)]">
                    <div className="aspect-video w-full bg-black relative">
                        {endOfDaysUrl ? <img src={endOfDaysUrl} alt="End of Days" className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-950"><Skull className="h-16 w-16 text-indigo-500 opacity-50" /></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-eldritch-black via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4"><h2 className="font-serif text-2xl font-bold text-white drop-shadow-md">Herald the End Times</h2></div>
                    </div>
                    <div className="p-4 bg-eldritch-dark">
                        <p className="text-sm text-gray-300 italic mb-4 leading-relaxed">"To begin again is the only way to truly ascend. Burn the world you have built, sacrifice the flock you have gathered, and reap the Souls of the faithful to forge artifacts of eternal power."</p>
                        <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-indigo-500/20 mb-4">
                            <span className="text-gray-400 text-sm">Souls to Reap:</span>
                            <div className="flex items-center gap-2"><Orbit className="h-5 w-5 text-indigo-400" /><span className="font-mono text-xl font-bold text-indigo-300">+{formatNumber(soulsToEarn)}</span></div>
                        </div>
                        <button onClick={handlePrestigeClick} disabled={soulsToEarn <= 0} className={`w-full py-3 rounded-lg font-serif font-bold uppercase tracking-widest transition-all ${soulsToEarn > 0 ? 'bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-gray-900 text-gray-500 cursor-not-allowed'}`}>{soulsToEarn > 0 ? 'Trigger The Apocalypse' : 'Not Enough Souls'}</button>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2"><h3 className="font-serif text-lg text-indigo-300">Relic Shop</h3><div className="h-px flex-1 bg-indigo-900/50" /></div>
                    {RELIC_DEFINITIONS.map(relic => {
                        const level = gameState.relicLevels[relic.id] || 0;
                        const cost = calculateRelicCost(relic.id, level);
                        const canAfford = gameState.souls >= cost;
                        return (
                            <div key={relic.id} className="relative rounded-lg border border-indigo-900/30 bg-black/40 p-3 hover:border-indigo-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div><h4 className="font-serif text-sm font-bold text-indigo-200">{relic.name}</h4><p className="text-xs text-gray-500">{relic.description}</p></div>
                                    <div className="bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/20"><span className="text-[10px] font-bold text-indigo-300">Lvl {level}</span></div>
                                </div>
                                <button onClick={() => onPurchaseRelic(relic.id)} disabled={!canAfford} className={`flex w-full items-center justify-between rounded px-3 py-2 mt-2 transition-all ${canAfford ? 'bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/30 cursor-pointer' : 'bg-gray-900/50 border border-transparent cursor-not-allowed opacity-50'}`}><span className={`text-xs font-bold ${canAfford ? 'text-indigo-200' : 'text-gray-500'}`}>Purchase</span><div className="flex items-center gap-1"><span className={`font-mono text-sm font-bold ${canAfford ? 'text-white' : 'text-gray-500'}`}>{formatNumber(cost)}</span><Orbit className={`h-3 w-3 ${canAfford ? 'text-indigo-400' : 'text-gray-600'}`} /></div></button>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
    <VesselModal vessel={selectedVessel} level={selectedVessel ? (gameState.vesselLevels[selectedVessel.id] || 0) : 0} relicLevels={gameState.relicLevels} onClose={() => setSelectedVessel(null)} imageUrl={selectedVessel ? vesselImages[selectedVessel.id] : undefined} />
    </>
  );
};
