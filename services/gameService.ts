
import { COST_MULTIPLIER, INITIAL_UPGRADE_COST, GEM_DEFINITIONS, MILESTONE_INTERVAL, MILESTONE_DEFINITIONS, VESSEL_DEFINITIONS, RELIC_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD, MILESTONE_MULTIPLIERS } from "../constants";
import { GameState, GemType, WorshipperType, WORSHIPPER_ORDER, VesselId, RelicId } from "../types";

/**
 * Calculates the cost of the next miracle upgrade.
 * Formula: Initial * (1.15 ^ CurrentLevel)
 */
export const calculateUpgradeCost = (currentLevel: number): number => {
  return Math.floor(INITIAL_UPGRADE_COST * Math.pow(COST_MULTIPLIER, currentLevel));
};

/**
 * Calculates the production power (worshippers per click).
 * Formula: (1 + CurrentLevel) * RelicMultiplier
 */
export const calculateClickPower = (currentLevel: number, relicLevels: Record<string, number> = {}): number => {
  const basePower = 1 + currentLevel;
  
  // Apply Miracle Boost Relic: +5% per level
  const miracleRelicLevel = relicLevels[RelicId.MIRACLE_BOOST] || 0;
  const multiplier = 1 + (miracleRelicLevel * 0.05);

  return basePower * multiplier;
};

/**
 * Determines which worshipper type is attracted based on the equipped gem.
 */
export const rollWorshipperType = (gem: GemType, relicLevels: Record<string, number> = {}): WorshipperType => {
  const definition = GEM_DEFINITIONS[gem];
  
  // Base weights
  const weights: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 40,
    [WorshipperType.LOWLY]: 30,
    [WorshipperType.WORLDLY]: 20,
    [WorshipperType.ZEALOUS]: 10,
  };

  if (definition.favoredType) {
    const gemBoostLevel = relicLevels[RelicId.GEM_BOOST] || 0;
    // Base is 2x multiplier. Relic adds 0.5 to multiplier per level.
    const multiplier = 2 + (gemBoostLevel * 0.5);
    weights[definition.favoredType] *= multiplier;
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const type of [WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY, WorshipperType.ZEALOUS]) {
    random -= weights[type];
    if (random <= 0) return type;
  }

  return WorshipperType.INDOLENT; 
};

/**
 * Returns milestone details if the current level triggers a milestone.
 */
export const getMilestoneState = (currentLevel: number) => {
  let definition = null;
  if (currentLevel === 5) definition = MILESTONE_DEFINITIONS[0];
  else if (currentLevel === 10) definition = MILESTONE_DEFINITIONS[1];
  else if (currentLevel >= MILESTONE_INTERVAL && currentLevel % MILESTONE_INTERVAL === 0) {
    const count = currentLevel / MILESTONE_INTERVAL; 
    definition = MILESTONE_DEFINITIONS[(count + 1) % MILESTONE_DEFINITIONS.length];
  }

  if (definition) {
    const costMultiplier = MILESTONE_MULTIPLIERS[definition.type as WorshipperType] || 2;
    return { isMilestone: true, definition, costMultiplier };
  }
  
  return { isMilestone: false };
};

export const getNextMilestoneLevel = (currentLevel: number): number => {
  if (currentLevel < 5) return 5;
  if (currentLevel < 10) return 10;
  if (currentLevel < 25) return 25;
  return Math.floor(currentLevel / MILESTONE_INTERVAL) * MILESTONE_INTERVAL + MILESTONE_INTERVAL;
};

export const canAffordUpgrade = (state: GameState): boolean => {
  const baseCost = calculateUpgradeCost(state.miracleLevel);
  const milestone = getMilestoneState(state.miracleLevel);

  if (milestone.isMilestone && milestone.definition) {
    const cost = baseCost * milestone.costMultiplier!;
    // Milestones require specific types, lock does not prevent milestone spending
    return state.worshippers[milestone.definition.type as WorshipperType] >= cost;
  }

  // Regular upgrade: Check if available unlocked worshippers are enough
  const availableTotal = WORSHIPPER_ORDER
    .filter(t => !state.lockedWorshippers.includes(t))
    .reduce((sum, t) => sum + state.worshippers[t], 0);

  return availableTotal >= baseCost;
};

export const deductWorshippers = (state: GameState, amount: number): Record<WorshipperType, number> => {
  const newWorshippers = { ...state.worshippers };
  let remainingCost = amount;
  
  // Only deduct from unlocked types
  const availableTypes = WORSHIPPER_ORDER.filter(t => !state.lockedWorshippers.includes(t));

  for (const type of availableTypes) {
    if (remainingCost <= 0) break;
    const count = newWorshippers[type];
    if (count > 0) {
      const amountToTake = Math.min(count, remainingCost);
      newWorshippers[type] -= amountToTake;
      remainingCost -= amountToTake;
    }
  }
  return newWorshippers;
};

export const sacrificeWorshippers = (state: GameState): Record<WorshipperType, number> => {
  const baseCost = calculateUpgradeCost(state.miracleLevel);
  const milestone = getMilestoneState(state.miracleLevel);

  if (milestone.isMilestone && milestone.definition) {
    const cost = baseCost * milestone.costMultiplier!;
    const newWorshippers = { ...state.worshippers };
    // Milestone spending ignores locks
    newWorshippers[milestone.definition.type as WorshipperType] -= cost;
    return newWorshippers;
  }

  return deductWorshippers(state, baseCost);
};

/**
 * Calculates the cost to buy/upgrade a specific vessel using tier-specific multipliers.
 */
export const calculateVesselCost = (vesselId: string, currentLevel: number): number => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def) return 0;
  
  let multiplier = 1.25; // fallback
  if (def.tier === 1) multiplier = 1.15;
  else if (def.tier === 2) multiplier = 1.1675;
  else if (def.tier === 3) multiplier = 1.175;
  else if (def.tier === 4) multiplier = 1.2;

  return Math.floor(def.baseCost * Math.pow(multiplier, currentLevel));
};

/**
 * Calculates the output (worshippers per second) of a specific vessel, applying Relic bonuses.
 */
export const calculateVesselOutput = (vesselId: string, currentLevel: number, relicLevels: Record<string, number> = {}): number => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def) return 0;
  
  let output = def.baseOutput * currentLevel;

  let specificRelicId: RelicId | null = null;
  switch (def.type) {
    case WorshipperType.INDOLENT: specificRelicId = RelicId.INDOLENT_BOOST; break;
    case WorshipperType.LOWLY: specificRelicId = RelicId.LOWLY_BOOST; break;
    case WorshipperType.WORLDLY: specificRelicId = RelicId.WORLDLY_BOOST; break;
    case WorshipperType.ZEALOUS: specificRelicId = RelicId.ZEALOUS_BOOST; break;
  }
  
  if (specificRelicId) {
    const level = relicLevels[specificRelicId] || 0;
    output *= (1 + (level * 0.05));
  }

  const allRelicLevel = relicLevels[RelicId.ALL_VESSEL_BOOST] || 0;
  output *= (1 + (allRelicLevel * 0.02));

  return output;
};

export const calculatePassiveIncomeByType = (vesselLevels: Record<string, number>, relicLevels: Record<string, number> = {}): Record<WorshipperType, number> => {
  const income: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
  };

  VESSEL_DEFINITIONS.forEach(def => {
    const level = vesselLevels[def.id] || 0;
    if (level > 0) {
      const output = calculateVesselOutput(def.id, level, relicLevels);
      income[def.type] += output;
    }
  });

  return income;
};

export const calculateTotalPassiveIncome = (vesselLevels: Record<string, number>, relicLevels: Record<string, number> = {}): number => {
  const incomeByType = calculatePassiveIncomeByType(vesselLevels, relicLevels);
  return Object.values(incomeByType).reduce((total: number, val: number) => total + val, 0);
};

export const calculateBulkUpgrade = (
  currentLevel: number, 
  increment: number | 'MAX', 
  state: GameState
): { cost: number, count: number, targetLevel: number, isMilestoneLimit: boolean } => {
  
  const currentMilestone = getMilestoneState(currentLevel);
  if (currentMilestone.isMilestone) {
     const baseCost = calculateUpgradeCost(currentLevel);
     const cost = baseCost * (currentMilestone.costMultiplier || 1);
     return { cost, count: 1, targetLevel: currentLevel + 1, isMilestoneLimit: true };
  }

  const nextMilestone = getNextMilestoneLevel(currentLevel);
  let targetLevel: number;

  // Calculate available funds based on locked worshippers
  const availableFunds = WORSHIPPER_ORDER
    .filter(t => !state.lockedWorshippers.includes(t))
    .reduce((sum, t) => sum + state.worshippers[t], 0);
  
  if (increment === 'MAX') {
    let costSoFar = 0;
    let lvl = currentLevel;
    
    while (lvl < nextMilestone) {
      const nextCost = calculateUpgradeCost(lvl);
      if (availableFunds >= costSoFar + nextCost) {
        costSoFar += nextCost;
        lvl++;
      } else {
        break;
      }
    }
    
    if (lvl === currentLevel) {
       return { cost: calculateUpgradeCost(currentLevel), count: 0, targetLevel: currentLevel + 1, isMilestoneLimit: false };
    }
    
    return { cost: costSoFar, count: lvl - currentLevel, targetLevel: lvl, isMilestoneLimit: lvl === nextMilestone };
  } else {
    const inc = increment as number;
    const rawTarget = Math.ceil((currentLevel + 1) / inc) * inc;
    const actualTarget = Math.min(rawTarget, nextMilestone);
    
    let totalCost = 0;
    for (let l = currentLevel; l < actualTarget; l++) {
      totalCost += calculateUpgradeCost(l);
    }
    
    return { 
        cost: totalCost, 
        count: actualTarget - currentLevel, 
        targetLevel: actualTarget, 
        isMilestoneLimit: actualTarget === nextMilestone 
    };
  }
};

export const calculateBulkVesselBuy = (
  vesselId: string,
  currentLevel: number,
  increment: number | 'MAX',
  state: GameState,
  vesselType: WorshipperType
): { cost: number, count: number, targetLevel: number } => {
    
  if (increment === 'MAX') {
    const available = state.worshippers[vesselType];
    let costSoFar = 0;
    let lvl = currentLevel;
    
    for (let i = 0; i < 1000; i++) {
       const nextCost = calculateVesselCost(vesselId, lvl);
       if (available >= costSoFar + nextCost) {
         costSoFar += nextCost;
         lvl++;
       } else {
         break;
       }
    }
    
    if (lvl === currentLevel) {
       return { cost: calculateVesselCost(vesselId, currentLevel), count: 0, targetLevel: currentLevel + 1 };
    }
    return { cost: costSoFar, count: lvl - currentLevel, targetLevel: lvl };

  } else {
    const inc = increment as number;
    const target = Math.ceil((currentLevel + 1) / inc) * inc;
    
    let totalCost = 0;
    for (let l = currentLevel; l < target; l++) {
        totalCost += calculateVesselCost(vesselId, l);
    }
    
    return { cost: totalCost, count: target - currentLevel, targetLevel: target };
  }
};

/**
 * Revised soul calculation. 1 soul available exactly at 1,000,000.
 */
export const calculateSoulsEarned = (totalWorshippers: number): number => {
  if (totalWorshippers < PRESTIGE_UNLOCK_THRESHOLD) return 0;
  const surplus = totalWorshippers - PRESTIGE_UNLOCK_THRESHOLD;
  return Math.floor(1 + 0.01 * Math.pow(surplus, 1/3));
};

/**
 * Calculates relic cost using the miracle progression formula.
 */
export const calculateRelicCost = (relicId: string, currentLevel: number): number => {
  const def = RELIC_DEFINITIONS.find(r => r.id === relicId);
  if (!def) return 0;
  return Math.floor(def.baseCost * Math.pow(COST_MULTIPLIER, currentLevel));
};
