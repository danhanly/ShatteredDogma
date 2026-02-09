
import React, { useState, useRef } from 'react';
import { GameState, WorshipperType, VesselDefinition, GemType, RelicId, IncrementType, VesselId } from '../types';
import { VESSEL_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD } from '../constants';
import { ChevronUp, ChevronDown, Lock } from 'lucide-react';
import { VesselModal } from './VesselModal';
import { MiraclesTab } from './tabs/MiraclesTab';
import { VesselsTab } from './tabs/VesselsTab';
import { CultTab } from './tabs/CultTab';
import { EndTimesTab } from './tabs/EndTimesTab';

interface MenuProps {
  gameState: GameState;
  activeTab: 'MIRACLES' | 'VESSELS' | 'CULT' | 'END_TIMES';
  setActiveTab: (tab: 'MIRACLES' | 'VESSELS' | 'CULT' | 'END_TIMES') => void;
  onUpgrade: () => void;
  onPurchaseVessel: (id: string) => void;
  onPurchaseAssistant: () => void;
  onToggleAssistant: () => void;
  onActivateGem: (gem: GemType) => void;
  setMiracleIncrement: (val: IncrementType) => void;
  setVesselIncrement: (val: IncrementType) => void;
  vesselImages: Record<string, string>;
  gemImages?: Record<string, string>;
  assistantUrl: string;
  onPrestige: () => void;
  onPurchaseRelic: (id: RelicId) => void;
  onPurchaseFate: () => void;
  onToggleVessel: (id: string) => void;
  onToggleAllVessels: (caste: WorshipperType, imprison: boolean) => void;
  endOfDaysUrl: string;
  highlightAssistant?: boolean;
  lastGemRefresh?: { gem: GemType, timestamp: number } | null;
  selectedVessel: VesselDefinition | null;
  setSelectedVessel: (vessel: VesselDefinition | null) => void;
  showAssistantDetails: boolean;
  setShowAssistantDetails: (show: boolean) => void;
}

export const Menu: React.FC<MenuProps> = ({
  gameState, activeTab, setActiveTab, onUpgrade, onPurchaseVessel,
  onPurchaseAssistant, onToggleAssistant, onActivateGem, setMiracleIncrement, setVesselIncrement,
  vesselImages, gemImages, assistantUrl, onPrestige, onPurchaseRelic, onPurchaseFate, onToggleVessel, onToggleAllVessels, endOfDaysUrl,
  highlightAssistant, lastGemRefresh, selectedVessel, setSelectedVessel, showAssistantDetails, setShowAssistantDetails
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const vesselsUnlocked = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 100 || (gameState.relics[RelicId.FALSE_IDOL] > 0);
  // Unlocked if flag is true OR if threshold is met (fallback)
  const endTimesUnlocked = gameState.hasUnlockedEndTimes || gameState.maxWorshippersByType[WorshipperType.ZEALOUS] >= PRESTIGE_UNLOCK_THRESHOLD;

  const visibleVessels = VESSEL_DEFINITIONS.filter(v => {
    if (gameState.relics[RelicId.FALSE_IDOL] > 0) return true;
    if (gameState.vesselLevels[v.id] > 0) return true;
    
    switch(v.id) {
        case VesselId.INDOLENT_1: return true;
        case VesselId.LOWLY_1: return (gameState.vesselLevels[VesselId.INDOLENT_1] || 0) >= 10;
        case VesselId.INDOLENT_2: return (gameState.vesselLevels[VesselId.LOWLY_1] || 0) >= 10;
        case VesselId.WORLDLY_1: return (gameState.vesselLevels[VesselId.INDOLENT_2] || 0) >= 10;
        case VesselId.LOWLY_2: return (gameState.vesselLevels[VesselId.WORLDLY_1] || 0) >= 10;
        case VesselId.ZEALOUS_1: return (gameState.vesselLevels[VesselId.LOWLY_2] || 0) >= 10;
        case VesselId.WORLDLY_2: return (gameState.vesselLevels[VesselId.ZEALOUS_1] || 0) >= 10;
        case VesselId.ZEALOUS_2: return (gameState.vesselLevels[VesselId.ZEALOUS_1] || 0) >= 10; 
        case VesselId.INDOLENT_3: return (gameState.vesselLevels[VesselId.WORLDLY_2] || 0) >= 10;
        case VesselId.LOWLY_3: return (gameState.vesselLevels[VesselId.INDOLENT_3] || 0) >= 10;
        case VesselId.WORLDLY_3: return (gameState.vesselLevels[VesselId.LOWLY_3] || 0) >= 10;
        case VesselId.ZEALOUS_3: return (gameState.vesselLevels[VesselId.WORLDLY_3] || 0) >= 10;
        default: 
            const prevIndex = VESSEL_DEFINITIONS.findIndex(v2 => v2.id === v.id) - 1;
            return prevIndex >= 0 && (gameState.vesselLevels[VESSEL_DEFINITIONS[prevIndex].id] || 0) >= 10;
    }
  });

  return (
    <>
    <div className={`flex w-full shrink-0 flex-col bg-eldritch-black shadow-[0_-5px_20px_rgba(0,0,0,0.8)] transition-all lg:h-full lg:w-[400px] lg:border-l lg:border-eldritch-grey/30 ${isMobileExpanded ? 'h-[60dvh]' : 'h-[12dvh]'}`}>
      <button onClick={() => setIsMobileExpanded(!isMobileExpanded)} className="flex h-6 w-full items-center justify-center bg-eldritch-dark lg:hidden">
        {isMobileExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronUp className="h-4 w-4 text-eldritch-gold" />}
      </button>

      <div className="flex shrink-0 border-b border-eldritch-grey/30 px-4 pt-2 gap-4 overflow-x-auto">
        {['MIRACLES', 'VESSELS', 'END_TIMES', 'CULT'].map(tab => {
          const isTabLocked = tab === 'END_TIMES' && !endTimesUnlocked;
          return (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)} 
              className={`flex items-center gap-1 pb-2 font-serif text-xs sm:text-sm font-bold transition-all ${activeTab === tab ? 'text-eldritch-gold border-b-2 border-eldritch-gold' : 'text-gray-500'}`}
            >
              {tab.replace('_', ' ')}
              {isTabLocked && <Lock className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-32">
        {activeTab === 'MIRACLES' && (
          <MiraclesTab 
            gameState={gameState}
            increment={gameState.miracleIncrement} 
            onSetIncrement={setMiracleIncrement}
            onUpgrade={onUpgrade} 
            onPurchaseAssistant={onPurchaseAssistant} 
            onToggleAssistant={onToggleAssistant}
            onActivateGem={onActivateGem} 
            assistantUrl={assistantUrl}
            highlightAssistant={highlightAssistant}
            lastGemRefresh={lastGemRefresh}
            gemImages={gemImages}
            showAssistantDetails={showAssistantDetails}
            setShowAssistantDetails={setShowAssistantDetails}
          />
        )}
        {activeTab === 'VESSELS' && (
          <VesselsTab 
            gameState={gameState} vesselsUnlocked={vesselsUnlocked} visibleVessels={visibleVessels} 
            increment={gameState.vesselIncrement} onSetIncrement={setVesselIncrement}
            vesselImages={vesselImages} onPurchaseVessel={onPurchaseVessel} 
            onSelectVessel={setSelectedVessel} 
            onToggleAllVessels={onToggleAllVessels}
          />
        )}
        {activeTab === 'CULT' && <CultTab gameState={gameState} />}
        {activeTab === 'END_TIMES' && <EndTimesTab gameState={gameState} onPrestige={onPrestige} onPurchaseRelic={onPurchaseRelic} onPurchaseFate={onPurchaseFate} endOfDaysUrl={endOfDaysUrl} />}
      </div>
    </div>
    <VesselModal 
      vessel={selectedVessel} 
      level={selectedVessel ? (gameState.vesselLevels[selectedVessel.id] || 0) : 0} 
      gameState={gameState}
      isImprisoned={selectedVessel ? !!gameState.vesselToggles[selectedVessel.id] : false}
      onToggle={() => selectedVessel && onToggleVessel(selectedVessel.id)}
      onClose={() => setSelectedVessel(null)} 
      imageUrl={selectedVessel ? vesselImages[selectedVessel.id] : undefined} 
    />
    </>
  );
};
