
import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, WorshipperType, VesselId, WORSHIPPER_ORDER, GemType, RelicId, IncrementType } from '../types';
import { PRESTIGE_UNLOCK_THRESHOLD } from '../constants';
import { 
  calculateClickPower, 
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
  },
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

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
          miracleLevel: parsed.miracleLevel !== undefined ? parsed.miracleLevel : 0,
          worshippers: { ...INITIAL_STATE.worshippers, ...(parsed.worshippers || {}) },
          relics: { ...INITIAL_STATE.relics, ...(parsed.relics || {}) },
          vesselToggles: { ...INITIAL_STATE.vesselToggles, ...(parsed.vesselToggles || {}) },
          maxWorshippersByType: { ...INITIAL_STATE.maxWorshippersByType, ...(parsed.maxWorshippersByType || {}) },
          settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
          vesselStarvationTimers: parsed.vesselStarvationTimers || {},
        };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return INITIAL_STATE;
  });

  const lastPassiveTick = useRef(Date.now());
  const assistantTimer = useRef(0);
  const stateRef = useRef(gameState);

  useEffect(() => {
    stateRef.current = gameState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const performMiracleInternal = useCallback((state: GameState) => {
    const powerBase = calculateClickPower(state.miracleLevel);
    let power = powerBase;
    let type = WorshipperType.INDOLENT; 

    if (state.activeGem === GemType.LAPIS) {
        power = powerBase * 2;
    } else if (state.activeGem === GemType.QUARTZ) {
        power = powerBase;
        type = WorshipperType.LOWLY;
    } else if (state.activeGem === GemType.EMERALD) {
        power = Math.floor(powerBase / 4);
        type = WorshipperType.WORLDLY;
    } else if (state.activeGem === GemType.RUBY) {
        power = Math.floor(powerBase / 10);
        type = WorshipperType.ZEALOUS;
    }

    const contractLvl = state.relics[RelicId.CONTRACT] || 0;
    power = Math.floor(power * (1 + contractLvl * 0.25));
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

        // Process assistant click timing
        if (current.assistantLevel > 0 && current.assistantActive) {
            const interval = calculateAssistantInterval(current.assistantLevel) / 1000;
            assistantTimer.current += delta;
            if (assistantTimer.current >= interval) {
                autoMiracle = performMiracleInternal(current);
                assistantTimer.current = 0;
            }
        }

        setGameState(prev => {
          const production = calculateProductionByType(prev);
          const consumption = calculateConsumptionByType(prev);
          
          const newWorshippers = { ...prev.worshippers };
          
          // Apply passive income
          WORSHIPPER_ORDER.forEach(type => {
            newWorshippers[type] = Math.max(0, newWorshippers[type] + (production[type] - consumption[type]) * delta);
          });

          // Apply auto-miracle if triggered
          if (autoMiracle) {
            newWorshippers[autoMiracle.type] += autoMiracle.power;
          }

          let newActiveGem = prev.activeGem;
          let newActiveGemTimeRemaining = Math.max(0, prev.activeGemTimeRemaining - delta);
          const newGemCooldowns = { ...prev.gemCooldowns };

          (Object.keys(newGemCooldowns) as GemType[]).forEach(gem => {
            newGemCooldowns[gem] = Math.max(0, newGemCooldowns[gem] - delta);
          });

          if (newActiveGem && newActiveGemTimeRemaining <= 0) {
            const betrayalLvl = prev.relics[RelicId.BETRAYAL] || 0;
            newGemCooldowns[newActiveGem] = Math.max(60, 120 - betrayalLvl * 10); 
            newActiveGem = null;
          }

          const newMaxByType = { ...prev.maxWorshippersByType };
          WORSHIPPER_ORDER.forEach(type => {
            newMaxByType[type] = Math.max(newMaxByType[type], newWorshippers[type]);
          });

          // Assistant Auto-Unlock Logic
          let newAssistantLevel = prev.assistantLevel;
          let newAssistantActive = prev.assistantActive;
          if (newMaxByType[WorshipperType.INDOLENT] >= 1000 && newAssistantLevel === 0) {
            newAssistantLevel = 1;
            newAssistantActive = true;
          }

          // Gem Unlocks logic
          const newUnlockedGems = [...prev.unlockedGems];
          let gemDiscovered: GemType | null = null;
          const checkUnlock = (gem: GemType, condition: boolean) => {
            if (!newUnlockedGems.includes(gem) && condition) {
              newUnlockedGems.push(gem);
              gemDiscovered = gem;
            }
          };
          checkUnlock(GemType.LAPIS, prev.maxWorshippersByType[WorshipperType.INDOLENT] >= 500);
          checkUnlock(GemType.QUARTZ, prev.maxWorshippersByType[WorshipperType.LOWLY] >= 50);
          checkUnlock(GemType.EMERALD, prev.maxWorshippersByType[WorshipperType.WORLDLY] >= 50);
          checkUnlock(GemType.RUBY, prev.maxWorshippersByType[WorshipperType.ZEALOUS] >= 50);

          return {
             ...prev,
             worshippers: newWorshippers,
             totalWorshippers: Object.values(newWorshippers).reduce((a, b) => a + b, 0),
             totalAccruedWorshippers: prev.totalAccruedWorshippers + (autoMiracle?.power || 0),
             maxTotalWorshippers: Math.max(prev.maxTotalWorshippers, Object.values(newWorshippers).reduce((a, b) => a + b, 0)),
             maxWorshippersByType: newMaxByType,
             activeGem: newActiveGem,
             activeGemTimeRemaining: newActiveGemTimeRemaining,
             gemCooldowns: newGemCooldowns,
             unlockedGems: newUnlockedGems,
             assistantLevel: newAssistantLevel,
             assistantActive: newAssistantActive,
             showGemDiscovery: prev.showGemDiscovery || gemDiscovered,
             lastSaveTime: now,
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
  }, [performMiracleInternal]);

  const performMiracle = useCallback(() => {
    const { power, type } = performMiracleInternal(gameState);
    setGameState(prev => ({
        ...prev,
        worshippers: { ...prev.worshippers, [type]: prev.worshippers[type] + power },
        totalAccruedWorshippers: prev.totalAccruedWorshippers + power,
        totalClicks: prev.totalClicks + 1,
    }));
    return { power, type };
  }, [gameState.miracleLevel, gameState.activeGem, gameState.relics, performMiracleInternal]);

  const activateGem = useCallback((gem: GemType) => {
    setGameState(prev => {
      if (prev.activeGem || prev.gemCooldowns[gem] > 0 || !prev.unlockedGems.includes(gem)) return prev;
      return { ...prev, activeGem: gem, activeGemTimeRemaining: 30 };
    });
  }, []);

  const purchaseRelic = useCallback((relicId: RelicId) => {
    setGameState(prev => {
      const lvl = prev.relics[relicId] || 0;
      const cost = calculateRelicCost(relicId, lvl);
      if (prev.souls < cost) return prev;
      return {
        ...prev,
        souls: prev.souls - cost,
        relics: { ...prev.relics, [relicId]: lvl + 1 }
      };
    });
  }, []);

  const toggleVessel = useCallback((vesselId: string) => {
    setGameState(prev => ({
      ...prev,
      vesselToggles: { ...prev.vesselToggles, [vesselId]: !prev.vesselToggles[vesselId] }
    }));
  }, []);

  const triggerPrestige = useCallback(() => {
    setGameState(prev => {
       const soulsEarned = calculateSoulsEarned(prev);
       const contractActive = prev.relics[RelicId.CONTRACT] > 0;
       return {
          ...INITIAL_STATE,
          souls: prev.souls + soulsEarned,
          relics: prev.relics,
          settings: prev.settings,
          assistantLevel: contractActive ? prev.assistantLevel : 0,
          assistantActive: contractActive ? prev.assistantActive : false,
          maxTotalWorshippers: prev.maxTotalWorshippers,
          maxWorshippersByType: prev.maxWorshippersByType,
          hasSeenStartSplash: true,
          hasSeenVesselIntro: true,
       };
    });
  }, []);

  const purchaseUpgrade = useCallback(() => {
    setGameState(prev => {
      const bulk = calculateBulkUpgrade(prev.miracleLevel, prev.miracleIncrement, prev);
      if (prev.worshippers[WorshipperType.INDOLENT] < bulk.cost || bulk.count === 0) return prev;
      return { 
        ...prev, 
        worshippers: { ...prev.worshippers, [WorshipperType.INDOLENT]: prev.worshippers[WorshipperType.INDOLENT] - bulk.cost }, 
        miracleLevel: prev.miracleLevel + bulk.count 
      };
    });
  }, []);

  const purchaseVessel = useCallback((vesselId: string) => {
    setGameState(prev => {
        const lvl = prev.vesselLevels[vesselId] || 0;
        const bulk = calculateBulkVesselBuy(vesselId, lvl, prev.vesselIncrement, prev);
        if (prev.worshippers[bulk.costType] < bulk.cost || bulk.count === 0) return prev;
        return { 
          ...prev, 
          worshippers: { ...prev.worshippers, [bulk.costType]: prev.worshippers[bulk.costType] - bulk.cost }, 
          vesselLevels: { ...prev.vesselLevels, [vesselId]: lvl + bulk.count } 
        };
    });
  }, []);

  const purchaseAssistant = useCallback(() => {
    setGameState(prev => {
        const bulk = calculateAssistantBulkVesselBuy(prev.assistantLevel, prev.miracleIncrement, prev);
        if (prev.worshippers[bulk.costType] < bulk.cost || bulk.count === 0) return prev;
        return { 
          ...prev, 
          worshippers: { ...prev.worshippers, [bulk.costType]: prev.worshippers[bulk.costType] - bulk.cost }, 
          assistantLevel: prev.assistantLevel + bulk.count 
        };
    });
  }, []);

  const toggleAssistant = useCallback(() => {
    setGameState(prev => ({ ...prev, assistantActive: !prev.assistantActive }));
  }, []);

  const setMiracleIncrement = useCallback((val: IncrementType) => {
    setGameState(prev => ({ ...prev, miracleIncrement: val }));
  }, []);

  const setVesselIncrement = useCallback((val: IncrementType) => {
    setGameState(prev => ({ ...prev, vesselIncrement: val }));
  }, []);

  return {
    gameState,
    clickPower: calculateClickPower(gameState.miracleLevel),
    passiveIncome: Object.values(calculateProductionByType(gameState)).reduce((a, b) => a + b, 0),
    performMiracle,
    lastMiracleEvent,
    activateGem,
    closeDiscovery: () => setGameState(prev => ({ ...prev, showGemDiscovery: null })),
    purchaseRelic,
    toggleVessel,
    toggleAssistant,
    triggerPrestige,
    purchaseUpgrade,
    purchaseVessel,
    purchaseAssistant,
    setMiracleIncrement,
    setVesselIncrement,
    toggleSound: () => setGameState(prev => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } })),
    toggleMusic: () => setGameState(prev => ({ ...prev, settings: { ...prev.settings, musicEnabled: !prev.settings.musicEnabled } })),
    setMusicVolume: (v: number) => setGameState(prev => ({ ...prev, settings: { ...prev.settings, musicVolume: v } })),
    offlineGains,
    closeOfflineModal: () => setOfflineGains(null),
    setFlag: (flag: keyof GameState, value: any) => setGameState(prev => ({ ...prev, [flag]: value })),
    resetSave: () => { localStorage.removeItem(STORAGE_KEY); setGameState(INITIAL_STATE); },
    debugAddWorshippers: (type: WorshipperType, amount: number) => setGameState(prev => ({ ...prev, worshippers: { ...prev.worshippers, [type]: prev.worshippers[type] + amount } })),
    debugUnlockFeature: (feature: 'GEMS' | 'VESSELS' | 'END_TIMES' | 'ASSISTANT') => {
        setGameState(prev => {
            const next = { ...prev };
            if (feature === 'GEMS') next.unlockedGems = [GemType.LAPIS, GemType.QUARTZ, GemType.EMERALD, GemType.RUBY];
            if (feature === 'VESSELS') next.maxWorshippersByType[WorshipperType.INDOLENT] = 1000;
            if (feature === 'END_TIMES') next.maxWorshippersByType[WorshipperType.ZEALOUS] = PRESTIGE_UNLOCK_THRESHOLD;
            if (feature === 'ASSISTANT') {
                next.maxWorshippersByType[WorshipperType.INDOLENT] = Math.max(next.maxWorshippersByType[WorshipperType.INDOLENT], 1000);
            }
            return next;
        });
    },
    debugAddSouls: (amount: number) => setGameState(prev => ({ ...prev, souls: prev.souls + amount }))
  };
};
