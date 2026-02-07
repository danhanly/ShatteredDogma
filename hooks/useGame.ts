
import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, WorshipperType, VesselId, WORSHIPPER_ORDER, GemType } from '../types';
import { 
  calculateClickPower, 
  calculateUpgradeCost, 
  rollWorshipperType, 
  sacrificeWorshippers,
  deductWorshippers,
  canAffordUpgrade,
  calculateVesselCost,
  calculateTotalPassiveIncome,
  calculateProductionByType,
  calculateConsumptionByType,
  calculateBulkUpgrade,
  calculateBulkVesselBuy,
  calculateSoulsEarned,
  calculateVesselOutput,
  calculateAssistantCost,
  calculateAssistantInterval,
  calculateAssistantBulkVesselBuy
} from '../services/gameService';
import { VESSEL_DEFINITIONS, CONSUMPTION_RATES, PRESTIGE_UNLOCK_THRESHOLD } from '../constants';

const STORAGE_KEY = 'shattered_dogma_simple_save_v1'; 

const INITIAL_STATE: GameState = {
  worshippers: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  totalWorshippers: 0,
  totalAccruedWorshippers: 0,
  miracleLevel: 1, 
  vesselLevels: {}, 
  souls: 0,
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
          miracleLevel: parsed.miracleLevel ? Math.max(1, parsed.miracleLevel) : 1,
          worshippers: { ...INITIAL_STATE.worshippers, ...(parsed.worshippers || {}) },
          maxWorshippersByType: { ...INITIAL_STATE.maxWorshippersByType, ...(parsed.maxWorshippersByType || {}) },
          settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
          lastSaveTime: parsed.lastSaveTime || Date.now() 
        };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return INITIAL_STATE;
  });

  const lastPassiveTick = useRef(Date.now());

  const processOfflineProgress = useCallback((lastTime: number) => {
    const now = Date.now();
    const timeDiffSeconds = (now - lastTime) / 1000;

    if (timeDiffSeconds > 10) {
      setGameState(prev => {
        const maxTime = 30 * 60; // 30 mins cap
        const effectiveTime = Math.min(timeDiffSeconds, maxTime);
        const incomeByType = calculateProductionByType(prev.vesselLevels, prev.isPaused, prev.souls);
        const totalIncome = Object.values(incomeByType).reduce((a: number, b: number) => a + b, 0);

        if (totalIncome > 0) {
          const gains: Record<WorshipperType, number> = {
            [WorshipperType.INDOLENT]: incomeByType[WorshipperType.INDOLENT] * effectiveTime,
            [WorshipperType.LOWLY]: incomeByType[WorshipperType.LOWLY] * effectiveTime,
            [WorshipperType.WORLDLY]: incomeByType[WorshipperType.WORLDLY] * effectiveTime,
            [WorshipperType.ZEALOUS]: incomeByType[WorshipperType.ZEALOUS] * effectiveTime,
          };

          const totalGained = Object.values(gains).reduce((a: number, b: number) => a + b, 0);
          const newWorshippers = { ...prev.worshippers };
          const newMaxByType = { ...prev.maxWorshippersByType };

          (Object.keys(gains) as WorshipperType[]).forEach(type => {
            newWorshippers[type] += gains[type];
            newMaxByType[type] = Math.max(newMaxByType[type], newWorshippers[type]);
          });

          setOfflineGains({ gains, time: effectiveTime });

          return {
            ...prev,
            worshippers: newWorshippers,
            totalWorshippers: prev.totalWorshippers + totalGained,
            totalAccruedWorshippers: prev.totalAccruedWorshippers + totalGained,
            maxTotalWorshippers: Math.max(prev.maxTotalWorshippers, prev.totalWorshippers + totalGained),
            maxWorshippersByType: newMaxByType,
            lastSaveTime: now 
          };
        }
        return { ...prev, lastSaveTime: now };
      });
      lastPassiveTick.current = now;
    }
  }, []);

  useEffect(() => {
    if (gameState.lastSaveTime) {
      processOfflineProgress(gameState.lastSaveTime);
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastPassiveTick.current) / 1000; 
      
      if (delta >= 1 && document.visibilityState === 'visible') {
        lastPassiveTick.current = now;

        setGameState(prev => {
          const production = calculateProductionByType(prev.vesselLevels, prev.isPaused, prev.souls);
          const consumption = calculateConsumptionByType(prev.vesselLevels, prev.isPaused, prev.souls);
          
          const newWorshippers = { ...prev.worshippers };
          const newPaused = { ...prev.isPaused };
          let anyStarvingNow = false;

          WORSHIPPER_ORDER.forEach(type => {
            newWorshippers[type] = Math.max(0, newWorshippers[type] - (consumption[type] * delta));
          });

          const newIgnoredHaltVessels = [...prev.ignoredHaltVessels];

          const ownedTypes = new Set<WorshipperType>();
          Object.entries(prev.vesselLevels).forEach(([id, level]) => {
            if (level > 0) {
              const def = VESSEL_DEFINITIONS.find(v => v.id === id);
              if (def) ownedTypes.add(def.type);
            }
          });

          (Object.keys(CONSUMPTION_RATES) as WorshipperType[]).forEach(consumerType => {
            const requirements = CONSUMPTION_RATES[consumerType];
            const isCurrentlyPaused = prev.isPaused[consumerType];
            
            let isStarving = false;
            (Object.keys(requirements) as WorshipperType[]).forEach(resourceType => {
              if (newWorshippers[resourceType] <= 0 && (requirements[resourceType] || 0) > 0) {
                isStarving = true;
              }
            });

            if (!isCurrentlyPaused) {
              if (isStarving) {
                newPaused[consumerType] = true;
                if (ownedTypes.has(consumerType)) {
                  anyStarvingNow = true;
                }
              }
            } else {
              let canResume = !isStarving; 
              if (canResume) {
                const potentialNeeds: Partial<Record<WorshipperType, number>> = {};
                VESSEL_DEFINITIONS.forEach(def => {
                  if (def.type === consumerType) {
                    const level = prev.vesselLevels[def.id] || 0;
                    const output = calculateVesselOutput(def.id, level, prev.souls);
                    (Object.keys(requirements) as WorshipperType[]).forEach(res => {
                      potentialNeeds[res] = (potentialNeeds[res] || 0) + output * (requirements[res] || 0);
                    });
                  }
                });

                (Object.keys(requirements) as WorshipperType[]).forEach(resourceType => {
                  const currentSurplusOfRes = production[resourceType] - consumption[resourceType];
                  const needOfThisCaste = potentialNeeds[resourceType] || 0;
                  if (currentSurplusOfRes <= needOfThisCaste) {
                    canResume = false;
                  }
                });
              }

              if (canResume) {
                newPaused[consumerType] = false;
                for (let i = newIgnoredHaltVessels.length - 1; i >= 0; i--) {
                  const vId = newIgnoredHaltVessels[i];
                  const def = VESSEL_DEFINITIONS.find(v => v.id === vId);
                  if (def && def.type === consumerType) {
                    newIgnoredHaltVessels.splice(i, 1);
                  }
                }
              } else {
                if (ownedTypes.has(consumerType)) {
                  anyStarvingNow = true;
                }
              }
            }
          });

          let newPausedStartTime = prev.pausedStartTime;
          if (anyStarvingNow) {
            if (newPausedStartTime === 0) newPausedStartTime = now;
          } else {
            newPausedStartTime = 0;
          }

          let newHasSeenPausedModal = prev.hasSeenPausedModal;
          if (!newHasSeenPausedModal && newPausedStartTime !== 0 && (now - newPausedStartTime) >= 5000) {
            if (ownedTypes.size > 1) {
              newHasSeenPausedModal = true;
            }
          }

          let newActiveGem = prev.activeGem;
          let newActiveGemTimeRemaining = Math.max(0, prev.activeGemTimeRemaining - delta);
          const newGemCooldowns = { ...prev.gemCooldowns };

          (Object.keys(newGemCooldowns) as GemType[]).forEach(gem => {
            newGemCooldowns[gem] = Math.max(0, newGemCooldowns[gem] - delta);
          });

          if (newActiveGem && newActiveGemTimeRemaining <= 0) {
            newGemCooldowns[newActiveGem] = 300; 
            newActiveGem = null;
          }

          WORSHIPPER_ORDER.forEach(type => {
            if (!newPaused[type]) {
              newWorshippers[type] += production[type] * delta;
            }
          });

          const totalProd = Object.values(production).reduce((a: number, b: number) => a + b, 0);
          const newMaxByType = { ...prev.maxWorshippersByType };
          WORSHIPPER_ORDER.forEach(type => {
            newMaxByType[type] = Math.max(newMaxByType[type], newWorshippers[type]);
          });

          const newUnlockedGems = [...prev.unlockedGems];
          let gemDiscovered: GemType | null = null;

          const checkUnlock = (gem: GemType, condition: boolean, previousGem?: GemType) => {
            const alreadyUnlocked = newUnlockedGems.includes(gem);
            const prevUnlocked = !previousGem || newUnlockedGems.includes(previousGem);
            if (!alreadyUnlocked && condition && prevUnlocked) {
              newUnlockedGems.push(gem);
              gemDiscovered = gem;
            }
          };

          const indolentVesselLvl = prev.vesselLevels[VesselId.INDOLENT_1] || 0;
          const lowlyVesselLvl = prev.vesselLevels[VesselId.LOWLY_1] || 0;
          const worldlyVesselLvl = prev.vesselLevels[VesselId.WORLDLY_1] || 0;

          checkUnlock(GemType.LAPIS, indolentVesselLvl >= 5);
          checkUnlock(GemType.QUARTZ, ((indolentVesselLvl >= 10 || prev.miracleLevel >= 20) && production[WorshipperType.INDOLENT] >= 45), GemType.LAPIS);
          checkUnlock(GemType.EMERALD, ((lowlyVesselLvl >= 10 || prev.miracleLevel >= 50) && production[WorshipperType.LOWLY] >= 75), GemType.QUARTZ);
          checkUnlock(GemType.RUBY, ((worldlyVesselLvl >= 30 || prev.miracleLevel >= 100) && 
            production[WorshipperType.INDOLENT] >= 45 && production[WorshipperType.LOWLY] >= 45 && production[WorshipperType.WORLDLY] >= 45), GemType.EMERALD);

          return {
             ...prev,
             totalWorshippers: Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0),
             totalAccruedWorshippers: prev.totalAccruedWorshippers + (totalProd * delta),
             maxTotalWorshippers: Math.max(prev.maxTotalWorshippers, Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0)),
             worshippers: newWorshippers,
             maxWorshippersByType: newMaxByType,
             isPaused: newPaused,
             pausedStartTime: newPausedStartTime,
             hasSeenPausedModal: newHasSeenPausedModal,
             ignoredHaltVessels: newIgnoredHaltVessels,
             activeGem: newActiveGem,
             activeGemTimeRemaining: newActiveGemTimeRemaining,
             gemCooldowns: newGemCooldowns,
             unlockedGems: newUnlockedGems,
             showGemDiscovery: prev.showGemDiscovery || gemDiscovered,
             lastSaveTime: now 
          };
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState.souls]);

  const performMiracle = useCallback((isAuto: boolean = false) => {
    const powerBase = calculateClickPower(gameState.miracleLevel, gameState.souls);
    let power = powerBase;
    let type = rollWorshipperType(); 

    if (gameState.activeGem === GemType.LAPIS) {
        power = powerBase * 2;
        type = WorshipperType.INDOLENT;
    } else if (gameState.activeGem === GemType.QUARTZ) {
        type = WorshipperType.LOWLY;
    } else if (gameState.activeGem === GemType.EMERALD) {
        type = WorshipperType.WORLDLY;
    } else if (gameState.activeGem === GemType.RUBY) {
        type = WorshipperType.ZEALOUS;
    }

    setGameState(prev => {
        const newWorshippers = {
            ...prev.worshippers,
            [type]: prev.worshippers[type] + power,
        };
        
        return {
            ...prev,
            worshippers: newWorshippers,
            totalWorshippers: Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0),
            totalAccruedWorshippers: prev.totalAccruedWorshippers + power,
            maxTotalWorshippers: Math.max(prev.maxTotalWorshippers, Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0)),
            maxWorshippersByType: {
                ...prev.maxWorshippersByType,
                [type]: Math.max(prev.maxWorshippersByType[type], newWorshippers[type])
            },
            totalClicks: prev.totalClicks + 1,
            lastSaveTime: Date.now()
        };
    });

    if (isAuto) {
        setLastMiracleEvent({ power, type, isAuto: true, timestamp: Date.now() });
    }

    return { power, type };
  }, [gameState.miracleLevel, gameState.activeGem, gameState.souls]);

  useEffect(() => {
    if (gameState.assistantLevel <= 0) return;
    const intervalTime = calculateAssistantInterval(gameState.assistantLevel);
    const interval = setInterval(() => {
        performMiracle(true);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [gameState.assistantLevel, performMiracle]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const activateGem = useCallback((gem: GemType) => {
    setGameState(prev => {
      if (prev.activeGem || prev.gemCooldowns[gem] > 0 || !prev.unlockedGems.includes(gem)) return prev;
      return {
        ...prev,
        activeGem: gem,
        activeGemTimeRemaining: 30, 
      };
    });
  }, []);

  const closeDiscovery = useCallback(() => {
    setGameState(prev => ({ ...prev, showGemDiscovery: null }));
  }, []);

  const purchaseUpgrade = useCallback((count: number = 1) => {
    setGameState(prev => {
      const bulk = calculateBulkUpgrade(prev.miracleLevel, count, prev);
      const availableFunds = WORSHIPPER_ORDER.reduce((sum, t) => sum + prev.worshippers[t], 0);

      if (availableFunds < bulk.cost) return prev;
      
      const newWorshippers = deductWorshippers(prev, bulk.cost);
      return {
        ...prev,
        worshippers: newWorshippers,
        totalWorshippers: Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0),
        miracleLevel: prev.miracleLevel + bulk.count,
        lastSaveTime: Date.now()
      };
    });
  }, []);

  const purchaseVessel = useCallback((vesselId: string, type: WorshipperType, count: number = 1) => {
    setGameState(prev => {
        const currentLevel = prev.vesselLevels[vesselId] || 0;
        const bulk = calculateBulkVesselBuy(vesselId, currentLevel, count, prev, type);
        if (prev.worshippers[type] < bulk.cost) return prev;

        const newWorshippers = { ...prev.worshippers, [type]: prev.worshippers[type] - bulk.cost };
        return {
            ...prev,
            worshippers: newWorshippers,
            totalWorshippers: Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0),
            vesselLevels: { ...prev.vesselLevels, [vesselId]: currentLevel + bulk.count },
            lastSaveTime: Date.now()
        };
    });
  }, []);

  const purchaseAssistant = useCallback((count: number = 1) => {
    setGameState(prev => {
        const bulk = calculateAssistantBulkVesselBuy(prev.assistantLevel, count, prev);
        if (bulk.count === 0) return prev;
        
        // Assistant costs are always one-by-one from the cost type
        let newWorshippers = { ...prev.worshippers };
        let currentLvl = prev.assistantLevel;
        for (let i = 0; i < bulk.count; i++) {
           const { amount, type } = calculateAssistantCost(currentLvl);
           newWorshippers[type] -= amount;
           currentLvl++;
        }

        return {
            ...prev,
            worshippers: newWorshippers,
            totalWorshippers: Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0),
            assistantLevel: currentLvl,
            lastSaveTime: Date.now()
        };
    });
  }, []);

  const triggerPrestige = useCallback(() => {
    setGameState(prev => {
       const soulsEarned = calculateSoulsEarned(prev);
       if (soulsEarned <= 0) return prev;
       return {
          ...INITIAL_STATE,
          souls: prev.souls + soulsEarned,
          settings: prev.settings,
          maxTotalWorshippers: prev.maxTotalWorshippers,
          maxWorshippersByType: prev.maxWorshippersByType,
          hasSeenStartSplash: true,
          // Fixed syntax error: changed '=' to ':' in object literal
          hasSeenVesselIntro: true,
          lastSaveTime: Date.now()
       };
    });
  }, []);

  const resetSave = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState({ ...INITIAL_STATE, lastSaveTime: Date.now() });
    setOfflineGains(null);
  }, []);

  const ignoreHaltWarning = useCallback((vesselId: string) => {
    setGameState(prev => ({
        ...prev,
        ignoredHaltVessels: [...prev.ignoredHaltVessels, vesselId]
    }));
  }, []);

  const debugAddWorshippers = useCallback((type: WorshipperType, amount: number) => {
    setGameState(prev => {
      const newAmount = prev.worshippers[type] + amount;
      return {
        ...prev,
        worshippers: { ...prev.worshippers, [type]: newAmount },
        maxWorshippersByType: { ...prev.maxWorshippersByType, [type]: Math.max(prev.maxWorshippersByType[type], newAmount) }
      };
    });
  }, []);

  const debugUnlockFeature = useCallback((feature: 'GEMS' | 'VESSELS' | 'END_TIMES' | 'ASSISTANT') => {
    setGameState(prev => {
      const next = { ...prev };
      if (feature === 'GEMS') {
        next.unlockedGems = [GemType.LAPIS, GemType.QUARTZ, GemType.EMERALD, GemType.RUBY];
        next.hasSeenMiracleIntro = true;
      } else if (feature === 'VESSELS') {
        next.hasSeenVesselIntro = true;
        next.maxWorshippersByType[WorshipperType.INDOLENT] = Math.max(next.maxWorshippersByType[WorshipperType.INDOLENT], 100);
        next.worshippers[WorshipperType.INDOLENT] = Math.max(next.worshippers[WorshipperType.INDOLENT], 1000);
      } else if (feature === 'END_TIMES') {
        next.hasSeenEodIntro = true;
        next.maxWorshippersByType[WorshipperType.ZEALOUS] = Math.max(next.maxWorshippersByType[WorshipperType.ZEALOUS], PRESTIGE_UNLOCK_THRESHOLD);
        next.worshippers[WorshipperType.ZEALOUS] = Math.max(next.worshippers[WorshipperType.ZEALOUS], PRESTIGE_UNLOCK_THRESHOLD);
      } else if (feature === 'ASSISTANT') {
        next.hasSeenAssistantIntro = true;
        next.totalClicks = Math.max(next.totalClicks, 100);
        next.vesselLevels[VesselId.WORLDLY_1] = Math.max(next.vesselLevels[VesselId.WORLDLY_1] || 0, 2);
        next.worshippers[WorshipperType.WORLDLY] = Math.max(next.worshippers[WorshipperType.WORLDLY], 100);
      }
      return next;
    });
  }, []);

  const debugAddSouls = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, souls: prev.souls + amount }));
  }, []);

  return {
    gameState,
    clickPower: calculateClickPower(gameState.miracleLevel, gameState.souls),
    passiveIncome: calculateTotalPassiveIncome(gameState.vesselLevels, gameState.isPaused, gameState.souls),
    performMiracle,
    lastMiracleEvent,
    activateGem,
    closeDiscovery,
    purchaseUpgrade, 
    purchaseVessel,
    purchaseAssistant,
    offlineGains,
    closeOfflineModal: () => setOfflineGains(null),
    triggerPrestige,
    setFlag: (flag: keyof GameState, value: any) => setGameState(prev => ({ ...prev, [flag]: value })),
    resetSave,
    toggleSound: () => setGameState(prev => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } })),
    toggleMusic: () => setGameState(prev => ({ ...prev, settings: { ...prev.settings, musicEnabled: !prev.settings.musicEnabled } })),
    setMusicVolume: (volume: number) => setGameState(prev => ({ ...prev, settings: { ...prev.settings, musicVolume: volume } })),
    ignoreHaltWarning,
    debugAddWorshippers,
    debugUnlockFeature,
    debugAddSouls
  };
};
