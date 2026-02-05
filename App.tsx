import React, { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { MainScreen } from './components/MainScreen';
import { Menu } from './components/Menu';
import { GemDiscoveryModal } from './components/GemDiscoveryModal';
import { OfflineModal } from './components/OfflineModal';
import { WorshipperType } from './types';
import { VESSEL_DEFINITIONS } from './constants';

const App: React.FC = () => {
  const { 
    gameState, 
    clickPower, 
    passiveIncome,
    upgradeCost, 
    canAfford, 
    milestoneState,
    performMiracle, 
    purchaseUpgrade, 
    purchaseVessel,
    equipGem,
    toggleSound,
    closeDiscovery,
    offlineGains,
    closeOfflineModal
  } = useGame();

  // Store Blob URLs for each worshipper type
  const [worshipperImages, setWorshipperImages] = useState<Record<WorshipperType, string>>({
    [WorshipperType.INDOLENT]: "",
    [WorshipperType.LOWLY]: "",
    [WorshipperType.WORLDLY]: "",
    [WorshipperType.ZEALOUS]: "",
  });

  const [bgUrl, setBgUrl] = useState<string>("");
  const [vesselImages, setVesselImages] = useState<Record<string, string>>({});

  // Helper to determine asset path prefix based on environment
  const getAssetPrefix = () => {
    // Check for Vite environment
    // @ts-ignore
    if (typeof import.meta.env !== 'undefined' && import.meta.env.BASE_URL) {
      // In Vite (Dev or Build), assets in 'public' are served at root (or base)
      // @ts-ignore
      const base = import.meta.env.BASE_URL;
      return base.endsWith('/') ? base : `${base}/`;
    }
    // Fallback for Raw Preview (Google AI Studio) where files are served from root
    return 'public/';
  };

  // Load each image as a blob to ensure consistent rendering
  useEffect(() => {
    const prefix = getAssetPrefix();
    
    const IMAGE_PATHS = {
      [WorshipperType.INDOLENT]: `${prefix}indolent.jpeg`,
      [WorshipperType.LOWLY]: `${prefix}lowly.jpeg`,
      [WorshipperType.WORLDLY]: `${prefix}worldly.jpeg`,
      [WorshipperType.ZEALOUS]: `${prefix}zealous.jpeg`,
    };
    const BG_PATH = `${prefix}bg.jpeg`;

    const loadedUrls: string[] = [];

    const loadImages = async () => {
      // Load Worshippers
      const newImages = { ...worshipperImages };
      
      for (const [type, path] of Object.entries(IMAGE_PATHS)) {
        try {
          const response = await fetch(path);
          if (!response.ok) throw new Error(`Failed to fetch ${path}`);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          newImages[type as WorshipperType] = url;
          loadedUrls.push(url);
        } catch (e) {
          console.warn(`Falling back to default path for ${type} (Path: ${path}):`, e);
        }
      }
      setWorshipperImages(newImages);

      // Load Background
      try {
        const response = await fetch(BG_PATH);
        if (!response.ok) throw new Error(`Failed to fetch ${BG_PATH}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBgUrl(url);
        loadedUrls.push(url);
      } catch (e) {
        console.warn(`Falling back to default path for bg (Path: ${BG_PATH}):`, e);
      }

      // Load Vessels
      const newVesselImages: Record<string, string> = {};
      for (const def of VESSEL_DEFINITIONS) {
         // ID format: TYPE_NUMBER e.g. INDOLENT_1
         const parts = def.id.split('_');
         if (parts.length === 2) {
             const typeFolder = def.type.toLowerCase();
             const number = parts[1];
             // Note: Prefix logic applied here too
             const path = `${prefix}vessels/${typeFolder}/${number}.jpeg`;
             
             try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`Failed to fetch ${path}`);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                newVesselImages[def.id] = url;
                loadedUrls.push(url);
             } catch (e) {
                console.warn(`Falling back for vessel ${def.id}`, e);
             }
         }
      }
      setVesselImages(newVesselImages);
    };

    loadImages();

    // Cleanup object URLs on unmount
    return () => {
      loadedUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleTap = (x: number, y: number) => {
    const result = performMiracle();
    return result.power;
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black text-gray-200">
      <Header gameState={gameState} toggleSound={toggleSound} passiveIncome={passiveIncome} />
      
      <main className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <MainScreen 
          gameState={gameState} 
          milestoneState={milestoneState}
          onTap={handleTap} 
          worshipperImages={worshipperImages}
          bgUrl={bgUrl}
        />
        
        <Menu 
          gameState={gameState}
          upgradeCost={upgradeCost}
          clickPower={clickPower}
          canAfford={canAfford}
          milestoneState={milestoneState}
          onUpgrade={purchaseUpgrade}
          onEquipGem={equipGem}
          onPurchaseVessel={purchaseVessel}
          vesselImages={vesselImages}
        />
      </main>

      {/* Discovery Modal for new Gems */}
      <GemDiscoveryModal 
        gem={gameState.showGemDiscovery} 
        onClose={closeDiscovery} 
      />

      {/* Offline Welcome Back Modal */}
      {offlineGains && (
        <OfflineModal 
            gains={offlineGains.gains} 
            timeOffline={offlineGains.time} 
            onClose={closeOfflineModal} 
        />
      )}
    </div>
  );
};

export default App;