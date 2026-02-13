
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../hooks/useGame';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorshipperType, GemType } from '../types';
import { calculateSoulsEarned } from '../services/gameService';

describe('useGame Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear storage to start fresh
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.gameState.totalWorshippers).toBe(0);
    expect(result.current.gameState.miracleLevel).toBe(0);
  });

  it('should increment worshippers when performing a miracle', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.performMiracle(false);
    });

    // Base power is 10
    expect(result.current.gameState.worshippers[WorshipperType.INDOLENT]).toBe(10);
    expect(result.current.gameState.totalWorshippers).toBe(10);
    expect(result.current.gameState.manualClicks).toBe(1);
  });

  it('should purchase upgrade when affordable', () => {
    const { result } = renderHook(() => useGame());
    
    // Give resources
    act(() => {
        result.current.debugAddWorshippers(WorshipperType.INDOLENT, 100);
    });

    expect(result.current.gameState.worshippers[WorshipperType.INDOLENT]).toBe(100);

    // Buy upgrade (cost 50)
    act(() => {
        result.current.purchaseUpgrade();
    });

    expect(result.current.gameState.miracleLevel).toBe(1);
    expect(result.current.gameState.worshippers[WorshipperType.INDOLENT]).toBe(50);
  });

  it('should allow free assistant recruitment and trigger auto-clicks', async () => {
    const { result } = renderHook(() => useGame());

    // 1. Give some Indolent to unlock (1000 needed generally for unlock logic, though hook handles unlock flag separately, 
    // we just need to ensure purchase works even if cost is 0 and we have 0 worldly)
    
    // Ensure we have 0 Worldly to prove it's free
    expect(result.current.gameState.worshippers[WorshipperType.WORLDLY]).toBe(0);

    // 2. Purchase Assistant (Should be free)
    act(() => {
        result.current.purchaseAssistant();
    });

    // 3. Verify Initial State
    expect(result.current.gameState.assistantLevel).toBe(1);
    expect(result.current.gameState.assistantActive).toBe(true);
    expect(result.current.gameState.worshippers[WorshipperType.WORLDLY]).toBe(0); // Still 0

    // 4. Advance time to trigger click
    // Level 1 assistant interval is 2000ms.
    // Advance by 2100ms to be sure.
    act(() => {
        vi.advanceTimersByTime(2100);
    });

    // 5. Verify Click Occurred
    // Base power is 10. Mattelock should have clicked once.
    expect(result.current.gameState.mattelockClicks).toBeGreaterThanOrEqual(1);
    expect(result.current.gameState.worshippers[WorshipperType.INDOLENT]).toBeGreaterThanOrEqual(10);
  });
  
  it('should cost 1 Worldly to upgrade assistant from level 1 to 2', () => {
      const { result } = renderHook(() => useGame());
      
      // Recruit for free
      act(() => {
          result.current.purchaseAssistant();
      });
      
      expect(result.current.gameState.assistantLevel).toBe(1);
      
      // Check calculation directly or just try to buy
      // Try to buy with 0 Worldly (should fail)
      act(() => {
          result.current.purchaseAssistant();
      });
      expect(result.current.gameState.assistantLevel).toBe(1); // No change

      // Give 1 Worldly
      act(() => {
          result.current.debugAddWorshippers(WorshipperType.WORLDLY, 1);
      });
      expect(result.current.gameState.worshippers[WorshipperType.WORLDLY]).toBe(1);

      // Buy Level 2
      act(() => {
          result.current.purchaseAssistant();
      });
      
      expect(result.current.gameState.assistantLevel).toBe(2);
      expect(result.current.gameState.worshippers[WorshipperType.WORLDLY]).toBe(0); // Consumed
  });

  it('should stop assistant clicks when toggled off', () => {
    const { result } = renderHook(() => useGame());

    // Recruit
    act(() => {
        result.current.purchaseAssistant();
    });

    expect(result.current.gameState.assistantActive).toBe(true);

    act(() => {
        result.current.toggleAssistant();
    });

    expect(result.current.gameState.assistantActive).toBe(false);

    const initialClicks = result.current.gameState.mattelockClicks;

    act(() => {
        vi.advanceTimersByTime(5000);
    });

    expect(result.current.gameState.mattelockClicks).toBe(initialClicks);
  });
  
  it('should persist active state after update', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
          result.current.purchaseAssistant();
      });
      
      expect(result.current.gameState.assistantActive).toBe(true);
      
      // Simulate another state update
      act(() => {
          result.current.performMiracle(false);
      });
      
      expect(result.current.gameState.assistantActive).toBe(true);
  });

  it('should prevent toggling assistant if not recruited (level 0)', () => {
      const { result } = renderHook(() => useGame());
      
      expect(result.current.gameState.assistantLevel).toBe(0);
      expect(result.current.gameState.assistantActive).toBe(false);

      act(() => {
          result.current.toggleAssistant();
      });

      // Should remain false because level is 0
      expect(result.current.gameState.assistantActive).toBe(false);
  });

  it('should trigger hasSeenProductionStarvedModal when conditions are met', () => {
    const { result } = renderHook(() => useGame());

    // 1. Initial state
    expect(result.current.gameState.hasSeenProductionStarvedModal).toBe(false);

    // 2. Set up conditions: 2+ types in production, and at least one negative net
    act(() => {
        result.current.setFlag('hasSeenStartSplash', true);
    });
    act(() => {
        result.current.debugAddWorshippers(WorshipperType.INDOLENT, 1000);
        result.current.debugAddWorshippers(WorshipperType.LOWLY, 1000);
        result.current.debugAddWorshippers(WorshipperType.WORLDLY, 1000);
        result.current.debugAddWorshippers(WorshipperType.ZEALOUS, 1000);
    });
    act(() => {
        result.current.debugUnlockFeature('VESSELS'); // Levels 1 for all
    });

    // Advance time to trigger loop
    for(let i=0; i<10; i++) {
        act(() => {
            vi.advanceTimersByTime(100);
        });
    }

    // Indolent production: 5 (from Indolent_1)
    // Indolent consumption: 25 (from Lowly_1)
    // Net Indolent: -20
    // Types in production: Indolent, Lowly, Worldly, Zealous (all 4)
    // hasNegativeNet: true (Indolent is -20)
    
    expect(result.current.gameState.hasSeenProductionStarvedModal).toBe(true);
  });

  it('should unlock End Times at Zealous Vessel Level 1 and show 10 souls', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.gameState.hasUnlockedEndTimes).toBe(false);

    act(() => {
        result.current.debugAddWorshippers(WorshipperType.WORLDLY, 2000);
        result.current.purchaseVessel('ZEALOUS_1');
    });

    act(() => {
        vi.advanceTimersByTime(1000);
    });

    expect(result.current.gameState.vesselLevels['ZEALOUS_1']).toBe(1);
    expect(result.current.gameState.hasUnlockedEndTimes).toBe(true);
    
    // Soul calculation check
    // ZEALOUS_1 Level 1 output is 5.
    // First prestige bonus is 5.
    // Total should be 10.
    const souls = calculateSoulsEarned(result.current.gameState);
    expect(souls).toBe(10);
  });

  it('should persist End Times unlock after apocalypse', () => {
    const { result } = renderHook(() => useGame());

    // 1. Unlock End Times
    act(() => {
        result.current.debugAddWorshippers(WorshipperType.WORLDLY, 2000);
        result.current.purchaseVessel('ZEALOUS_1');
    });
    act(() => {
        vi.advanceTimersByTime(1000);
    });
    expect(result.current.gameState.hasUnlockedEndTimes).toBe(true);

    // 2. Trigger Apocalypse
    act(() => {
        result.current.triggerPrestige();
    });

    // 3. Verify it's still unlocked
    expect(result.current.gameState.hasUnlockedEndTimes).toBe(true);
    expect(result.current.gameState.souls).toBeGreaterThan(0);
  });

  it('should only allow Mattelock gem switching if vessels exist for that type', () => {
    const { result } = renderHook(() => useGame());

    // 1. Initially should fail to set any gem (no vessels)
    act(() => {
        result.current.setMattelockGem(GemType.LAPIS);
    });
    expect(result.current.gameState.mattelockGem).toBe(null);

    // 2. Add an Indolent vessel
    act(() => {
        result.current.debugAddWorshippers(WorshipperType.INDOLENT, 100);
        result.current.purchaseVessel('INDOLENT_1');
    });
    expect(result.current.gameState.vesselLevels['INDOLENT_1']).toBe(1);

    // 3. Now should be able to set Lapis (Indolent)
    act(() => {
        result.current.setMattelockGem(GemType.LAPIS);
    });
    expect(result.current.gameState.mattelockGem).toBe(GemType.LAPIS);

    // 4. Should still fail to set Quartz (Lowly)
    act(() => {
        result.current.setMattelockGem(GemType.QUARTZ);
    });
    expect(result.current.gameState.mattelockGem).toBe(GemType.LAPIS); // No change
  });
});
