
import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, WorshipperType, WORSHIPPER_ORDER, GemType, RelicId, IncrementType, FateId, ZealotryId, VesselId } from '../types';
import { VESSEL_DEFINITIONS, FATE_DEFINITIONS, ZEALOTRY_DEFINITIONS, GEM_DEFINITIONS, RELIC_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD } from '../constants';
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
    [RelicId.FURY_OF_ZEALOUS]: 0,
    [RelicId.MATTELOCKS_GEMS]: 0,
  },
  fates: {} as Record<FateId, number>,
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
  mattelockGem: null,
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
  highlightGem: null,
  zealotryActive: {
    [ZealotryId.DISDAIN]: 0,
    [ZealotryId.NO_BREAKS]: 0,
    [ZealotryId.POLITICS]: 0,
    [ZealotryId.SELF_FLAGELLATION]: 0,
    [ZealotryId.ISOLATING]: 0,
    [ZealotryId.PITY]: 0,
  },
  zealotryAuto: {
    [ZealotryId.DISDAIN]: false,
    [ZealotryId.NO_BREAKS]: false,
    [ZealotryId.POLITICS]: false,
    [ZealotryId.SELF_FLAGELLATION]: false,
    [ZealotryId.ISOLATING]: false,
    [ZealotryId.PITY]: false,
  },
  zealotryCounts: {
    [ZealotryId.DISDAIN]: 0,
    [ZealotryId.NO_BREAKS]: 0,
    [ZealotryId.POLITICS]: 0,
    [ZealotryId.SELF_FLAGELLATION]: 0,
    [ZealotryId.ISOLATING]: 0,
    [ZealotryId.PITY]: 0,
  },
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
          worshippers: { ...INITIAL_STATE.worshippers, ...parsed.worshippers },
          vesselLevels: { ...INITIAL_STATE.vesselLevels, ...parsed.vesselLevels },
          vesselToggles: { ...INITIAL_STATE.vesselToggles, ...parsed.vesselToggles },
          relics: { ...INITIAL_STATE.relics, ...(parsed.relics || {}) },
          fates: parsed.fates || {},
          zealotryActive: { ...INITIAL_STATE.zealotryActive, ...(parsed.zealotryActive || {}) },
          zealotryAuto: { ...INITIAL_STATE.zealotryAuto, ...(parsed.zealotryAuto || {}) },
          zealotryCounts: { ...INITIAL_STATE.zealotryCounts, ...(parsed.zealotryCounts || {}) },
          maxWorshippersByType: { ...INITIAL_STATE.maxWorshippersByType, ...(parsed.maxWorshippersByType || {}) },
          lastInfluenceTime: { ...INITIAL_STATE.lastInfluenceTime, ...(parsed.lastInfluenceTime || {}) },
          isPaused: { ...INITIAL_STATE.isPaused, ...(parsed.isPaused || {}) },
          gemCooldowns: { ...INITIAL_STATE.gemCooldowns, ...(parsed.gemCooldowns || {}) },
          settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
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

  useEffect(() => {
      const now = Date.now();
      const lastSave = stateRef.current.lastSaveTime;
      const diff = now - lastSave;
      
      if (diff > 5000) {
          const production = calculateProductionByType(stateRef.current);
          const consumption = calculateConsumptionByType(stateRef.current);
          const net = {} as Record<WorshipperType, number>;
          let hasGains = false;
          
          WORSHIPPER_ORDER.forEach(type => {
              const netRate = production[type] - consumption[type];
              if (netRate > 0) {
                  net[type] = Math.floor(netRate * (diff / 1000));
                  if (net[type] > 0) hasGains = true;
              } else {
                  net[type] = 0;
              }
          });

          if (hasGains) {
              setOfflineGains({ gains: net, time: diff / 1000 });
              setGameState(prev => {
                  const next = { ...prev };
                  let totalW = 0;
                  WORSHIPPER_ORDER.forEach(type => {
                      next.worshippers[type] += net[type];
                      next.totalAccruedWorshippers += net[type];
                      if (next.worshippers[type] > next.maxWorshippersByType[type]) {
                          next.maxWorshippersByType[type] = next.worshippers[type];
                      }
                      totalW += next.worshippers[type];
                  });
                  next.totalWorshippers = totalW;
                  return next;
              });
          }
      }
  }, []);

  const calculateInternalPower = useCallback((state: GameState, isAuto: boolean) => {
    const powerBase = isAuto 
        ? calculateMattelockClickPower(state.assistantLevel, state)
        : calculateManualClickPower(state.miracleLevel, state);
    
    let power = powerBase;
    let type = WorshipperType.INDOLENT; 

    // Determine effective gem. 
    let effectiveGem = state.activeGem;
    if (isAuto && state.mattelockGem) {
      effectiveGem = state.mattelockGem;
    }

    if (effectiveGem === GemType.LAPIS) {
        // If Mattelock is using Lapis via his bag (and it's NOT globally active), 1x power.
        if (isAuto && state.mattelockGem === GemType.LAPIS && state.activeGem !== GemType.LAPIS) {
             power = powerBase; 
        } else {
             // Otherwise (Global Active or Manual with Global Active) -> 2x
             power = powerBase * 2;
        }
    } else if (effectiveGem === GemType.QUARTZ) {
        power = powerBase;
        type = WorshipperType.LOWLY;
    } else if (effectiveGem === GemType.EMERALD) {
        power = Math.floor(powerBase / 4);
        type = WorshipperType.WORLDLY;
    } else if (effectiveGem === GemType.RUBY) {
        power = Math.floor(powerBase / 10);
        type = WorshipperType.ZEALOUS;
    }

    const gemPowerFateMod = 1 + (state.fates['gem_power'] || 0);
    // Apply gem power bonus if ANY gem is effectively active
    if (effectiveGem) {
      power = Math.floor(power * gemPowerFateMod);
    }

    if (effectiveGem && power === 0 && powerBase > 0) power = 1;

    return { power, type };
  }, []);

  const performMiracle = useCallback((isAuto = false) => {
    // 0. Pre-calculate values to ensure stability and no race conditions for visual events
    // This uses the current ref state which is "fresh enough" for visuals
    const currentRefState = stateRef.current;
    const { power, type } = calculateInternalPower(currentRefState, isAuto);

    // 1. Update State
    setGameState(prev => {
        // Recalculate based on 'prev' to be 100% accurate for state transitions
        const calculated = calculateInternalPower(prev, isAuto);
        const p = calculated.power;
        const t = calculated.type;

        const newState = { ...prev };
        
        newState.worshippers[t] += p;
        
        // IMPORTANT: Calculate total worshippers immediately for UI consistency if needed, 
        // though the loop handles it too.
        newState.totalWorshippers += p;
        newState.totalAccruedWorshippers += p;
        
        if (isAuto) {
            newState.totalClicks += 1;
            newState.mattelockClicks += 1;
        } else {
            newState.totalClicks += 1;
            newState.manualClicks += 1;
        }

        if (newState.worshippers[t] > newState.maxWorshippersByType[t]) {
            newState.maxWorshippersByType[t] = newState.worshippers[t];
        }

        // Check Gem Unlocks
        if (!isAuto) {
             const checkUnlock = (gem: GemType, threshold: number, wType: WorshipperType) => {
                 if (!prev.unlockedGems.includes(gem) && prev.maxWorshippersByType[wType] >= threshold) {
                     newState.unlockedGems = [...newState.unlockedGems, gem];
                     newState.showGemDiscovery = gem;
                 }
             }
             
             checkUnlock(GemType.LAPIS, 500, WorshipperType.INDOLENT);
             checkUnlock(GemType.QUARTZ, 2000, WorshipperType.LOWLY);
             checkUnlock(GemType.EMERALD, 5000, WorshipperType.WORLDLY);
             checkUnlock(GemType.RUBY, 10000, WorshipperType.ZEALOUS);
        }

        // Check End Times Unlock
        if (!prev.hasUnlockedEndTimes && (prev.vesselLevels[VesselId.ZEALOUS_1] || 0) >= 10) {
            newState.hasUnlockedEndTimes = true;
        }
        
        // Check Zealotry Unlock
        if (!prev.hasUnlockedZealotry && prev.worshippers[WorshipperType.ZEALOUS] > 0) {
            newState.hasUnlockedZealotry = true;
        }

        return newState;
    });

    // 2. Trigger Visuals (Side Effect outside of reducer)
    if (isAuto) {
        setLastMiracleEvent({ power, type, isAuto, timestamp: Date.now() });
    }

    // 3. Return values for Visuals (MainScreen.tsx manual clicks)
    if (!isAuto) {
       return { power, type };
    }
  }, [calculateInternalPower]);

  // Main Game Loop (Passive Generation)
  useEffect(() => {
    const loop = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastPassiveTick.current) / 1000;
        lastPassiveTick.current = now;

        setGameState(prev => {
            const next = { ...prev, lastSaveTime: now };
            
            const production = calculateProductionByType(prev);
            const consumption = calculateConsumptionByType(prev);
            
            let totalWorshippers = 0;

            WORSHIPPER_ORDER.forEach(type => {
                let produced = production[type] * delta;
                let consumed = consumption[type] * delta;
                let current = prev.worshippers[type];
                
                // Logic: Consume only if available
                if (consumed > produced + current) {
                    consumed = produced + current;
                    next.isPaused[type] = true;
                    if (!prev.hasSeenPausedModal && prev.totalWorshippers > 1000) {
                         next.hasSeenPausedModal = true;
                    }
                } else {
                    next.isPaused[type] = false;
                }
                
                let change = produced - consumed;
                next.worshippers[type] = Math.max(0, current + change);
                
                // Track stats
                if (change > 0) {
                     next.totalAccruedWorshippers += change;
                     if (next.worshippers[type] > next.maxWorshippersByType[type]) {
                         next.maxWorshippersByType[type] = next.worshippers[type];
                     }
                }

                // Sum up for Global Count
                totalWorshippers += next.worshippers[type];
            });

            // CRITICAL FIX: Ensure global count is updated every tick based on current population
            next.totalWorshippers = totalWorshippers;

            // Handle Gem Cooldowns
            Object.keys(next.gemCooldowns).forEach(k => {
                const gem = k as GemType;
                if (next.gemCooldowns[gem] > 0) {
                    next.gemCooldowns[gem] = Math.max(0, next.gemCooldowns[gem] - delta);
                    if (next.gemCooldowns[gem] === 0) {
                         setLastGemRefresh({ gem, timestamp: now });
                    }
                }
            });

            // Handle Active Gem Expiration
            if (next.activeGem) {
                next.activeGemTimeRemaining = Math.max(0, next.activeGemTimeRemaining - delta);
                if (next.activeGemTimeRemaining === 0) {
                    const gem = next.activeGem;
                    next.activeGem = null;
                    
                    const baseCd = 60;
                    const fateCdMod = 1 + (next.fates['gem_cooldown'] || 0);
                    const betrayalMod = (next.relics[RelicId.BETRAYAL] || 0) * 10;
                    const cd = Math.max(10, (baseCd - betrayalMod) * fateCdMod);
                    
                    // Abyssal Reflex Check
                    const reflexLvl = next.relics[RelicId.ABYSSAL_REFLEX] || 0;
                    const reflexChance = reflexLvl * 0.1;
                    if (Math.random() < reflexChance) {
                        next.gemCooldowns[gem] = 0; 
                    } else {
                        next.gemCooldowns[gem] = cd;
                    }
                }
            }

            // Handle Zealotry Automations
            const hasFuryRelic = (next.relics[RelicId.FURY_OF_ZEALOUS] || 0) > 0;
            if (hasFuryRelic) {
                Object.keys(next.zealotryActive).forEach(k => {
                    const id = k as ZealotryId;
                    // If active, just check expiry
                    if (next.zealotryActive[id] > now) {
                         // Still active
                    } else {
                        // Expired or inactive. Check auto-renew.
                        if (next.zealotryAuto[id]) {
                            const def = ZEALOTRY_DEFINITIONS.find(d => d.id === id);
                            if (def && next.worshippers[WorshipperType.ZEALOUS] >= def.cost) {
                                // Renew
                                next.worshippers[WorshipperType.ZEALOUS] -= def.cost;
                                next.zealotryActive[id] = now + (def.duration * 1000);
                                next.zealotryCounts[id] = (next.zealotryCounts[id] || 0) + 1;
                            }
                        }
                    }
                });
            }

            // Handle Random Events (Frenzy / Rebellion)
            if (next.frenzyTimeRemaining > 0) next.frenzyTimeRemaining = Math.max(0, next.frenzyTimeRemaining - delta);
            if (next.rebellionTimeRemaining > 0) next.rebellionTimeRemaining = Math.max(0, next.rebellionTimeRemaining - delta);
            else next.rebelCaste = null;

            if (next.relics[RelicId.FRENZY] > 0 && next.frenzyTimeRemaining === 0) {
                if (Math.random() < delta / 300) {
                    next.frenzyTimeRemaining = 15;
                }
            }
            if (next.relics[RelicId.REBELLION] > 0 && next.rebellionTimeRemaining === 0) {
                 if (Math.random() < delta / 300) {
                     next.rebellionTimeRemaining = 30;
                     const caste = WORSHIPPER_ORDER[Math.floor(Math.random() * WORSHIPPER_ORDER.length)];
                     next.rebelCaste = caste;
                 }
            }

            return next;
        });

        // Assistant Logic (FIXED)
        if (stateRef.current.assistantActive && stateRef.current.assistantLevel > 0) {
            assistantTimer.current += delta * 1000;
            const interval = calculateAssistantInterval(stateRef.current.assistantLevel, stateRef.current);
            
            // Allow processing multiple clicks if we lagged behind, up to a reasonable limit (e.g. 10) to prevent infinite loops
            let catchUpLimit = 10;
            while (assistantTimer.current >= interval && catchUpLimit > 0) {
                performMiracle(true);
                assistantTimer.current -= interval;
                catchUpLimit--;
            }
            // If we are still behind after limit, just clamp it to avoid huge buildup
            if (catchUpLimit === 0 && assistantTimer.current > interval) {
                assistantTimer.current = 0;
            }
        }

    }, 100);

    return () => clearInterval(loop);
  }, [performMiracle]);

  const purchaseUpgrade = () => {
    setGameState(prev => {
        const { count, cost } = calculateBulkUpgrade(prev.miracleLevel, prev.miracleIncrement, prev);
        if (prev.worshippers[WorshipperType.INDOLENT] >= cost && count > 0) {
            return {
                ...prev,
                worshippers: {
                    ...prev.worshippers,
                    [WorshipperType.INDOLENT]: prev.worshippers[WorshipperType.INDOLENT] - cost
                },
                miracleLevel: prev.miracleLevel + count
            };
        }
        return prev;
    });
  };

  const purchaseVessel = (vesselId: string) => {
    setGameState(prev => {
        const level = prev.vesselLevels[vesselId] || 0;
        const { count, cost, costType } = calculateBulkVesselBuy(vesselId, level, prev.vesselIncrement, prev);
        
        if (prev.worshippers[costType] >= cost && count > 0) {
            return {
                ...prev,
                worshippers: {
                    ...prev.worshippers,
                    [costType]: prev.worshippers[costType] - cost
                },
                vesselLevels: {
                    ...prev.vesselLevels,
                    [vesselId]: level + count
                }
            };
        }
        return prev;
    });
  };

  const purchaseAssistant = () => {
      setGameState(prev => {
          const { count, cost, costType } = calculateAssistantBulkVesselBuy(prev.assistantLevel, 1, prev);
          if (prev.worshippers[costType] >= cost && count > 0) {
              return {
                  ...prev,
                  worshippers: { ...prev.worshippers, [costType]: prev.worshippers[costType] - cost },
                  assistantLevel: prev.assistantLevel + 1,
                  assistantActive: true
              }
          }
          return prev;
      });
  };

  const toggleAssistant = () => {
      setGameState(prev => {
          if (prev.assistantLevel === 0) return prev; // Cannot toggle if not recruited
          return { ...prev, assistantActive: !prev.assistantActive };
      });
  };

  const purchaseRelic = (relicId: RelicId) => {
      setGameState(prev => {
          const level = prev.relics[relicId] || 0;
          const cost = calculateRelicCost(relicId, level);
          const def = RELIC_DEFINITIONS.find(r => r.id === relicId);
          if (def && prev.souls >= cost && level < def.maxLevel) {
              return {
                  ...prev,
                  souls: prev.souls - cost,
                  relics: { ...prev.relics, [relicId]: level + 1 },
                  lastPurchasedRelicId: relicId,
                  lastPurchasedRelicTime: Date.now()
              }
          }
          return prev;
      });
  };

  const purchaseFateRelic = () => {
      setGameState(prev => {
          const cost = Math.floor(10 * Math.pow(1.2, prev.fatePurchases));
          if (prev.souls >= cost) {
              const fateKeys = Object.keys(FATE_DEFINITIONS) as FateId[];
              const roll = fateKeys[Math.floor(Math.random() * fateKeys.length)];
              const def = FATE_DEFINITIONS[roll];
              
              return {
                  ...prev,
                  souls: prev.souls - cost,
                  fatePurchases: prev.fatePurchases + 1,
                  fates: {
                      ...prev.fates,
                      [roll]: (prev.fates[roll] || 0) + def.bonus
                  },
                  lastPurchasedFateId: roll,
                  lastPurchasedFateTime: Date.now()
              }
          }
          return prev;
      });
  };

  const activateGem = (gem: GemType) => {
      setGameState(prev => {
          if (!prev.activeGem && prev.gemCooldowns[gem] === 0) {
              return {
                  ...prev,
                  activeGem: gem,
                  activeGemTimeRemaining: 30
              }
          }
          return prev;
      });
  };

  const activateZealotry = (id: ZealotryId) => {
      setGameState(prev => {
          const def = ZEALOTRY_DEFINITIONS.find(z => z.id === id);
          if (def && prev.worshippers[WorshipperType.ZEALOUS] >= def.cost) {
              return {
                  ...prev,
                  worshippers: {
                      ...prev.worshippers,
                      [WorshipperType.ZEALOUS]: prev.worshippers[WorshipperType.ZEALOUS] - def.cost
                  },
                  zealotryActive: {
                      ...prev.zealotryActive,
                      [id]: Date.now() + (def.duration * 1000)
                  },
                  zealotryCounts: {
                      ...prev.zealotryCounts,
                      [id]: (prev.zealotryCounts[id] || 0) + 1
                  }
              }
          }
          return prev;
      });
  };

  const toggleZealotryAuto = (id: ZealotryId) => {
      setGameState(prev => ({
          ...prev,
          zealotryAuto: {
              ...prev.zealotryAuto,
              [id]: !prev.zealotryAuto[id]
          }
      }));
  };

  const setMattelockGem = (gem: GemType | null) => {
      setGameState(prev => ({ ...prev, mattelockGem: gem }));
  };

  const triggerPrestige = () => {
      setGameState(prev => {
          const souls = calculateSoulsEarned(prev);
          return {
              ...INITIAL_STATE,
              souls: prev.souls + souls,
              relics: prev.relics,
              fates: prev.fates,
              fatePurchases: prev.fatePurchases,
              hasUnlockedEndTimes: false,
              hasUnlockedZealotry: false,
              hasSeenStartSplash: true,
              hasSeenVesselIntro: true,
              hasSeenEodIntro: true,
              hasSeenAbyssIntro: true,
              maxWorshippersByType: {
                  [WorshipperType.INDOLENT]: 0,
                  [WorshipperType.LOWLY]: 0,
                  [WorshipperType.WORLDLY]: 0,
                  [WorshipperType.ZEALOUS]: 0,
              }
          }
      });
  };

  const closeDiscovery = () => setGameState(p => ({ ...p, showGemDiscovery: null }));
  const closeOfflineModal = () => setOfflineGains(null);
  const toggleVessel = (id: string) => setGameState(p => ({ ...p, vesselToggles: { ...p.vesselToggles, [id]: !p.vesselToggles[id] } }));
  const toggleAllVessels = (caste: WorshipperType, imprison: boolean) => {
      setGameState(p => {
          const next = { ...p };
          VESSEL_DEFINITIONS.filter(v => v.type === caste && !v.isGenerator).forEach(v => {
              next.vesselToggles[v.id] = imprison;
          });
          return next;
      });
  };
  const setMiracleIncrement = (val: IncrementType) => setGameState(p => ({ ...p, miracleIncrement: val }));
  const setVesselIncrement = (val: IncrementType) => setGameState(p => ({ ...p, vesselIncrement: val }));
  const toggleSound = () => setGameState(p => ({ ...p, settings: { ...p.settings, soundEnabled: !p.settings.soundEnabled } }));
  const toggleMusic = () => setGameState(p => ({ ...p, settings: { ...p.settings, musicEnabled: !p.settings.musicEnabled } }));
  const setMusicVolume = (vol: number) => setGameState(p => ({ ...p, settings: { ...p.settings, musicVolume: vol } }));
  const setFlag = (flag: keyof GameState, val: boolean) => setGameState(p => ({ ...p, [flag]: val }));
  const resetSave = () => {
      localStorage.removeItem(STORAGE_KEY);
      setGameState(INITIAL_STATE);
  };
  
  const debugAddWorshippers = (type: WorshipperType, amount: number) => setGameState(p => ({ ...p, worshippers: { ...p.worshippers, [type]: p.worshippers[type] + amount } }));
  const debugUnlockFeature = (feature: 'GEMS' | 'VESSELS' | 'END_TIMES' | 'ASSISTANT') => {
      setGameState(p => {
          if (feature === 'GEMS') return { ...p, unlockedGems: [GemType.LAPIS, GemType.QUARTZ, GemType.EMERALD, GemType.RUBY] };
          if (feature === 'VESSELS') {
              const newLevels = { ...p.vesselLevels };
              VESSEL_DEFINITIONS.forEach(v => newLevels[v.id] = 1);
              return { ...p, vesselLevels: newLevels };
          }
          if (feature === 'END_TIMES') return { ...p, hasUnlockedEndTimes: true };
          if (feature === 'ASSISTANT') return { ...p, assistantLevel: 1, assistantActive: true };
          return p;
      });
  };
  const debugAddSouls = (amount: number) => setGameState(p => ({ ...p, souls: p.souls + amount }));
  
  const passiveIncome = calculateProductionByType(gameState)[WorshipperType.INDOLENT] - calculateConsumptionByType(gameState)[WorshipperType.INDOLENT];

  return {
    gameState,
    passiveIncome,
    performMiracle,
    activateGem,
    closeDiscovery,
    purchaseUpgrade,
    purchaseVessel,
    purchaseAssistant,
    toggleAssistant,
    purchaseRelic,
    purchaseFateRelic,
    toggleVessel,
    toggleAllVessels,
    setMiracleIncrement,
    setVesselIncrement,
    toggleSound,
    toggleMusic,
    setMusicVolume,
    offlineGains,
    closeOfflineModal,
    triggerPrestige,
    setFlag,
    lastMiracleEvent,
    lastGemRefresh,
    debugAddWorshippers,
    debugUnlockFeature,
    debugAddSouls,
    resetSave,
    activateZealotry,
    toggleZealotryAuto,
    setMattelockGem
  };
};
