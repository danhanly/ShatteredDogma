
import React, { useState, useEffect, useRef } from 'react';
import { GameState, GemType, WorshipperType, VesselDefinition } from '../types';
import { VESSEL_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD } from '../constants';
import { ChevronUp, ChevronDown, Lock, AlertTriangle } from 'lucide-react';
import { VesselModal } from './VesselModal';
import { IncrementSelector, IncrementType } from './IncrementSelector';
import { MiraclesTab } from './tabs/MiraclesTab';
import { VesselsTab } from './tabs/VesselsTab';
import { CultTab } from './tabs/CultTab';
import { EndTimesTab } from './tabs/EndTimesTab';

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
  onInfluence?: (source: WorshipperType, target: WorshipperType) => void;
}

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
  highlightVessels = false,
  onInfluence
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<VesselDefinition | null>(null);
  const [miracleIncrement, setMiracleIncrement] = useState<IncrementType>(1);
  const [vesselIncrement, setVesselIncrement] = useState<IncrementType>(1);
  const [confirmInfluence, setConfirmInfluence] = useState<{source: WorshipperType, target: WorshipperType, name: string} | null>(null);
  
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

  const tabs = ['MIRACLES', 'VESSELS', 'END_TIMES', 'CULT'];

  const handleInfluenceClick = (source: WorshipperType, target: WorshipperType, name: string) => {
      setConfirmInfluence({ source, target, name });
  };

  const executeInfluence = () => {
      if (confirmInfluence && onInfluence) {
          onInfluence(confirmInfluence.source, confirmInfluence.target);
          setConfirmInfluence(null);
      }
  };

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
            <MiraclesTab 
                gameState={gameState}
                milestoneState={milestoneState}
                clickPower={clickPower}
                increment={increment}
                onUpgrade={onUpgrade}
                onEquipGem={onEquipGem}
                onInfluenceClick={handleInfluenceClick}
            />
        )}

        {activeTab === 'VESSELS' && (
            <VesselsTab 
                gameState={gameState}
                vesselsUnlocked={vesselsUnlocked}
                visibleVessels={visibleVessels}
                increment={increment}
                vesselImages={vesselImages}
                onPurchaseVessel={onPurchaseVessel}
                onSelectVessel={setSelectedVessel}
            />
        )}

        {activeTab === 'CULT' && (
            <CultTab 
                gameState={gameState}
                vesselsUnlocked={vesselsUnlocked}
                eodUnlocked={eodUnlocked}
            />
        )}

        {activeTab === 'END_TIMES' && (
            <EndTimesTab 
                gameState={gameState}
                eodUnlocked={eodUnlocked}
                endOfDaysUrl={endOfDaysUrl}
                onPrestige={onPrestige}
                onPurchaseRelic={onPurchaseRelic}
            />
        )}
      </div>
    </div>
    
    {/* Influence Confirmation Modal */}
    {confirmInfluence && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-full max-sm rounded-xl border border-red-500/50 bg-eldritch-dark p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                <div className="flex justify-center mb-4"><AlertTriangle className="h-12 w-12 text-red-500 animate-pulse" /></div>
                <h3 className="text-xl font-serif font-bold text-red-500 text-center mb-2">{confirmInfluence.name}</h3>
                <div className="text-center text-gray-300 text-sm space-y-4 mb-6">
                    <p>Are you sure you want to proceed?</p>
                    <div className="bg-black/50 p-3 rounded border border-red-900/50 text-left text-xs">
                        <p className="mb-2"><span className="text-red-400 font-bold">•</span> All <span className="text-white font-bold">{confirmInfluence.source}</span> Vessels will be reset to <span className="text-white font-bold">Level 0</span>.</p>
                        <p><span className="text-red-400 font-bold">•</span> Future <span className="text-white font-bold">{confirmInfluence.source}</span> vessel upgrades will cost <span className="text-red-400 font-bold">+{((gameState.influenceUsage[confirmInfluence.source] || 0) + 1) * 2}%</span> more forever.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={executeInfluence}
                        className="flex-1 bg-red-900/60 border border-red-500/50 text-red-200 py-3 rounded font-bold uppercase tracking-wider hover:bg-red-900 hover:text-white transition-colors"
                    >
                        Accept Risk
                    </button>
                    <button 
                        onClick={() => setConfirmInfluence(null)}
                        className="flex-1 bg-gray-800 border border-gray-600 text-gray-400 py-3 rounded font-bold uppercase tracking-wider hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )}

    <VesselModal 
      vessel={selectedVessel} 
      level={selectedVessel ? (gameState.vesselLevels[selectedVessel.id] || 0) : 0} 
      relicLevels={gameState.relicLevels} 
      influenceUsage={gameState.influenceUsage}
      onClose={() => setSelectedVessel(null)} 
      imageUrl={selectedVessel ? vesselImages[selectedVessel.id] : undefined} 
    />
    </>
  );
};
