
import { describe, it, expect } from 'vitest';
import { 
  calculateManualClickPower, 
  calculateMattelockClickPower, 
  calculateUpgradeCost,
  calculateVesselEfficiency,
  calculateVesselOutput,
  calculateAssistantInterval
} from '../services/gameService';
import { GameState, WorshipperType, VesselId, GemType } from '../types';

const MOCK_STATE: GameState = {
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
  relics: {} as any,
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
  hasUnlockedEndTimes: false,
  hasUnlockedZealotry: false,
  hasSeenStartSplash: false,
  hasSeenVesselIntro: false,
  hasSeenEodIntro: false,
  hasSeenAbyssIntro: false,
  hasSeenLowlyModal: false,
  hasSeenWorldlyModal: false,
  hasSeenZealousModal: false,
  hasSeenPausedModal: false,
  hasSeenNetNegative: false,
  hasAcknowledgedPausedModal: false,
  hasSeenAssistantIntro: false,
  lockedWorshippers: [],
  lastInfluenceTime: {} as any,
  isPaused: {} as any,
  pausedStartTime: 0,
  ignoredHaltVessels: [],
  assistantLevel: 0,
  assistantActive: false,
  totalClicks: 0,
  manualClicks: 0,
  mattelockClicks: 0,
  mattelockGem: null,
  unlockedGems: [],
  activeGem: null,
  activeGemTimeRemaining: 0,
  gemCooldowns: {} as any,
  showGemDiscovery: null,
  highlightGem: null,
  zealotryActive: {} as any,
  zealotryAuto: {} as any,
  zealotryCounts: {} as any,
  frenzyTimeRemaining: 0,
  rebellionTimeRemaining: 0,
  rebelCaste: null,
  activeBulletin: null,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    musicVolume: 0.3
  },
  lastSaveTime: 0,
  miracleIncrement: 1,
  vesselIncrement: 1,
  vesselStarvationTimers: {}
};

describe('Game Service Logic', () => {
  
  describe('calculateManualClickPower', () => {
    it('should return base power at level 0', () => {
      const power = calculateManualClickPower(0, MOCK_STATE);
      expect(power).toBe(10);
    });

    it('should scale with level', () => {
      // 10 + (5 * 5) = 35
      const power = calculateManualClickPower(5, MOCK_STATE);
      expect(power).toBe(35);
    });

    it('should apply milestone multipliers', () => {
      // Level 10: (10 + 50) * 2 = 120
      const power = calculateManualClickPower(10, MOCK_STATE);
      expect(power).toBe(120);
    });

    it('should apply fate bonuses', () => {
        const state = { ...MOCK_STATE, fates: { click_power: 0.5 } } as any;
        // Level 0: 10 * (1 + 0.5) = 15
        const power = calculateManualClickPower(0, state);
        expect(power).toBe(15);
    });
  });

  describe('calculateUpgradeCost', () => {
    it('should calculate base cost correctly', () => {
        // 50 * 1.5^0 = 50
        expect(calculateUpgradeCost(0, MOCK_STATE)).toBe(50);
    });
    
    it('should scale exponentially', () => {
        // 50 * 1.5^1 = 75
        expect(calculateUpgradeCost(1, MOCK_STATE)).toBe(75);
    });
  });

  describe('calculateVesselEfficiency', () => {
      it('should be 1.0 if vessel has no consumption', () => {
          // Indolent_1 has no consumption
          const eff = calculateVesselEfficiency(MOCK_STATE, VesselId.INDOLENT_1);
          expect(eff).toBe(1.0);
      });

      it('should be 0 if vessel level is 0', () => {
          const eff = calculateVesselEfficiency(MOCK_STATE, VesselId.LOWLY_1);
          expect(eff).toBe(0);
      });

      it('should be 0.5 if only half resources are available', () => {
          // LOWLY_1 consumes 25 INDOLENT
          const state = { 
              ...MOCK_STATE, 
              vesselLevels: { [VesselId.LOWLY_1]: 1 },
              worshippers: { ...MOCK_STATE.worshippers, [WorshipperType.INDOLENT]: 12 } 
          };
          // Need 25, have 12. 12/25 = 0.48. floor(0.48 * 100)/100 = 0.48
          const eff = calculateVesselEfficiency(state, VesselId.LOWLY_1);
          expect(eff).toBe(0.48);
      });
  });

  describe('calculateAssistantInterval', () => {
      it('should be Infinity at level 0', () => {
          expect(calculateAssistantInterval(0)).toBe(Infinity);
      });

      it('should be 2000ms at level 1', () => {
          expect(calculateAssistantInterval(1)).toBe(2000);
      });

      it('should halve interval per level', () => {
          expect(calculateAssistantInterval(2)).toBe(1000);
          expect(calculateAssistantInterval(3)).toBe(500);
      });

      it('should apply frenzy modifier', () => {
          const state = { ...MOCK_STATE, frenzyTimeRemaining: 10 };
          // Level 1 base 2000 / 4 = 500
          expect(calculateAssistantInterval(1, state)).toBe(500);
      });
  });

});
