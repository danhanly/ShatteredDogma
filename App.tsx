
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { MainScreen } from './components/MainScreen';
import { Menu } from './components/Menu';
import { GemDiscoveryModal } from './components/GemDiscoveryModal';
import { OfflineModal } from './components/OfflineModal';
import { SplashIntro } from './components/SplashIntro';
import { VesselUnlockModal } from './components/VesselUnlockModal';
import { EodUnlockModal } from './components/EodUnlockModal';
import { MiracleIntroModal } from './components/MiracleIntroModal';
import { IntroduceAssistantModal } from './components/IntroduceAssistantModal';
import { LowlyModal, WorldlyModal, ZealousModal, ProductionStarvedModal } from './components/IntroductionModals';
import { WorshipperType, GemType } from './types';
import { VESSEL_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD, GEM_DEFINITIONS } from './constants';

const App: React.FC = () => {
  const { 
    gameState, 
    clickPower, 
    passiveIncome,
    performMiracle, 
    activateGem,
    closeDiscovery,
    purchaseUpgrade, 
    purchaseVessel,
    purchaseAssistant,
    toggleAssistant,
    purchaseRelic,
    purchaseFateRelic,
    toggleVessel,
    toggleAllVessels,
    setMiracleIncrement,
    setVesselIncrement,
    toggleSound,
    toggleMusic,
    setMusicVolume,
    offlineGains,
    closeOfflineModal,
    triggerPrestige,
    setFlag,
    lastMiracleEvent,
    lastGemRefresh,
    debugAddWorshippers,
    debugUnlockFeature,
    debugAddSouls,
    resetSave
  } = useGame();

  const [isEntering, setIsEntering] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'MIRACLES' | 'VESSELS' | 'CULT' | 'END_TIMES'>('MIRACLES');
  const [highlightVessels, setHighlightVessels] = useState(false);
  const [highlightAssistant, setHighlightAssistant] = useState(false);
  
  const [worshipperImages, setWorshipperImages] = useState<Record<WorshipperType, string>>({
    [WorshipperType.INDOLENT]: "",
    [WorshipperType.LOWLY]: "",
    [WorshipperType.WORLDLY]: "",
    [WorshipperType.ZEALOUS]: "",
  });

  const [bgUrl, setBgUrl] = useState<string>("");
  const [endOfDaysUrl, setEndOfDaysUrl] = useState<string>("");
  const [assistantUrl, setAssistantUrl] = useState<string>("");
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [vesselImages, setVesselImages] = useState<Record<string, string>>({});
  const [gemImages, setGemImages] = useState<Record<string, string>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAssetPrefix = () => {
    // @ts-ignore
    if (typeof import.meta.env !== 'undefined' && import.meta.env.BASE_URL) {
      // @ts-ignore
      const base = import.meta.env.BASE_URL;
      return base.endsWith('/') ? base : `${base}/`;
    }
    return 'public/';
  };

  useEffect(() => {
    const prefix = getAssetPrefix();
    const IMAGE_PATHS = {
      [WorshipperType.INDOLENT]: `${prefix}indolent.jpeg`,
      [WorshipperType.LOWLY]: `${prefix}lowly.jpeg`,
      [WorshipperType.WORLDLY]: `${prefix}worldly.jpeg`,
      [WorshipperType.ZEALOUS]: `${prefix}zealous.jpeg`,
    };
    const BG_PATH = `${prefix}bg.jpeg`;
    const END_OF_DAYS_PATH = `${prefix}endofdays.jpeg`;
    const ASSISTANT_PATH = `${prefix}assistant.jpg`;
    const MUSIC_PATH = `${prefix}audio/music.ogg`;
    
    setMusicUrl(MUSIC_PATH);

    const loadImages = async () => {
      const gemEntries = Object.entries(GEM_DEFINITIONS);
      // Total assets calculation:
      // 4 Worshippers + 1 BG + 1 EOD + 1 Assistant + 16 Vessels + 4 Gems + 1 Music = 28
      const totalAssets = 4 + 1 + 1 + 1 + VESSEL_DEFINITIONS.length + gemEntries.length + 1;
      let loadedCount = 0;

      const incrementProgress = () => {
        loadedCount++;
        setLoadProgress((loadedCount / totalAssets) * 100);
      };

      // 1. Worshipper Icons
      const newWorshipperImages = { ...worshipperImages };
      for (const [type, path] of Object.entries(IMAGE_PATHS)) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const blob = await response.blob();
            newWorshipperImages[type as WorshipperType] = URL.createObjectURL(blob);
          }
        } catch (e) {}
        incrementProgress();
      }
      setWorshipperImages(newWorshipperImages);

      // 2. Main BG
      try {
        const response = await fetch(BG_PATH);
        if (response.ok) {
          const blob = await response.blob();
          setBgUrl(URL.createObjectURL(blob));
        }
      } catch (e) {}
      incrementProgress();

      // 3. End of Days
      try {
        const response = await fetch(END_OF_DAYS_PATH);
        if (response.ok) {
          const blob = await response.blob();
          setEndOfDaysUrl(URL.createObjectURL(blob));
        }
      } catch (e) {}
      incrementProgress();

      // 4. Assistant
      try {
        const response = await fetch(ASSISTANT_PATH);
        if (response.ok) {
          const blob = await response.blob();
          setAssistantUrl(URL.createObjectURL(blob));
        }
      } catch (e) {}
      incrementProgress();

      // 5. Vessels
      const newVesselImages: Record<string, string> = {};
      for (const def of VESSEL_DEFINITIONS) {
         const parts = def.id.split('_');
         if (parts.length === 2) {
             const typeFolder = def.type.toLowerCase();
             const number = parts[1];
             const path = `${prefix}vessels/${typeFolder}/${number}.jpeg`;
             try {
                const response = await fetch(path);
                if (response.ok) {
                    const blob = await response.blob();
                    newVesselImages[def.id] = URL.createObjectURL(blob);
                }
             } catch (e) {}
         }
         incrementProgress();
      }
      setVesselImages(newVesselImages);

      // 6. Gems
      const newGemImages: Record<string, string> = {};
      for (const [gemKey, def] of gemEntries) {
        try {
          const normalizedPath = (def as any).image.replace(/^\.\//, '');
          const path = `${prefix}${normalizedPath.replace(/^public\//, '')}`;
          const response = await fetch(path);
          if (response.ok) {
            const blob = await response.blob();
            newGemImages[gemKey] = URL.createObjectURL(blob);
          }
        } catch (e) {}
        incrementProgress();
      }
      setGemImages(newGemImages);

      // 7. Music (Check availability)
      try {
        const response = await fetch(MUSIC_PATH);
        if (response.ok) {
          // Just verify it exists
        }
      } catch (e) {}
      incrementProgress();
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (!musicUrl) return;

    if (!audioRef.current) {
        audioRef.current = new Audio(musicUrl);
        audioRef.current.loop = true;
    }

    const audio = audioRef.current;
    audio.volume = gameState.settings.musicVolume ?? 0.3;
    
    // Only play music after user interacts with the splash start
    if (gameState.settings.musicEnabled && !isEntering) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.log(error));
        }
    } else {
        audio.pause();
    }
  }, [musicUrl, gameState.settings.musicEnabled, gameState.settings.musicVolume, isEntering]);

  const handleSplashStart = () => {
    setIsEntering(false);
    setFlag('hasSeenStartSplash', true); // Keep tracking for game logic
    if (gameState.settings.musicEnabled && audioRef.current) {
        audioRef.current.play().catch(e => console.log(e));
    }
  };

  const isLoaded = loadProgress >= 100;
  const showSplash = isEntering;

  const showMiracleIntro = !isEntering && gameState.totalAccruedWorshippers > 0 && !gameState.hasSeenMiracleIntro;
  const showVesselIntro = !isEntering && gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 100 && !gameState.hasSeenVesselIntro;
  const showEodIntro = !isEntering && gameState.maxWorshippersByType[WorshipperType.ZEALOUS] >= PRESTIGE_UNLOCK_THRESHOLD && !gameState.hasSeenEodIntro;
  
  const assistantUnlocked = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 1000;
  const showAssistantIntro = !isEntering && assistantUnlocked && !gameState.hasSeenAssistantIntro;

  const hasLowlyVessel = (gameState.vesselLevels['LOWLY_1'] || 0) > 0;
  const hasWorldlyVessel = (gameState.vesselLevels['WORLDLY_1'] || 0) > 0;
  const hasZealousVessel = (gameState.vesselLevels['ZEALOUS_1'] || 0) > 0;

  const showLowlyModal = !isEntering && hasLowlyVessel && !gameState.hasSeenLowlyModal;
  const showWorldlyModal = !isEntering && hasWorldlyVessel && !gameState.hasSeenWorldlyModal;
  const showZealousModal = !isEntering && hasZealousVessel && !gameState.hasSeenZealousModal;

  const canShowStarvedModal = !isEntering && gameState.hasSeenPausedModal && !gameState.hasAcknowledgedPausedModal;

  return (
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-black text-gray-200">
      {showSplash && (
        <SplashIntro 
          bgUrl={bgUrl} 
          onStart={handleSplashStart} 
          progress={loadProgress}
          isLoaded={isLoaded}
        />
      )}
      
      {!isEntering && (
        <>
          {showMiracleIntro && (
            <MiracleIntroModal 
              imageUrl={vesselImages['INDOLENT_1']} 
              onClose={() => setFlag('hasSeenMiracleIntro', true)} 
            />
          )}

          {showVesselIntro && <VesselUnlockModal 
            zealotVesselUrl={vesselImages['ZEALOUS_4']} 
            mudgeUrl={vesselImages['INDOLENT_1']}
            onClose={() => {
                setFlag('hasSeenVesselIntro', true);
                setActiveTab('VESSELS');
                setHighlightVessels(true);
                setTimeout(() => setHighlightVessels(false), 3000);
            }} 
          />}

          {showAssistantIntro && (
            <IntroduceAssistantModal 
              imageUrl={assistantUrl} 
              onClose={() => {
                setFlag('hasSeenAssistantIntro', true);
                setActiveTab('MIRACLES');
                setHighlightAssistant(true);
                setTimeout(() => setHighlightAssistant(false), 3000);
              }} 
            />
          )}

          {showEodIntro && <EodUnlockModal endOfDaysUrl={endOfDaysUrl} onClose={() => {
            setFlag('hasSeenEodIntro', true);
            setActiveTab('END_TIMES');
          }} />}

          {showLowlyModal && <LowlyModal imageUrl={vesselImages['LOWLY_1']} onClose={() => setFlag('hasSeenLowlyModal', true)} />}
          {showWorldlyModal && <WorldlyModal imageUrl={vesselImages['WORLDLY_1']} onClose={() => setFlag('hasSeenWorldlyModal', true)} />}
          {showZealousModal && <ZealousModal imageUrl={vesselImages['ZEALOUS_1']} onClose={() => setFlag('hasSeenZealousModal', true)} />}
          
          {canShowStarvedModal && (
              <ProductionStarvedModal onClose={() => {
                  setFlag('hasAcknowledgedPausedModal', true); 
              }} />
          )}

          {gameState.showGemDiscovery && (
            <GemDiscoveryModal 
              gem={gameState.showGemDiscovery} 
              onClose={closeDiscovery} 
              imageUrl={gemImages[gameState.showGemDiscovery]}
            />
          )}

          <Header 
            gameState={gameState}
            toggleSound={toggleSound}
            toggleMusic={toggleMusic}
            setMusicVolume={setMusicVolume}
            setActiveTab={setActiveTab}
            passiveIncome={passiveIncome} 
            debugAddWorshippers={debugAddWorshippers}
            debugUnlockFeature={debugUnlockFeature}
            debugAddSouls={debugAddSouls}
            resetSave={resetSave}
          />
          
          <main className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
            <MainScreen 
              gameState={gameState} 
              onTap={(x, y) => performMiracle()} 
              autoClickTrigger={lastMiracleEvent}
              worshipperImages={worshipperImages}
              bgUrl={bgUrl}
              onToggleAllVessels={toggleAllVessels}
            />
            
            <Menu 
              gameState={gameState}
              clickPower={clickPower}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onUpgrade={purchaseUpgrade}
              onPurchaseVessel={purchaseVessel}
              onPurchaseAssistant={purchaseAssistant}
              onToggleAssistant={toggleAssistant}
              onActivateGem={activateGem}
              setMiracleIncrement={setMiracleIncrement}
              setVesselIncrement={setVesselIncrement}
              vesselImages={vesselImages}
              assistantUrl={assistantUrl}
              onPrestige={triggerPrestige}
              onPurchaseRelic={purchaseRelic}
              onPurchaseFate={purchaseFateRelic}
              onToggleVessel={toggleVessel}
              onToggleAllVessels={toggleAllVessels}
              endOfDaysUrl={endOfDaysUrl}
              highlightVessels={highlightVessels}
              highlightAssistant={highlightAssistant}
              lastGemRefresh={lastGemRefresh}
            />
          </main>

          {offlineGains && <OfflineModal gains={offlineGains.gains} timeOffline={offlineGains.time} onClose={closeOfflineModal} />}
        </>
      )}
    </div>
  );
};

export default App;
