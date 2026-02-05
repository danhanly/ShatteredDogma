import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GemType, WorshipperType, VesselId } from '../types';
import { 
  calculateClickPower, 
  calculateUpgradeCost, 
  rollWorshipperType, 
  sacrificeWorshippers, 
  canAffordUpgrade,
  getMilestoneState,
  calculateVesselCost,
  calculateTotalPassiveIncome,
  calculatePassiveIncomeByType
} from '../services/gameService';

const STORAGE_KEY = 'shattered_dogma_save_v1.1'; 

const INITIAL_STATE: GameState = {
  worshippers: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  totalWorshippers: 0,
  miracleLevel: 0,
  vesselLevels: {}, 
  equippedGem: GemType.NONE,
  unlockedGems: [],
  showGemDiscovery: null,
  settings: {
    soundEnabled: true,
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
        
        // Merge saved state with initial structure to handle new fields
        const loadedState = {
          ...INITIAL_STATE,
          ...parsed,
          worshippers: {
            ...INITIAL_STATE.worshippers,
            ...(parsed.worshippers || {})
          },
          settings: {
            ...INITIAL_STATE.settings,
            ...(parsed.settings || {})
          },
          vesselLevels: parsed.vesselLevels || {},
          unlockedGems: parsed.unlockedGems || [],
          showGemDiscovery: null,
          lastSaveTime: parsed.lastSaveTime || now // Default to now if missing
        };
        
        return loadedState;
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return INITIAL_STATE;
  });

  // Offline Calculation Effect (Runs once on mount)
  useEffect(() => {
    if (gameState.lastSaveTime) {
      const now = Date.now();
      const timeDiffSeconds = (now - gameState.lastSaveTime) / 1000;

      // Only calculate if away for more than 10 seconds
      if (timeDiffSeconds > 10) {
        const incomeByType = calculatePassiveIncomeByType(gameState.vesselLevels);
        const totalIncome = Object.values(incomeByType).reduce((a, b) => a + b, 0);

        if (totalIncome > 0) {
           const gains: Record<WorshipperType, number> = {
               [WorshipperType.INDOLENT]: incomeByType[WorshipperType.INDOLENT] * timeDiffSeconds,
               [WorshipperType.LOWLY]: incomeByType[WorshipperType.LOWLY] * timeDiffSeconds,
               [WorshipperType.WORLDLY]: incomeByType[WorshipperType.WORLDLY] * timeDiffSeconds,
               [WorshipperType.ZEALOUS]: incomeByType[WorshipperType.ZEALOUS] * timeDiffSeconds,
           };

           const totalGained = Object.values(gains).reduce((a, b) => a + b, 0);

           // Apply gains immediately to state
           setGameState(prev => {
              const newWorshippers = { ...prev.worshippers };
              (Object.keys(gains) as WorshipperType[]).forEach(type => {
                  newWorshippers[type] += gains[type];
              });

              return {
                  ...prev,
                  worshippers: newWorshippers,
                  totalWorshippers: prev.totalWorshippers + totalGained,
                  lastSaveTime: now 
              };
           });

           // Show modal
           setOfflineGains({ gains, time: timeDiffSeconds });
        }
      }
    }
  }, []); // Empty dependency array ensures this runs only on mount

  const lastPassiveTick = useRef(Date.now());

  // Passive Income Loop
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastPassiveTick.current) / 1000; // seconds
      
      // Perform tick if delta is reasonable (prevents huge jumps if tab was suspended but timer didn't fire)
      // Actually, standard setInterval handling is fine here, we rely on lastSaveTime for real offline calc.
      if (delta >= 1) {
        lastPassiveTick.current = now;
        
        const incomeByType = calculatePassiveIncomeByType(gameState.vesselLevels);
        const totalIncome = Object.values(incomeByType).reduce((a, b) => a + b, 0);

        if (totalIncome > 0) {
          setGameState(prev => {
             const newWorshippers = { ...prev.worshippers };
             
             (Object.keys(incomeByType) as WorshipperType[]).forEach(type => {
                 newWorshippers[type] += incomeByType[type];
             });

             return {
                ...prev,
                totalWorshippers: prev.totalWorshippers + totalIncome,
                worshippers: newWorshippers,
                lastSaveTime: now // Update save time on tick
             };
          });
        } else {
             // Still update time even if no income
             setGameState(prev => ({ ...prev, lastSaveTime: now }));
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState.vesselLevels]);

  // Persist state changes
  useEffect(() => {
    try {
      const { showGemDiscovery, ...toSave } = gameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save game data:', e);
    }
  }, [gameState]);

  const milestoneState = getMilestoneState(gameState.miracleLevel);
  const baseCost = calculateUpgradeCost(gameState.miracleLevel);
  const upgradeCost = milestoneState.isMilestone ? baseCost * (milestoneState.costMultiplier || 1) : baseCost;
  const clickPower = calculateClickPower(gameState.miracleLevel);
  const passiveIncome = calculateTotalPassiveIncome(gameState.vesselLevels);
  const canAfford = canAffordUpgrade(gameState);

  const performMiracle = useCallback(() => {
    setGameState(prev => {
      const type = rollWorshipperType(prev.equippedGem);
      const power = calculateClickPower(prev.miracleLevel);
      const now = Date.now();
      
      return {
        ...prev,
        worshippers: {
          ...prev.worshippers,
          [type]: prev.worshippers[type] + power,
        },
        totalWorshippers: prev.totalWorshippers + power,
        lastSaveTime: now
      };
    });
    
    return {
      power: calculateClickPower(gameState.miracleLevel),
    };
  }, [gameState.miracleLevel, gameState.equippedGem]);

  const purchaseUpgrade = useCallback(() => {
    if (!canAffordUpgrade(gameState)) return;

    setGameState(prev => {
      const newWorshippers = sacrificeWorshippers(prev);
      const newTotal = Object.values(newWorshippers).reduce((a, b) => a + b, 0);
      const nextLevel = prev.miracleLevel + 1;
      
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

  const purchaseVessel = useCallback((vesselId: string, type: WorshipperType) => {
    setGameState(prev => {
        const currentLevel = prev.vesselLevels[vesselId] || 0;
        const cost = calculateVesselCost(vesselId, currentLevel);
        
        if (prev.worshippers[type] < cost) return prev;

        return {
            ...prev,
            worshippers: {
                ...prev.worshippers,
                [type]: prev.worshippers[type] - cost
            },
            totalWorshippers: prev.totalWorshippers - cost,
            vesselLevels: {
                ...prev.vesselLevels,
                [vesselId]: currentLevel + 1
            },
            lastSaveTime: Date.now()
        };
    });
  }, []);

  const closeDiscovery = useCallback(() => {
    setGameState(prev => ({ ...prev, showGemDiscovery: null }));
  }, []);

  const closeOfflineModal = useCallback(() => {
    setOfflineGains(null);
  }, []);

  const equipGem = useCallback((gem: GemType) => {
    setGameState(prev => ({
      ...prev,
      equippedGem: gem,
    }));
  }, []);

  const toggleSound = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled },
    }));
  }, []);

  return {
    gameState,
    upgradeCost,
    clickPower,
    passiveIncome,
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
  };
};