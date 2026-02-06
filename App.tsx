
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { MainScreen } from './components/MainScreen';
import { Menu } from './components/Menu';
import { GemDiscoveryModal } from './components/GemDiscoveryModal';
import { OfflineModal } from './components/OfflineModal';
import { WorshipperType, VesselId } from './types';
import { VESSEL_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD } from './constants';
import { Skull, Users, Ghost, Frown, Crown, Sword, Sparkles, User, Info, ArrowRight } from 'lucide-react';

const SplashIntro: React.FC<{ bgUrl: string, onStart: () => void }> = ({ bgUrl, onStart }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-fade-in">
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <img src={bgUrl} className="h-full w-full object-cover grayscale opacity-30 blur-sm" alt="Background" />
    </div>
    <div className="relative z-10 max-w-xl p-8 text-center bg-black/60 backdrop-blur-sm rounded-3xl border border-white/5 shadow-2xl">
      <h1 className="mb-6 font-gothic text-6xl font-black uppercase tracking-widest text-eldritch-gold drop-shadow-2xl">Shattered Dogma</h1>
      <div className="mb-8 space-y-4 font-serif text-lg leading-relaxed text-gray-300">
        <p>"In the void between the stars, a silence yearns to be filled. You are the echo that answers. The veil has thinned, and the mortal cattle drift aimlessly, seeking a master to harness their ephemeral souls."</p>
        <p className="text-sm border-t border-white/10 pt-4 text-eldritch-gold/80 italic">
          Creating dark miracles attracts seekers from four distinct walks of life. Each miracle manifestation resonates with the essence of a soul type. Upgrade your miracle to strengthen this resonance and draw ever-increasing throngs to your shadow.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-4 text-xs tracking-wider">
          <div className="flex items-center gap-2 text-blue-400"><Ghost className="h-4 w-4" /> Indolent: The biomass</div>
          <div className="flex items-center gap-2 text-gray-400"><Frown className="h-4 w-4" /> Lowly: The foundation</div>
          <div className="flex items-center gap-2 text-green-400"><Crown className="h-4 w-4" /> Worldly: The tethers</div>
          <div className="flex items-center gap-2 text-red-500"><Sword className="h-4 w-4" /> Zealous: The fury</div>
        </div>
      </div>
      <button 
        onClick={onStart}
        className="group relative rounded-full border-2 border-eldritch-gold/50 bg-black/40 px-8 py-4 font-serif text-lg font-bold uppercase tracking-widest text-eldritch-gold transition-all hover:bg-eldritch-gold/20 hover:scale-105 active:scale-95 whitespace-nowrap"
      >
        <span className="relative z-10">Build Your Eldritch Cult</span>
        <div className="absolute inset-0 -z-10 animate-pulse bg-eldritch-gold/5" />
      </button>
    </div>
  </div>
);

const VesselUnlockModal: React.FC<{ zealotVesselUrl: string, mudgeUrl: string, onClose: () => void }> = ({ zealotVesselUrl, mudgeUrl, onClose }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4">
      <div className="relative max-w-lg w-full overflow-hidden rounded-2xl border-2 border-eldritch-gold/30 bg-eldritch-dark shadow-[0_0_100px_rgba(197,160,89,0.2)]">
        {/* Header Image depends on step */}
        <div className="relative h-64 w-full bg-black overflow-hidden">
             {step === 1 ? (
                 <img src={zealotVesselUrl} className="h-full w-full object-cover opacity-60" alt="Apex Vessel" />
             ) : (
                 mudgeUrl ? (
                    <img src={mudgeUrl} className="h-full w-full object-cover opacity-60" alt="Mudge the Slumbering" />
                 ) : (
                    <div className="h-full w-full bg-gradient-to-b from-blue-950 to-eldritch-dark flex items-center justify-center">
                        <Ghost className="text-blue-500 h-32 w-32 opacity-20 absolute" />
                    </div>
                 )
             )}
             <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
        </div>

        <div className="p-8 text-center relative z-10 -mt-10">
            {step === 1 ? (
                <>
                    <div className="flex justify-center mb-4"><Sparkles className="h-8 w-8 text-eldritch-gold animate-pulse" /></div>
                    <h2 className="mb-4 font-serif text-3xl font-bold text-white tracking-widest uppercase">The Liturgy of Vessels</h2>
                    <p className="mb-6 font-serif text-gray-400 italic">"Your influence crystallizes. No longer are you merely a passive observer. You have gathered enough hollow spirits to begin inhabiting permanent vessels."</p>
                    <p className="mb-8 font-serif text-eldritch-gold/70 text-sm">
                        These vessels proselytise to the masses with a voice that is not theirs, attracting worshippers across the city without the need for your direct miracle manifestations.
                    </p>
                    <button 
                        onClick={() => setStep(2)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-eldritch-gold/20 border border-eldritch-gold/40 py-4 font-serif font-bold uppercase tracking-widest text-eldritch-gold hover:bg-eldritch-gold/30 transition-colors"
                    >
                        Next <ArrowRight className="h-4 w-4" />
                    </button>
                </>
            ) : (
                <>
                     {/* Preview Mudge Card */}
                     <div className="mx-auto mb-6 max-w-[280px] rounded-xl border border-blue-900 bg-eldritch-dark p-3 text-left shadow-lg opacity-80 scale-90 sm:scale-100">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-blue-900 bg-black overflow-hidden">
                                {mudgeUrl ? <img src={mudgeUrl} alt="Mudge" className="h-full w-full object-cover object-top scale-125" /> : <User className="h-8 w-8 text-blue-900" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-serif text-sm font-bold text-blue-400">Mudge the Slumbering</h4>
                                <p className="text-xs text-gray-500">The Drifter</p>
                            </div>
                        </div>
                    </div>

                    <p className="mb-8 font-serif text-gray-400 italic">"Unlock the first vessel, Mudge the Slumbering, to allow him to begin his work at converting the Indolent to your cause."</p>
                    
                    <button 
                        onClick={onClose}
                        className="w-full rounded-lg bg-eldritch-gold/20 border border-eldritch-gold/40 py-4 font-serif font-bold uppercase tracking-widest text-eldritch-gold hover:bg-eldritch-gold/30 transition-colors"
                    >
                        Bind the Vessels
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

const EodUnlockModal: React.FC<{ endOfDaysUrl: string, onClose: () => void }> = ({ endOfDaysUrl, onClose }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4">
    <div className="relative max-w-lg overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-eldritch-dark shadow-[0_0_100px_rgba(79,70,229,0.2)]">
      <img src={endOfDaysUrl} className="h-64 w-full object-cover opacity-60" alt="Apocalypse" />
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
      <div className="p-8 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-white tracking-widest uppercase">Herald the End Times</h2>
          <p className="mb-8 font-serif text-gray-400 italic">"The population has reached a critical density. The threshold is met. You may now burn this reality to forge a path to eternal ascension."</p>
          <button 
            onClick={onClose}
            className="w-full rounded-lg bg-indigo-900 py-4 font-serif font-bold uppercase tracking-widest text-white hover:bg-indigo-800 transition-colors"
          >
            Ascend Further
          </button>
      </div>
    </div>
  </div>
);

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
    resetSave
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
