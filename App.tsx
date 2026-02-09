
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
import { WorshipperType } from './types';
import { VESSEL_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD, GEM_DEFINITIONS } from './constants';

const App: React.FC = () => {
  const { 
    gameState,
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

  const [activeTab, setActiveTab] = useState<'MIRACLES' | 'VESSELS' | 'CULT' | 'END_TIMES'>('MIRACLES');
  const [highlightAssistant, setHighlightAssistant] = useState(false);
  const [ascensionPhase, setAscensionPhase] = useState<'IDLE' | 'IN' | 'OUT'>('IDLE');

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

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
    return './';
  };

  useEffect(() => {
    const prefix = getAssetPrefix();
    const MUSIC_PATH = `${prefix}audio/music.ogg`;
    setMusicUrl(MUSIC_PATH);

    const loadImages = async () => {
      const assetsToLoad: Array<{ type: string; id?: string; path: string }> = [];

      // Static Images
      assetsToLoad.push({ type: 'BG', path: `${prefix}img/bg.jpeg` });
      assetsToLoad.push({ type: 'EOD', path: `${prefix}img/endofdays.jpeg` });
      assetsToLoad.push({ type: 'ASSISTANT', path: `${prefix}img/assistant.jpeg` });

      // Worshippers
      const IMAGE_PATHS = {
        [WorshipperType.INDOLENT]: `${prefix}img/vessels/indolent/1.jpeg`,
        [WorshipperType.LOWLY]: `${prefix}img/vessels/lowly/2.jpeg`,
        [WorshipperType.WORLDLY]: `${prefix}img/vessels/worldly/2.jpeg`,
        [WorshipperType.ZEALOUS]: `${prefix}img/vessels/zealous/3.jpeg`,
      };
      Object.entries(IMAGE_PATHS).forEach(([type, path]) => {
        assetsToLoad.push({ type: 'WORSHIPPER', id: type, path });
      });

      // Vessels
      for (const def of VESSEL_DEFINITIONS) {
         const parts = def.id.split('_');
         if (parts.length === 2) {
             const typeFolder = def.type.toLowerCase();
             const number = parts[1];
             const path = `${prefix}img/vessels/${typeFolder}/${number}.jpeg`;
             assetsToLoad.push({ type: 'VESSEL', id: def.id, path });
         }
      }

      // Gems
      for (const [gemKey, def] of Object.entries(GEM_DEFINITIONS)) {
        // Strip leading slash or ./ to prevent double slashes when combining with prefix
        const normalizedPath = def.image.replace(/^(\.\/|\/)/, '');
        const path = `${prefix}${normalizedPath.replace(/^static\//, '')}`;
        assetsToLoad.push({ type: 'GEM', id: gemKey, path });
      }

      const totalAssets = assetsToLoad.length;
      let loadedCount = 0;

      // Temp storage for batched state updates
      const loadedWorshippers = { ...worshipperImages };
      const loadedVessels: Record<string, string> = {};
      const loadedGems: Record<string, string> = {};

      await Promise.all(assetsToLoad.map(async (asset) => {
        try {
          const response = await fetch(asset.path);
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            switch (asset.type) {
              case 'BG': setBgUrl(url); break;
              case 'EOD': setEndOfDaysUrl(url); break;
              case 'ASSISTANT': setAssistantUrl(url); break;
              case 'WORSHIPPER': if(asset.id) loadedWorshippers[asset.id as WorshipperType] = url; break;
              case 'VESSEL': if(asset.id) loadedVessels[asset.id] = url; break;
              case 'GEM': if(asset.id) loadedGems[asset.id] = url; break;
            }
          } else {
             console.warn(`Failed to load asset: ${asset.path} - ${response.status}`);
          }
        } catch (e) {
          console.warn(`Failed to load asset: ${asset.path}`, e);
        } finally {
          loadedCount++;
          setLoadingProgress((loadedCount / totalAssets) * 100);
        }
      }));

      setWorshipperImages(loadedWorshippers);
      setVesselImages(loadedVessels);
      setGemImages(loadedGems);
      setAssetsLoaded(true);
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
    
    if (gameState.settings.musicEnabled && gameState.hasSeenStartSplash) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.log(error));
        }
    } else {
        audio.pause();
    }
  }, [musicUrl, gameState.settings.musicEnabled, gameState.settings.musicVolume, gameState.hasSeenStartSplash]);

  useEffect(() => {
    if (gameState.highlightGem) {
        setActiveTab('MIRACLES');
    }
  }, [gameState.highlightGem]);

  const handleSplashStart = () => {
    setFlag('hasSeenStartSplash', true);
    if (gameState.settings.musicEnabled && audioRef.current) {
        audioRef.current.play().catch(e => console.log(e));
    }
  };

  const handleAscension = () => {
    setAscensionPhase('IN');
    setTimeout(() => {
        triggerPrestige();
        setAscensionPhase('OUT');
        setTimeout(() => {
            setAscensionPhase('IDLE');
        }, 2000);
    }, 50);
  };

  const showMiracleIntro = gameState.hasSeenStartSplash && gameState.totalAccruedWorshippers > 0 && !gameState.hasSeenMiracleIntro;
  const showVesselIntro = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 100 && !gameState.hasSeenVesselIntro;
  const showEodIntro = gameState.maxWorshippersByType[WorshipperType.ZEALOUS] >= PRESTIGE_UNLOCK_THRESHOLD && !gameState.hasSeenEodIntro;
  const assistantUnlocked = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 1000;
  const showAssistantIntro = assistantUnlocked && !gameState.hasSeenAssistantIntro;
  const hasLowlyVessel = (gameState.vesselLevels['LOWLY_1'] || 0) > 0;
  const hasWorldlyVessel = (gameState.vesselLevels['WORLDLY_1'] || 0) > 0;
  const hasZealousVessel = (gameState.vesselLevels['ZEALOUS_1'] || 0) > 0;
  const showLowlyModal = hasLowlyVessel && !gameState.hasSeenLowlyModal;
  const showWorldlyModal = hasWorldlyVessel && !gameState.hasSeenWorldlyModal;
  const showZealousModal = hasZealousVessel && !gameState.hasSeenZealousModal;
  const canShowStarvedModal = gameState.hasSeenPausedModal && !gameState.hasAcknowledgedPausedModal && gameState.hasSeenStartSplash;

  return (
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-black text-gray-200 relative">
      
      {/* Ascension Flash Overlay */}
      <div 
        className={`pointer-events-none absolute inset-0 z-[200] bg-white transition-opacity 
            ${ascensionPhase === 'IDLE' ? 'opacity-0' : ''}
            ${ascensionPhase === 'IN' ? 'opacity-100 duration-[50ms] ease-in' : ''}
            ${ascensionPhase === 'OUT' ? 'opacity-0 duration-[2000ms] ease-out' : ''}
        `} 
      />

      {!gameState.hasSeenStartSplash && <SplashIntro bgUrl={bgUrl} onStart={handleSplashStart} progress={loadingProgress} isLoaded={assetsLoaded} />}
      
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
          onTap={() => performMiracle()} 
          autoClickTrigger={lastMiracleEvent}
          worshipperImages={worshipperImages}
          bgUrl={bgUrl}
          onToggleAllVessels={toggleAllVessels}
        />
        
        <Menu 
          gameState={gameState}
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
          gemImages={gemImages}
          assistantUrl={assistantUrl}
          onPrestige={handleAscension}
          onPurchaseRelic={purchaseRelic}
          onPurchaseFate={purchaseFateRelic}
          onToggleVessel={toggleVessel}
          onToggleAllVessels={toggleAllVessels}
          endOfDaysUrl={endOfDaysUrl}
          highlightAssistant={highlightAssistant}
          lastGemRefresh={lastGemRefresh}
          highlightGem={gameState.highlightGem}
        />
      </main>

      {offlineGains && <OfflineModal gains={offlineGains.gains} timeOffline={offlineGains.time} onClose={closeOfflineModal} />}
    </div>
  );
};

export default App;
