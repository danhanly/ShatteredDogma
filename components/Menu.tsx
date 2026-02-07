
import React, { useState, useEffect, useRef } from 'react';
import { GameState, WorshipperType, VesselDefinition, GemType } from '../types';
import { VESSEL_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD } from '../constants';
import { ChevronUp, ChevronDown, Lock } from 'lucide-react';
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
  onPurchaseVessel: (id: string, type: WorshipperType, count: number) => void;
  onPurchaseAssistant: (count: number) => void;
  onActivateGem: (gem: GemType) => void;
  vesselImages: Record<string, string>;
  assistantUrl: string;
  onPrestige: () => void;
  endOfDaysUrl: string;
  highlightVessels?: boolean;
  highlightAssistant?: boolean;
  highlightGem?: GemType | null;
}

export const Menu: React.FC<MenuProps> = ({
  gameState,
  clickPower,
  activeTab,
  setActiveTab,
  onUpgrade,
  onPurchaseVessel,
  onPurchaseAssistant,
  onActivateGem,
  vesselImages,
  assistantUrl,
  onPrestige,
  endOfDaysUrl,
  highlightVessels = false,
  highlightAssistant = false,
  highlightGem = null
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<VesselDefinition | null>(null);
  const [miracleIncrement, setMiracleIncrement] = useState<IncrementType>(1);
  const [vesselIncrement, setVesselIncrement] = useState<IncrementType>(1);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const increment = activeTab === 'MIRACLES' ? miracleIncrement : vesselIncrement;
  const setIncrement = (val: IncrementType) => {
    if (activeTab === 'MIRACLES') setMiracleIncrement(val);
    else if (activeTab === 'VESSELS') setVesselIncrement(val);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  }, [activeTab]);

  // Handle auto-switch to Miracles tab on gem unlock
  const prevGemsCount = useRef(gameState.unlockedGems.length);
  useEffect(() => {
    if (gameState.unlockedGems.length > prevGemsCount.current) {
        setActiveTab('MIRACLES');
        prevGemsCount.current = gameState.unlockedGems.length;
    }
  }, [gameState.unlockedGems.length, setActiveTab]);

  const vesselsUnlocked = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 100;
  
  // End Times Threshold check: 100,000 Zealous
  const eodUnlocked = gameState.maxWorshippersByType[WorshipperType.ZEALOUS] >= PRESTIGE_UNLOCK_THRESHOLD;

  const visibleVessels: VesselDefinition[] = [];
  if (vesselsUnlocked) {
    let nextFound = false;
    for (const vessel of VESSEL_DEFINITIONS) {
      if (gameState.vesselLevels[vessel.id]) visibleVessels.push(vessel);
      else if (!nextFound) { visibleVessels.push(vessel); nextFound = true; }
    }
  }

  const tabs = ['MIRACLES', 'VESSELS', 'END_TIMES', 'CULT'];

  return (
    <>
    <div className={`flex w-full shrink-0 flex-col bg-eldritch-black shadow-[0_-5px_20px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out lg:h-full lg:w-[400px] lg:border-l lg:border-eldritch-grey/30 lg:shadow-none ${isMobileExpanded ? 'h-[60dvh]' : 'h-[12dvh]'}`}>
      <button onClick={() => setIsMobileExpanded(!isMobileExpanded)} className="flex h-6 w-full items-center justify-center border-t border-eldritch-grey/50 bg-eldritch-dark hover:bg-eldritch-grey/20 lg:hidden">
        {isMobileExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronUp className="h-4 w-4 text-eldritch-gold animate-bounce" />}
      </button>

      <div className="flex shrink-0 border-b border-eldritch-grey/30 px-4 pt-2 gap-4 sm:gap-6 overflow-x-auto scrollbar-none">
        {tabs.map(tab => {
          const isLocked = (tab === 'VESSELS' && !vesselsUnlocked) || (tab === 'END_TIMES' && !eodUnlocked);
          return (
            <button key={tab} onClick={() => !isLocked && setActiveTab(tab)} disabled={isLocked} className={`flex items-center gap-1.5 pb-2 font-serif text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'text-eldritch-gold border-b-2 border-eldritch-gold' : (isLocked ? 'text-gray-600 opacity-50 cursor-not-allowed' : 'text-gray-500 hover:text-gray-300')} ${tab === 'VESSELS' && highlightVessels ? 'animate-pulse text-green-400' : ''}`}>
              {isLocked && <Lock className="h-3 w-3" />}
              {tab.replace('_', ' ')}
            </button>
          )
        })}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pr-2 scrollbar-thin scrollbar-thumb-eldritch-grey/50 pb-32">
        {(activeTab === 'MIRACLES' || (activeTab === 'VESSELS' && vesselsUnlocked)) && <IncrementSelector current={increment} onChange={setIncrement} />}
        {activeTab === 'MIRACLES' && (
            <MiraclesTab 
                gameState={gameState} 
                clickPower={clickPower} 
                increment={increment} 
                onUpgrade={onUpgrade} 
                onPurchaseAssistant={onPurchaseAssistant}
                onActivateGem={onActivateGem} 
                assistantUrl={assistantUrl}
                highlightAssistant={highlightAssistant}
                highlightGem={highlightGem}
            />
        )}
        {activeTab === 'VESSELS' && <VesselsTab gameState={gameState} vesselsUnlocked={vesselsUnlocked} visibleVessels={visibleVessels} increment={increment} vesselImages={vesselImages} onPurchaseVessel={onPurchaseVessel} onSelectVessel={setSelectedVessel} />}
        {activeTab === 'CULT' && <CultTab gameState={gameState} vesselsUnlocked={vesselsUnlocked} />}
        {activeTab === 'END_TIMES' && <EndTimesTab gameState={gameState} eodUnlocked={eodUnlocked} endOfDaysUrl={endOfDaysUrl} onPrestige={onPrestige} />}
      </div>
    </div>
    <VesselModal vessel={selectedVessel} level={selectedVessel ? (gameState.vesselLevels[selectedVessel.id] || 0) : 0} onClose={() => setSelectedVessel(null)} imageUrl={selectedVessel ? vesselImages[selectedVessel.id] : undefined} />
    </>
  );
};
