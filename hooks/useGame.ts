
import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GemType, WorshipperType, VesselId, RelicId, WORSHIPPER_ORDER } from '../types';
import { 
  calculateClickPower, 
  calculateUpgradeCost, 
  rollWorshipperType, 
  sacrificeWorshippers,
  deductWorshippers,
  canAffordUpgrade,
  getMilestoneState,
  calculateVesselCost,
  calculateTotalPassiveIncome,
  calculatePassiveIncomeByType,
  calculateBulkUpgrade,
  calculateBulkVesselBuy,
  calculateSoulsEarned,
  calculateRelicCost,
  calculateVesselOutput
} from '../services/gameService';
import { VESSEL_DEFINITIONS } from '../constants';

const STORAGE_KEY = 'shattered_dogma_save_v1.4'; 

const INITIAL_STATE: GameState = {
  worshippers: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  totalWorshippers: 0,
  totalAccruedWorshippers: 0,
  lockedWorshippers: [],
  miracleLevel: 0,
  vesselLevels: {}, 
  equippedGem: GemType.NONE,
  unlockedGems: [],
  showGemDiscovery: null,
  souls: 0,
  relicLevels: {},
  influenceUsage: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  lastInfluenceTime: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  maxTotalWorshippers: 0,
  maxWorshippersByType: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  hasSeenEodIntro: false,
  hasSeenStartSplash: false,
  hasSeenVesselIntro: false,
  hasSeenAbyssIntro: false,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    musicVolume: 0.3,
  },
  lastSaveTime: Date.now(),
};

export const useGame = () => {
  const [offlineGains, setOfflineGains] = useState<{ gains: Record<WorshipperType, number>, time: number } | null>(null);

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        
        return {
          ...INITIAL_STATE,
          ...parsed,
          worshippers: { ...INITIAL_STATE.worshippers, ...(parsed.worshippers || {}) },
          maxWorshippersByType: { ...INITIAL_STATE.maxWorshippersByType, ...(parsed.maxWorshippersByType || {}) },
          settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
          lockedWorshippers: parsed.lockedWorshippers || [],
          // Migration: totalAccruedWorshippers fallback to maxTotalWorshippers or totalWorshippers if missing
          totalAccruedWorshippers: parsed.totalAccruedWorshippers ?? (parsed.maxTotalWorshippers ?? parsed.totalWorshippers ?? 0),
          influenceUsage: parsed.influenceUsage || { ...INITIAL_STATE.influenceUsage },
          lastInfluenceTime: parsed.lastInfluenceTime || { ...INITIAL_STATE.lastInfluenceTime },
          lastSaveTime: parsed.lastSaveTime || now 
        };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return INITIAL_STATE;
  });

  const lastPassiveTick = useRef(Date.now());

  // Function to calculate and apply offline progress
  const processOfflineProgress = useCallback((lastTime: number) => {
    const now = Date.now();
    const timeDiffSeconds = (now - lastTime) / 1000;

    // Minimum 10 seconds away to trigger the modal
    if (timeDiffSeconds > 10) {
      setGameState(prev => {
        // Calculate Offline Cap
        const baseMaxTime = 30 * 60; // 30 minutes base
        const relicLevel = prev.relicLevels[RelicId.OFFLINE_BOOST] || 0;
        const maxTime = baseMaxTime + (relicLevel * 5 * 60); // +5 mins per level

        const effectiveTime = Math.min(timeDiffSeconds, maxTime);

        const incomeByType = calculatePassiveIncomeByType(prev.vesselLevels, prev.relicLevels);
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

  // Handle initial load offline progress
  useEffect(() => {
    if (gameState.lastSaveTime) {
      processOfflineProgress(gameState.lastSaveTime);
    }
  }, []); // Only on mount

  // Handle Visibility Change (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When user returns to tab, check if they were away long enough
        // We use a functional setter to get the most recent lastSaveTime from state
        setGameState(current => {
          const now = Date.now();
          const timeDiffSeconds = (now - current.lastSaveTime) / 1000;
          
          if (timeDiffSeconds > 10) {
            // We trigger the actual processing outside the state update to avoid loops
            // but we need to know the 'current' lastSaveTime
            setTimeout(() => processOfflineProgress(current.lastSaveTime), 0);
          }
          return current;
        });
      } else {
        // Tab hidden: ensure the last tick is updated so we don't have massive gaps
        // on top of the offline calculation
        setGameState(prev => ({ ...prev, lastSaveTime: Date.now() }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [processOfflineProgress]);

  // Main passive income loop
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastPassiveTick.current) / 1000; 
      
      // Browsers throttle background tabs to 1s or more. 
      // We only process the tick if the document is visible.
      // If invisible, we rely on the visibilitychange handler to catch up.
      if (delta >= 1 && document.visibilityState === 'visible') {
        lastPassiveTick.current = now;
        
        const incomeByType = calculatePassiveIncomeByType(gameState.vesselLevels, gameState.relicLevels);
        const totalIncome = Object.values(incomeByType).reduce((a: number, b: number) => a + b, 0);

        setGameState(prev => {
          const newWorshippers = { ...prev.worshippers };
          const newMaxByType = { ...prev.maxWorshippersByType };
          
          if (totalIncome > 0) {
            (Object.keys(incomeByType) as WorshipperType[]).forEach(type => {
                newWorshippers[type] += incomeByType[type];
                newMaxByType[type] = Math.max(newMaxByType[type], newWorshippers[type]);
            });
          }

          return {
             ...prev,
             totalWorshippers: prev.totalWorshippers + totalIncome,
             totalAccruedWorshippers: prev.totalAccruedWorshippers + totalIncome,
             maxTotalWorshippers: Math.max(prev.maxTotalWorshippers, prev.totalWorshippers + totalIncome),
             worshippers: newWorshippers,
             maxWorshippersByType: newMaxByType,
             lastSaveTime: now 
          };
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState.vesselLevels, gameState.relicLevels]);

  useEffect(() => {
    try {
      const { showGemDiscovery, ...toSave } = gameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save game data:', e);
    }
  }, [gameState]);

  const milestoneState = getMilestoneState(gameState.miracleLevel);
  const clickPower = calculateClickPower(gameState.miracleLevel, gameState.relicLevels);
  const passiveIncome = calculateTotalPassiveIncome(gameState.vesselLevels, gameState.relicLevels);

  const performMiracle = useCallback(() => {
    const power = calculateClickPower(gameState.miracleLevel, gameState.relicLevels);
    let rolledType: WorshipperType = WorshipperType.INDOLENT;
    
    setGameState(prev => {
      // Pass relicLevels to apply potential GEM_BOOST
      const type = rollWorshipperType(prev.equippedGem, prev.relicLevels);
      rolledType = type;
      const newWorshippers = {
        ...prev.worshippers,
        [type]: prev.worshippers[type] + power,
      };

      return {
        ...prev,
        worshippers: newWorshippers,
        totalWorshippers: prev.totalWorshippers + power,
        totalAccruedWorshippers: prev.totalAccruedWorshippers + power,
        maxTotalWorshippers: Math.max(prev.maxTotalWorshippers, prev.totalWorshippers + power),
        maxWorshippersByType: {
          ...prev.maxWorshippersByType,
          [type]: Math.max(prev.maxWorshippersByType[type], newWorshippers[type])
        },
        lastSaveTime: Date.now()
      };
    });
    
    return { power, type: rolledType };
  }, [gameState.miracleLevel, gameState.equippedGem, gameState.relicLevels]);

  const purchaseUpgrade = useCallback((count: number = 1) => {
    setGameState(prev => {
      let newWorshippers = { ...prev.worshippers };
      
      if (count === 1) {
         if (!canAffordUpgrade(prev)) return prev;
         newWorshippers = sacrificeWorshippers(prev);
      } else {
         let totalCost = 0;
         for (let i = 0; i < count; i++) totalCost += calculateUpgradeCost(prev.miracleLevel + i);
         
         const availableFunds = WORSHIPPER_ORDER
            .filter(t => !prev.lockedWorshippers.includes(t))
            .reduce((sum, t) => sum + prev.worshippers[t], 0);

         if (availableFunds < totalCost) return prev;
         
         newWorshippers = deductWorshippers(prev, totalCost);
      }
      
      const newTotal = Object.values(newWorshippers).reduce((a: number, b: number) => a + b, 0);
      const nextLevel = prev.miracleLevel + count;
      const nextMilestone = getMilestoneState(nextLevel);
      let nextUnlockedGems = [...prev.unlockedGems];
      let discoveryGem = null;

      if (nextMilestone.isMilestone && nextMilestone.definition?.gemReward) {
        const gem = nextMilestone.definition.gemReward as GemType;
        if (!nextUnlockedGems.includes(gem)) {
          nextUnlockedGems.push(gem);
          discoveryGem = gem;
        }
      }

      return {
        ...prev,
        worshippers: newWorshippers,
        totalWorshippers: newTotal,
        miracleLevel: nextLevel,
        unlockedGems: nextUnlockedGems,
        showGemDiscovery: discoveryGem,
        lastSaveTime: Date.now()
      };
    });
  }, [gameState]);

  const purchaseVessel = useCallback((vesselId: string, type: WorshipperType, count: number = 1) => {
    setGameState(prev => {
        const currentLevel = prev.vesselLevels[vesselId] || 0;
        let totalCost = 0;
        for (let i = 0; i < count; i++) totalCost += calculateVesselCost(vesselId, currentLevel + i, prev.influenceUsage);
        if (prev.worshippers[type] < totalCost) return prev;

        return {
            ...prev,
            worshippers: { ...prev.worshippers, [type]: prev.worshippers[type] - totalCost },
            totalWorshippers: prev.totalWorshippers - totalCost,
            vesselLevels: { ...prev.vesselLevels, [vesselId]: currentLevel + count },
            lastSaveTime: Date.now()
        };
    });
  }, []);

  const triggerPrestige = useCallback(() => {
    setGameState(prev => {
       const soulsEarned = calculateSoulsEarned(prev.totalAccruedWorshippers); // Using totalAccruedWorshippers
       if (soulsEarned <= 0) return prev;
       return {
          ...INITIAL_STATE,
          souls: prev.souls + soulsEarned,
          relicLevels: prev.relicLevels,
          settings: prev.settings,
          maxTotalWorshippers: prev.maxTotalWorshippers,
          maxWorshippersByType: prev.maxWorshippersByType,
          hasSeenEodIntro: true,
          hasSeenStartSplash: true,
          hasSeenVesselIntro: true,
          hasSeenAbyssIntro: prev.hasSeenAbyssIntro,
          lastSaveTime: Date.now()
       };
    });
  }, []);

  const purchaseRelic = useCallback((relicId: string) => {
    setGameState(prev => {
        const currentLevel = prev.relicLevels[relicId] || 0;
        const cost = calculateRelicCost(relicId, currentLevel);
        if (prev.souls < cost) return prev;
        return {
            ...prev,
            souls: prev.souls - cost,
            relicLevels: { ...prev.relicLevels, [relicId]: currentLevel + 1 },
            lastSaveTime: Date.now()
        };
    });
  }, []);

  const setFlag = useCallback((flag: keyof GameState, value: boolean) => {
    setGameState(prev => ({ ...prev, [flag]: value }));
  }, []);

  const equipGem = useCallback((gem: GemType) => {
    setGameState(prev => ({ ...prev, equippedGem: gem }));
  }, []);

  const toggleSound = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled }
    }));
  }, []);

  const toggleMusic = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, musicEnabled: !prev.settings.musicEnabled }
    }));
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, musicVolume: volume }
    }));
  }, []);

  const closeDiscovery = useCallback(() => {
    setGameState(prev => ({ ...prev, showGemDiscovery: null }));
  }, []);

  const closeOfflineModal = useCallback(() => {
    setOfflineGains(null);
  }, []);

  const toggleWorshipperLock = useCallback((type: WorshipperType) => {
    setGameState(prev => {
        const isLocked = prev.lockedWorshippers.includes(type);
        const newLocked = isLocked 
            ? prev.lockedWorshippers.filter(t => t !== type)
            : [...prev.lockedWorshippers, type];
        return { ...prev, lockedWorshippers: newLocked };
    });
  }, []);

  const debugAddWorshippers = useCallback((type: WorshipperType, amount: number) => {
    setGameState(prev => {
        const newCount = (prev.worshippers[type] || 0) + amount;
        const newWorshippers = { ...prev.worshippers, [type]: newCount };
        
        return {
            ...prev,
            worshippers: newWorshippers,
            totalWorshippers: prev.totalWorshippers + amount,
            totalAccruedWorshippers: prev.totalAccruedWorshippers + amount,
            maxTotalWorshippers: Math.max(prev.maxTotalWorshippers, prev.totalWorshippers + amount),
            maxWorshippersByType: {
                ...prev.maxWorshippersByType,
                [type]: Math.max(prev.maxWorshippersByType[type] || 0, newCount)
            },
            lastSaveTime: Date.now()
        };
    });
  }, []);

  const debugAddSouls = useCallback((amount: number) => {
    setGameState(prev => ({
        ...prev,
        souls: prev.souls + amount,
        lastSaveTime: Date.now()
    }));
  }, []);

  const debugUnlockFeature = useCallback((feature: 'GEMS' | 'VESSELS' | 'END_TIMES' | 'ABYSS') => {
    setGameState(prev => {
        const newState = { ...prev };
        switch(feature) {
            case 'GEMS':
                newState.unlockedGems = Object.values(GemType).filter(g => g !== GemType.NONE);
                break;
            case 'VESSELS':
                // Vessels unlock when maxWorshippersByType[WorshipperType.INDOLENT] >= 100
                newState.maxWorshippersByType[WorshipperType.INDOLENT] = Math.max(newState.maxWorshippersByType[WorshipperType.INDOLENT] || 0, 100);
                newState.hasSeenVesselIntro = true; 
                break;
            case 'END_TIMES':
                // End times unlock when maxTotalWorshippers >= PRESTIGE_UNLOCK_THRESHOLD (1,000,000)
                newState.maxTotalWorshippers = Math.max(newState.maxTotalWorshippers, 1000000);
                newState.totalAccruedWorshippers = Math.max(newState.totalAccruedWorshippers, 1000000);
                newState.hasSeenEodIntro = true;
                break;
            case 'ABYSS':
                // Abyss unlocks when miracleLevel > 50
                newState.miracleLevel = Math.max(newState.miracleLevel, 51);
                newState.hasSeenAbyssIntro = true;
                break;
        }
        newState.lastSaveTime = Date.now();
        return newState;
    });
  }, []);

  const resetSave = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState({
        ...INITIAL_STATE,
        lastSaveTime: Date.now()
    });
    setOfflineGains(null);
  }, []);

  const performInfluence = useCallback((sourceType: WorshipperType, targetType: WorshipperType) => {
    setGameState(prev => {
        const sourceCount = prev.worshippers[sourceType];
        const amountToConvert = Math.floor(sourceCount * 0.5);
        
        // Calculate retention based on new Relics
        let relicId: RelicId | null = null;
        if (sourceType === WorshipperType.INDOLENT) relicId = RelicId.INFLUENCE_INDOLENT;
        if (sourceType === WorshipperType.LOWLY) relicId = RelicId.INFLUENCE_LOWLY;
        if (sourceType === WorshipperType.WORLDLY) relicId = RelicId.INFLUENCE_WORLDLY;

        const relicLevel = relicId ? (prev.relicLevels[relicId] || 0) : 0;
        const retentionRate = Math.min(relicLevel * 0.01, 1.0); // 1% per level, capped at 100%

        // Reset vessel levels with potential retention
        const newVesselLevels = { ...prev.vesselLevels };
        VESSEL_DEFINITIONS.filter(v => v.type === sourceType).forEach(v => {
            const currentLevel = prev.vesselLevels[v.id] || 0;
            const retainedLevel = Math.floor(currentLevel * retentionRate);
            newVesselLevels[v.id] = retainedLevel;
        });

        const newWorshippers = { ...prev.worshippers };
        newWorshippers[sourceType] = 0; // "Removes all"
        newWorshippers[targetType] += amountToConvert;

        const newMaxByType = { ...prev.maxWorshippersByType };
        newMaxByType[targetType] = Math.max(newMaxByType[targetType], newWorshippers[targetType]);

        // Total worshippers change: -sourceCount + amountToConvert. (Net loss)
        const netChange = amountToConvert - sourceCount;

        // Increase usage count for the SOURCE type (the one being sacrificed/influenced)
        const newInfluenceUsage = { ...prev.influenceUsage };
        newInfluenceUsage[sourceType] = (newInfluenceUsage[sourceType] || 0) + 1;

        // Update timestamp for effects
        const newLastInfluenceTime = { ...prev.lastInfluenceTime };
        newLastInfluenceTime[sourceType] = Date.now();
        
        return {
            ...prev,
            worshippers: newWorshippers,
            vesselLevels: newVesselLevels,
            totalWorshippers: prev.totalWorshippers + netChange,
            maxWorshippersByType: newMaxByType,
            influenceUsage: newInfluenceUsage,
            lastInfluenceTime: newLastInfluenceTime,
            lastSaveTime: Date.now()
        };
    });
  }, []);

  return {
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
  };
};
