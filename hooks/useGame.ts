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

const STORAGE_KEY = 'shattered_dogma_save_v1.1'; // Bumped version

const INITIAL_STATE: GameState = {
  worshippers: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  totalWorshippers: 0,
  miracleLevel: 0,
  vesselLevels: {}, // New
  equippedGem: GemType.NONE,
  unlockedGems: [],
  showGemDiscovery: null,
  settings: {
    soundEnabled: true,
  },
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
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
          showGemDiscovery: null
        };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return INITIAL_STATE;
  });

  const lastPassiveTick = useRef(Date.now());

  // Passive Income Loop
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastPassiveTick.current) / 1000; // seconds
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
                worshippers: newWorshippers
             };
          });
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
      
      return {
        ...prev,
        worshippers: {
          ...prev.worshippers,
          [type]: prev.worshippers[type] + power,
        },
        totalWorshippers: prev.totalWorshippers + power,
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
      
      // Check if the NEWLY REACHED level is a milestone level
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
        showGemDiscovery: discoveryGem
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
            }
        };
    });
  }, []);

  const closeDiscovery = useCallback(() => {
    setGameState(prev => ({ ...prev, showGemDiscovery: null }));
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
    closeDiscovery
  };
};