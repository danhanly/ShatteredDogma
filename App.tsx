
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { MainScreen } from './components/MainScreen';
import { Menu } from './components/Menu';
import { GemDiscoveryModal } from './components/GemDiscoveryModal';
import { OfflineModal } from './components/OfflineModal';
import { AbyssIntroModal } from './components/AbyssIntroModal';
import { SplashIntro } from './components/SplashIntro';
import { VesselUnlockModal } from './components/VesselUnlockModal';
import { EodUnlockModal } from './components/EodUnlockModal';
import { WorshipperType, VesselId } from './types';
import { VESSEL_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD } from './constants';

const App: React.FC = () => {
  const { 
    gameState, 
    clickPower, 
    passiveIncome,
    milestoneState, 
    performMiracle, 
    purchaseUpgrade, 
    purchaseVessel,
    equipGem,
    toggleSound,
    toggleMusic,
    setMusicVolume,
    closeDiscovery,
    offlineGains,
    closeOfflineModal,
    triggerPrestige,
    purchaseRelic,
    setFlag,
    toggleWorshipperLock,
    debugAddWorshippers,
    debugUnlockFeature,
    debugAddSouls,
    resetSave,
    performInfluence
  } = useGame();

  const [activeTab, setActiveTab] = useState<'MIRACLES' | 'VESSELS' | 'CULT' | 'END_TIMES'>('MIRACLES');
  const [highlightVessels, setHighlightVessels] = useState(false);
  const [worshipperImages, setWorshipperImages] = useState<Record<WorshipperType, string>>({
    [WorshipperType.INDOLENT]: "",
    [WorshipperType.LOWLY]: "",
    [WorshipperType.WORLDLY]: "",
    [WorshipperType.ZEALOUS]: "",
  });

  const [bgUrl, setBgUrl] = useState<string>("");
  const [endOfDaysUrl, setEndOfDaysUrl] = useState<string>("");
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [vesselImages, setVesselImages] = useState<Record<string, string>>({});
  
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
    const MUSIC_PATH = `${prefix}audio/music.ogg`;
    
    setMusicUrl(MUSIC_PATH);

    const loadedUrls: string[] = [];

    const loadImages = async () => {
      const newImages = { ...worshipperImages };
      for (const [type, path] of Object.entries(IMAGE_PATHS)) {
        try {
          const response = await fetch(path);
          if (!response.ok) throw new Error();
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          newImages[type as WorshipperType] = url;
          loadedUrls.push(url);
        } catch (e) {}
      }
      setWorshipperImages(newImages);

      try {
        const response = await fetch(BG_PATH);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setBgUrl(url);
          loadedUrls.push(url);
        }
      } catch (e) {}

      try {
        const response = await fetch(END_OF_DAYS_PATH);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setEndOfDaysUrl(url);
          loadedUrls.push(url);
        }
      } catch (e) {}

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
                    const url = URL.createObjectURL(blob);
                    newVesselImages[def.id] = url;
                    loadedUrls.push(url);
                }
             } catch (e) {}
         }
      }
      setVesselImages(newVesselImages);
    };

    loadImages();
    return () => loadedUrls.forEach(url => URL.revokeObjectURL(url));
  }, []);

  // Music Effect
  useEffect(() => {
    if (!musicUrl) return;

    if (!audioRef.current) {
        audioRef.current = new Audio(musicUrl);
        audioRef.current.loop = true;
    }

    const audio = audioRef.current;
    
    // Always update volume (use legacy fallback if undefined)
    audio.volume = gameState.settings.musicVolume ?? 0.3;
    
    // Attempt playback if settings allow AND we have passed the splash screen (implies interaction)
    if (gameState.settings.musicEnabled && gameState.hasSeenStartSplash) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio playback failed (autoplay policy):", error);
            });
        }
    } else {
        audio.pause();
    }
  }, [musicUrl, gameState.settings.musicEnabled, gameState.settings.musicVolume, gameState.hasSeenStartSplash]);

  const handleSplashStart = () => {
    setFlag('hasSeenStartSplash', true);
    // Explicitly trigger play on interaction
    if (gameState.settings.musicEnabled && audioRef.current) {
        audioRef.current.play().catch(e => console.log("Splash play failed:", e));
    }
  };

  const handleTap = (x: number, y: number) => {
    return performMiracle();
  };

  const showVesselIntro = gameState.maxWorshippersByType[WorshipperType.INDOLENT] >= 100 && !gameState.hasSeenVesselIntro;
  const showEodIntro = gameState.maxTotalWorshippers >= PRESTIGE_UNLOCK_THRESHOLD && !gameState.hasSeenEodIntro;
  const showAbyssIntro = gameState.miracleLevel > 50 && !gameState.hasSeenAbyssIntro;

  return (
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-black text-gray-200">
      {!gameState.hasSeenStartSplash && <SplashIntro bgUrl={bgUrl} onStart={handleSplashStart} />}
      
      {showVesselIntro && <VesselUnlockModal 
        zealotVesselUrl={vesselImages['ZEALOUS_4']} 
        mudgeUrl={vesselImages['INDOLENT_1']}
        onClose={() => {
            setFlag('hasSeenVesselIntro', true);
            setActiveTab('VESSELS');
            setHighlightVessels(true);
            setTimeout(() => setHighlightVessels(false), 3000); // Highlight for 3s
        }} 
      />}

      {showAbyssIntro && <AbyssIntroModal onClose={() => setFlag('hasSeenAbyssIntro', true)} />}

      {showEodIntro && <EodUnlockModal endOfDaysUrl={endOfDaysUrl} onClose={() => {
        setFlag('hasSeenEodIntro', true);
        setActiveTab('END_TIMES');
      }} />}

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
          milestoneState={milestoneState}
          onTap={handleTap} 
          worshipperImages={worshipperImages}
          bgUrl={bgUrl}
          toggleWorshipperLock={toggleWorshipperLock}
        />
        
        <Menu 
          gameState={gameState}
          clickPower={clickPower}
          milestoneState={milestoneState}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onUpgrade={purchaseUpgrade}
          onEquipGem={equipGem}
          onPurchaseVessel={purchaseVessel}
          vesselImages={vesselImages}
          onPrestige={triggerPrestige}
          onPurchaseRelic={purchaseRelic}
          endOfDaysUrl={endOfDaysUrl}
          highlightVessels={highlightVessels}
          onInfluence={performInfluence}
        />
      </main>

      {gameState.showGemDiscovery && (
        <GemDiscoveryModal 
          gem={gameState.showGemDiscovery} 
          isFirstGem={gameState.unlockedGems.length === 1}
          onClose={closeDiscovery} 
        />
      )}
      {offlineGains && <OfflineModal gains={offlineGains.gains} timeOffline={offlineGains.time} onClose={closeOfflineModal} />}
    </div>
  );
};

export default App;
