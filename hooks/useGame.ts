
import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, WorshipperType, VesselId, WORSHIPPER_ORDER, GemType, RelicId, IncrementType, FateId } from '../types';
import { PRESTIGE_UNLOCK_THRESHOLD, VESSEL_DEFINITIONS, FATE_DEFINITIONS } from '../constants';
import { 
  calculateManualClickPower, 
  calculateMattelockClickPower,
  calculateProductionByType,
  calculateConsumptionByType,
  calculateSoulsEarned,
  calculateAssistantInterval,
  calculateRelicCost,
  calculateBulkUpgrade,
  calculateBulkVesselBuy,
  calculateAssistantBulkVesselBuy,
} from '../services/gameService';

const STORAGE_KEY = 'shattered_dogma_relics_v2'; 

const INITIAL_STATE: GameState = {
  worshippers: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  totalWorshippers: 0,
  totalAccruedWorshippers: 0,
  miracleLevel: 0, 
  vesselLevels: {}, 
  vesselToggles: {},
  souls: 0,
  relics: {
    [RelicId.GLUTTONY]: 0,
    [RelicId.BETRAYAL]: 0,
    [RelicId.FALSE_IDOL]: 0,
    [RelicId.CONTRACT]: 0,
    [RelicId.VOID_CATALYST]: 0,
    [RelicId.ABYSSAL_REFLEX]: 0,
    [RelicId.FRENZY]: 0,
    [RelicId.REBELLION]: 0,
    [RelicId.SOUL_HARVESTER]: 0,
  },
  fates: {} as any,
  fatePurchases: 0,
  lastPurchasedFateId: null,
  lastPurchasedFateTime: 0,
  lastPurchasedRelicId: null,
  lastPurchasedRelicTime: 0,
  maxTotalWorshippers: 0,
  maxWorshippersByType: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  hasSeenStartSplash: false,
  hasSeenVesselIntro: false,
  hasSeenEodIntro: false,
  hasSeenMiracleIntro: false,
  hasSeenAbyssIntro: false,
  hasSeenLowlyModal: false,
  hasSeenWorldlyModal: false,
  hasSeenZealousModal: false,
  hasSeenPausedModal: false,
  hasSeenNetNegative: false,
  hasAcknowledgedPausedModal: false,
  hasSeenAssistantIntro: false,
  lockedWorshippers: [],
  lastInfluenceTime: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  isPaused: {
    [WorshipperType.INDOLENT]: false,
    [WorshipperType.LOWLY]: false,
    [WorshipperType.WORLDLY]: false,
    [WorshipperType.ZEALOUS]: false,
  },
  pausedStartTime: 0,
  ignoredHaltVessels: [],
  assistantLevel: 0,
  assistantActive: false,
  totalClicks: 0,
  manualClicks: 0,
  mattelockClicks: 0,
  unlockedGems: [],
  activeGem: null,
  activeGemTimeRemaining: 0,
  gemCooldowns: {
    [GemType.LAPIS]: 0,
    [GemType.QUARTZ]: 0,
    [GemType.EMERALD]: 0,
    [GemType.RUBY]: 0,
  },
  showGemDiscovery: null,
  frenzyTimeRemaining: 0,
  rebellionTimeRemaining: 0,
  rebelCaste: null,
  activeBulletin: null,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    musicVolume: 0.3,
  },
  lastSaveTime: Date.now(),
  miracleIncrement: 1,
  vesselIncrement: 1,
  vesselStarvationTimers: {},
};

export const useGame = () => {
  const [offlineGains, setOfflineGains] = useState<{ gains: Record<WorshipperType, number>, time: number } | null>(null);
  const [lastMiracleEvent, setLastMiracleEvent] = useState<{ power: number, type: WorshipperType, isAuto: boolean, timestamp: number } | null>(null);
  const [lastGemRefresh, setLastGemRefresh] = useState<{ gem: GemType, timestamp: number } | null>(null);

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
          relics: { ...INITIAL_STATE.relics, ...(parsed.relics || {}) },
          fates: parsed.fates || {},
        };
      }
    } catch (e) {}
    return INITIAL_STATE;
  });

  const lastPassiveTick = useRef(Date.now());
  const assistantTimer = useRef(0);
  const stateRef = useRef(gameState);

  useEffect(() => {
    stateRef.current = gameState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const calculateInternalPower = useCallback((state: GameState, isAuto: boolean) => {
    const powerBase = isAuto 
        ? calculateMattelockClickPower(state.miracleLevel, state)
        : calculateManualClickPower(state.miracleLevel, state);
    
    let power = powerBase;
    let type = WorshipperType.INDOLENT; 

    if (state.activeGem === GemType.LAPIS) {
        power = powerBase * 2;
    } else if (state.activeGem === GemType.QUARTZ) {
        power = powerBase;
        type = WorshipperType.LOWLY;
    } else if (state.activeGem === GemType.EMERALD) {
        // Emerald Rate: 25% (1:4)
        power = Math.floor(powerBase / 4);
        type = WorshipperType.WORLDLY;
    } else if (state.activeGem === GemType.RUBY) {
        // Ruby Rate: 10% (1:10)
        power = Math.floor(powerBase / 10);
        type = WorshipperType.ZEALOUS;
    }

    const gemPowerFateMod = 1 + (state.fates['gem_power'] || 0);
    if (state.activeGem) {
      power = Math.floor(power * gemPowerFateMod);
    }

    // Ensure at least 1 power if gem is active but division resulted in 0 (unless base is 0)
    if (state.activeGem && power === 0 && powerBase > 0) {
        power = 1;
    }

    return { power, type };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastPassiveTick.current) / 1000; 
      
      if (delta > 0 && document.visibilityState === 'visible') {
        lastPassiveTick.current = now;
        const current = stateRef.current;
        let autoMiracle: { power: number, type: WorshipperType } | null = null;

        const effectiveLevel = current.assistantLevel === 0 && current.maxWorshippersByType[WorshipperType.INDOLENT] >= 1000 
          ? 1 
          : current.assistantLevel;

        if (effectiveLevel > 0 && current.assistantActive) {
            const interval = calculateAssistantInterval(effectiveLevel, current) / 1000;
            assistantTimer.current += delta;
            if (assistantTimer.current >= interval) {
                autoMiracle = calculateInternalPower(current, true);
                assistantTimer.current = 0;
            }
        }

        setGameState(prev => {
          const production = calculateProductionByType(prev);
          const consumption = calculateConsumptionByType(prev);
          
          const newWorshippers = { ...prev.worshippers };
          let detectedNetNegative = false;

          WORSHIPPER_ORDER.forEach(type => {
            const net = production[type] - consumption[type];
            if (net < 0 && !prev.hasSeenNetNegative && !detectedNetNegative) {
                detectedNetNegative = true;
            }
            newWorshippers[type] = Math.max(0, newWorshippers[type] + net * delta);
          });

          if (autoMiracle) {
            newWorshippers[autoMiracle.type] += autoMiracle.power;
          }

          let newActiveGem = prev.activeGem;
          let newActiveGemTimeRemaining = Math.max(0, prev.activeGemTimeRemaining - delta);
          const newGemCooldowns = { ...prev.gemCooldowns };

          (Object.keys(newGemCooldowns) as GemType[]).forEach(gem => {
            const gemCooldownFateMod = 1 + (prev.fates['gem_cooldown'] || 0);
            newGemCooldowns[gem] = Math.max(0, newGemCooldowns[gem] - (delta * gemCooldownFateMod));
          });

          if (newActiveGem && newActiveGemTimeRemaining <= 0) {
            const refreshLvl = prev.relics[RelicId.ABYSSAL_REFLEX] || 0;
            const refreshChance = refreshLvl * 0.1;
            const triggered = Math.random() < refreshChance;
            
            const betrayalLvl = prev.relics[RelicId.BETRAYAL] || 0;
            const cooldownBase = Math.max(60, 120 - betrayalLvl * 10);
            
            if (triggered) {
                newGemCooldowns[newActiveGem] = 0;
                setLastGemRefresh({ gem: newActiveGem, timestamp: Date.now() });
            } else {
                newGemCooldowns[newActiveGem] = cooldownBase;
            }
            newActiveGem = null;
          }

          // Random Frenzy Trigger (1 in 300 chance per second = once every 5 mins on average)
          let newFrenzyTime = Math.max(0, prev.frenzyTimeRemaining - delta);
          if (prev.relics[RelicId.FRENZY] > 0 && newFrenzyTime <= 0) {
            if (Math.random() < (delta / 300)) {
              newFrenzyTime = 15;
            }
          }

          // Random Rebellion Trigger
          let newRebellionTime = Math.max(0, prev.rebellionTimeRemaining - delta);
          let newRebelCaste = prev.rebelCaste;
          if (prev.relics[RelicId.REBELLION] > 0 && newRebellionTime <= 0) {
            if (Math.random() < (delta / 300)) {
              newRebellionTime = 30;
              const rebelPool = [WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY];
              newRebelCaste = rebelPool[Math.floor(Math.random() * rebelPool.length)];
            }
          }
          if (newRebellionTime <= 0) newRebelCaste = null;

          const newMaxByType = { ...prev.maxWorshippersByType };
          WORSHIPPER_ORDER.forEach(type => {
            newMaxByType[type] = Math.max(newMaxByType[type], newWorshippers[type]);
          });

          // GEM UNLOCK LOGIC
          const newUnlockedGems = [...prev.unlockedGems];
          let newShowDiscovery = prev.showGemDiscovery;

          const checkAndUnlock = (gem: GemType, condition: boolean) => {
             if (condition && !newUnlockedGems.includes(gem)) {
                 newUnlockedGems.push(gem);
                 if (!newShowDiscovery) newShowDiscovery = gem;
             }
          }

          checkAndUnlock(GemType.LAPIS, newMaxByType[WorshipperType.INDOLENT] >= 500);
          checkAndUnlock(GemType.QUARTZ, newMaxByType[WorshipperType.LOWLY] >= 500);
          checkAndUnlock(GemType.EMERALD, newMaxByType[WorshipperType.WORLDLY] >= 1000);
          checkAndUnlock(GemType.RUBY, newMaxByType[WorshipperType.ZEALOUS] >= 100);

          let finalAssistantLevel = prev.assistantLevel;
          if (finalAssistantLevel === 0 && newMaxByType[WorshipperType.INDOLENT] >= 1000) {
            finalAssistantLevel = 1;
          }

          return {
             ...prev,
             worshippers: newWorshippers,
             totalWorshippers: Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0),
             totalAccruedWorshippers: prev.totalAccruedWorshippers + (autoMiracle?.power || 0),
             maxWorshippersByType: newMaxByType,
             activeGem: newActiveGem,
             activeGemTimeRemaining: newActiveGemTimeRemaining,
             gemCooldowns: newGemCooldowns,
             lastSaveTime: now,
             hasSeenNetNegative: prev.hasSeenNetNegative || detectedNetNegative,
             mattelockClicks: prev.mattelockClicks + (autoMiracle ? 1 : 0),
             assistantLevel: finalAssistantLevel,
             frenzyTimeRemaining: newFrenzyTime,
             rebellionTimeRemaining: newRebellionTime,
             rebelCaste: newRebelCaste,
             unlockedGems: newUnlockedGems,
             showGemDiscovery: newShowDiscovery
          };
        });

        if (autoMiracle) {
          setLastMiracleEvent({ 
            ...autoMiracle, 
            isAuto: true, 
            timestamp: performance.now() + Math.random() 
          });
        }
      }
    }, 100); 

    return () => clearInterval(intervalId);
  }, [calculateInternalPower]);

  const performMiracle = useCallback(() => {
    const { power, type } = calculateInternalPower(gameState, false);
    setGameState(prev => ({
        ...prev,
        worshippers: { ...prev.worshippers, [type]: prev.worshippers[type] + power },
        totalAccruedWorshippers: prev.totalAccruedWorshippers + power,
        totalClicks: prev.totalClicks + 1,
        manualClicks: prev.manualClicks + 1,
    }));
    return { power, type };
  }, [gameState.miracleLevel, gameState.activeGem, gameState.relics, calculateInternalPower]);

  const triggerPrestige = useCallback(() => {
    setGameState((prev: GameState) => {
       const soulsEarned = calculateSoulsEarned(prev);
       return {
          ...INITIAL_STATE,
          souls: prev.souls + soulsEarned,
          relics: prev.relics,
          fates: prev.fates,
          fatePurchases: prev.fatePurchases,
          settings: prev.settings,
          hasSeenStartSplash: prev.hasSeenStartSplash,
          hasSeenVesselIntro: prev.hasSeenVesselIntro,
          hasSeenEodIntro: prev.hasSeenEodIntro,
          hasSeenMiracleIntro: prev.hasSeenMiracleIntro,
          hasSeenAbyssIntro: prev.hasSeenAbyssIntro,
          hasSeenLowlyModal: prev.hasSeenLowlyModal,
          hasSeenWorldlyModal: prev.hasSeenWorldlyModal,
          hasSeenZealousModal: prev.hasSeenZealousModal,
          hasSeenAssistantIntro: prev.hasSeenAssistantIntro,
          hasSeenNetNegative: prev.hasSeenNetNegative,
          hasAcknowledgedPausedModal: prev.hasAcknowledgedPausedModal,
          totalClicks: prev.totalClicks,
          manualClicks: prev.manualClicks,
          mattelockClicks: prev.mattelockClicks,
       };
    });
  }, []);

  const purchaseRelic = useCallback((id: RelicId) => {
    setGameState(prev => {
        const lvl = prev.relics[id] || 0;
        const cost = calculateRelicCost(id, lvl);
        if (prev.souls < cost) return prev;
        return { 
            ...prev, 
            souls: prev.souls - cost, 
            relics: { ...prev.relics, [id]: lvl + 1 },
            lastPurchasedRelicId: id,
            lastPurchasedRelicTime: Date.now()
        };
    });
  }, []);

  const purchaseFateRelic = useCallback(() => {
    setGameState(prev => {
        const cost = Math.floor(10 * Math.pow(1.2, prev.fatePurchases));
        if (prev.souls < cost) return prev;
        
        const fateIds = Object.keys(FATE_DEFINITIONS) as FateId[];
        const randomFateId = fateIds[Math.floor(Math.random() * fateIds.length)];
        const definition = FATE_DEFINITIONS[randomFateId];
        
        const newFates = { ...prev.fates };
        newFates[randomFateId] = (newFates[randomFateId] || 0) + definition.bonus;
        
        return {
            ...prev,
            souls: prev.souls - cost,
            fatePurchases: prev.fatePurchases + 1,
            lastPurchasedFateId: randomFateId,
            lastPurchasedFateTime: Date.now(),
            fates: newFates
        };
    });
  }, []);

  const setFlag = useCallback((key: keyof GameState, value: any) => {
    setGameState(prev => ({ ...prev, [key]: value }));
  }, []);

  const closeDiscovery = useCallback(() => {
    setGameState(prev => ({ ...prev, showGemDiscovery: null }));
  }, []);

  const closeOfflineModal = useCallback(() => {
    setOfflineGains(null);
  }, []);

  const toggleSound = useCallback(() => {
    setGameState(prev => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } }));
  }, []);

  const toggleMusic = useCallback(() => {
    setGameState(prev => ({ ...prev, settings: { ...prev.settings, musicEnabled: !prev.settings.musicEnabled } }));
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setGameState(prev => ({ ...prev, settings: { ...prev.settings, musicVolume: volume } }));
  }, []);

  const debugAddWorshippers = useCallback((type: WorshipperType, amount: number) => {
    setGameState(prev => ({
      ...prev,
      worshippers: { ...prev.worshippers, [type]: (prev.worshippers[type] || 0) + amount }
    }));
  }, []);

  const debugUnlockFeature = useCallback((feature: 'GEMS' | 'VESSELS' | 'END_TIMES' | 'ASSISTANT') => {
    setGameState(prev => {
      const newState = { ...prev };
      if (feature === 'GEMS') {
        newState.unlockedGems = Object.values(GemType);
      } else if (feature === 'VESSELS') {
        newState.worshippers[WorshipperType.INDOLENT] += 1000;
      } else if (feature === 'END_TIMES') {
        newState.worshippers[WorshipperType.ZEALOUS] += 100;
      } else if (feature === 'ASSISTANT') {
        newState.assistantLevel = 1;
      }
      return newState;
    });
  }, []);

  const debugAddSouls = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, souls: prev.souls + amount }));
  }, []);

  return {
    gameState,
    clickPower: calculateManualClickPower(gameState.miracleLevel, gameState),
    passiveIncome: Object.values(calculateProductionByType(gameState)).reduce((a, b) => a + b, 0),
    performMiracle,
    lastMiracleEvent,
    lastGemRefresh,
    activateGem: (gem: GemType) => setGameState(prev => (prev.activeGem || prev.gemCooldowns[gem] > 0) ? prev : { ...prev, activeGem: gem, activeGemTimeRemaining: 30 }),
    closeDiscovery,
    purchaseRelic,
    purchaseFateRelic,
    triggerPrestige,
    purchaseUpgrade: () => setGameState(prev => {
        const bulk = calculateBulkUpgrade(prev.miracleLevel, prev.miracleIncrement, prev);
        if (prev.worshippers[WorshipperType.INDOLENT] < bulk.cost || bulk.count === 0) return prev;
        return { ...prev, worshippers: { ...prev.worshippers, [WorshipperType.INDOLENT]: prev.worshippers[WorshipperType.INDOLENT] - bulk.cost }, miracleLevel: prev.miracleLevel + bulk.count };
    }),
    purchaseVessel: (id: string) => setGameState(prev => {
        const lvl = prev.vesselLevels[id] || 0;
        const bulk = calculateBulkVesselBuy(id, lvl, prev.vesselIncrement, prev);
        if (prev.worshippers[bulk.costType] < bulk.cost || bulk.count === 0) return prev;
        return { ...prev, worshippers: { ...prev.worshippers, [bulk.costType]: prev.worshippers[bulk.costType] - bulk.cost }, vesselLevels: { ...prev.vesselLevels, [id]: lvl + bulk.count } };
    }),
    purchaseAssistant: () => setGameState(prev => {
        const bulk = calculateAssistantBulkVesselBuy(prev.assistantLevel, prev.miracleIncrement, prev);
        if (prev.worshippers[bulk.costType] < bulk.cost || bulk.count === 0) return prev;
        return { ...prev, worshippers: { ...prev.worshippers, [bulk.costType]: prev.worshippers[bulk.costType] - bulk.cost }, assistantLevel: prev.assistantLevel + bulk.count };
    }),
    toggleVessel: (id: string) => setGameState(prev => ({ ...prev, vesselToggles: { ...prev.vesselToggles, [id]: !prev.vesselToggles[id] } })),
    toggleAllVessels: (caste: WorshipperType, imprison: boolean) => setGameState(prev => {
        const nextToggles = { ...prev.vesselToggles };
        VESSEL_DEFINITIONS.filter(v => v.type === caste).forEach(v => { if (prev.vesselLevels[v.id] > 0) nextToggles[v.id] = imprison; });
        return { ...prev, vesselToggles: nextToggles };
    }),
    toggleAssistant: () => setGameState(prev => ({ ...prev, assistantActive: !prev.assistantActive })),
    setMiracleIncrement: (val: IncrementType) => setGameState(prev => ({ ...prev, miracleIncrement: val })),
    setVesselIncrement: (val: IncrementType) => setGameState(prev => ({ ...prev, vesselIncrement: val })),
    toggleSound,
    toggleMusic,
    setMusicVolume,
    offlineGains,
    closeOfflineModal,
    setFlag,
    debugAddWorshippers,
    debugUnlockFeature,
    debugAddSouls,
    resetSave: () => { localStorage.removeItem(STORAGE_KEY); setGameState(INITIAL_STATE); }
  };
};
