
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../hooks/useGame';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorshipperType, GemType } from '../types';
import { calculateAssistantBulkVesselBuy } from '../services/gameService';

describe('useGame Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear storage to start fresh
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
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
});
