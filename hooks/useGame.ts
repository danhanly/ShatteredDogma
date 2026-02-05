import { useState, useCallback, useEffect } from 'react';
import { GameState, GemType, WorshipperType } from '../types';
import { 
  calculateClickPower, 
  calculateUpgradeCost, 
  rollWorshipperType, 
  sacrificeWorshippers, 
  canAffordUpgrade,
  getMilestoneState
} from '../services/gameService';

const STORAGE_KEY = 'shattered_dogma_save_v1';

const INITIAL_STATE: GameState = {
  worshippers: {
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
    [WorshipperType.INDOLENT]: 0,
  },
  totalWorshippers: 0,
  miracleLevel: 0,
  equippedGem: GemType.NONE,
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
          }
        };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return INITIAL_STATE;
  });

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Failed to save game data:', e);
    }
  }, [gameState]);

  // derived values
  const milestoneState = getMilestoneState(gameState.miracleLevel);
  const baseCost = calculateUpgradeCost(gameState.miracleLevel);
  const upgradeCost = milestoneState.isMilestone ? baseCost * (milestoneState.costMultiplier || 1) : baseCost;
  const clickPower = calculateClickPower(gameState.miracleLevel);
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

      return {
        ...prev,
        worshippers: newWorshippers,
        totalWorshippers: newTotal,
        miracleLevel: prev.miracleLevel + 1,
      };
    });
  }, [gameState]);

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
    canAfford,
    milestoneState,
    performMiracle,
    purchaseUpgrade,
    equipGem,
    toggleSound,
  };
};