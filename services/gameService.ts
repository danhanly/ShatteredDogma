
import { COST_MULTIPLIER, INITIAL_UPGRADE_COST, VESSEL_DEFINITIONS, PRESTIGE_UNLOCK_THRESHOLD, CONSUMPTION_RATES } from "../constants";
import { GameState, WorshipperType, WORSHIPPER_ORDER } from "../types";

/**
 * Calculates the cost of the next miracle upgrade.
 * Doubled every 10th level.
 */
export const calculateUpgradeCost = (currentLevel: number): number => {
  let cost = Math.floor(INITIAL_UPGRADE_COST * Math.pow(COST_MULTIPLIER, currentLevel - 1));
  // Every 10 levels, the cost of that level's upgrade is doubled
  if (currentLevel % 10 === 0) {
    cost *= 2;
  }
  return cost;
};

/**
 * Calculates the production power (worshippers per click).
 * WPC = (CurrentLevel * 1.15^(floor(L/10))) * (1 + Souls * 0.01)
 */
export const calculateClickPower = (currentLevel: number, souls: number = 0): number => {
  const bonusMultiplier = Math.pow(1.15, Math.floor(currentLevel / 10));
  const soulMultiplier = 1 + (souls * 0.01);
  return Math.max(1, Math.floor(currentLevel * bonusMultiplier * soulMultiplier));
};

/**
 * Determines which worshipper type is attracted.
 * Spec update: Dark Miracles only attract Indolent.
 */
export const rollWorshipperType = (): WorshipperType => {
  return WorshipperType.INDOLENT; 
};

export const canAffordUpgrade = (state: GameState): boolean => {
  const cost = calculateUpgradeCost(state.miracleLevel);
  const availableTotal = WORSHIPPER_ORDER.reduce((sum, t) => sum + state.worshippers[t], 0);
  return availableTotal >= cost;
};

export const deductWorshippers = (state: GameState, amount: number): Record<WorshipperType, number> => {
  const newWorshippers = { ...state.worshippers };
  let remainingCost = amount;
  
  for (const type of WORSHIPPER_ORDER) {
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
  const cost = calculateUpgradeCost(state.miracleLevel);
  return deductWorshippers(state, cost);
};

/**
 * Calculates the cost to buy/upgrade a specific vessel.
 */
export const calculateVesselCost = (vesselId: string, currentLevel: number): number => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def) return 0;
  
  let multiplier = 1.25; 
  if (def.tier === 1) multiplier = 1.15;
  else if (def.tier === 2) multiplier = 1.1675;
  else if (def.tier === 3) multiplier = 1.175;
  else if (def.tier === 4) multiplier = 1.2;

  return Math.floor(def.baseCost * Math.pow(multiplier, currentLevel));
};

/**
 * Assistant cost calculation. Specific sequence based on user request.
 * Recruit: 1 Worldly
 * Up 1: 1 Zealous
 * Up 2: 100,000 Zealous
 * Up 3: 100,000,000 Zealous
 * Up 4: 100,000,000,000 Zealous
 */
export const calculateAssistantCost = (currentLevel: number): { amount: number, type: WorshipperType } => {
  if (currentLevel === 0) return { amount: 1, type: WorshipperType.WORLDLY };
  if (currentLevel === 1) return { amount: 1, type: WorshipperType.ZEALOUS };
  if (currentLevel === 2) return { amount: 100000, type: WorshipperType.ZEALOUS };
  if (currentLevel === 3) return { amount: 100000000, type: WorshipperType.ZEALOUS };
  if (currentLevel === 4) return { amount: 100000000000, type: WorshipperType.ZEALOUS };
  
  return { amount: Infinity, type: WorshipperType.ZEALOUS };
};

/**
 * Assistant click interval (ms).
 * Intervals: 1000, 750, 500, 250, 125
 */
export const calculateAssistantInterval = (level: number): number => {
  const intervals = [Infinity, 1000, 750, 500, 250, 125];
  return intervals[level] || 125;
};

/**
 * Calculates the output (worshippers per second) of a specific vessel.
 * Now includes the Soul bonus.
 */
export const calculateVesselOutput = (vesselId: string, currentLevel: number, souls: number = 0): number => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def) return 0;
  const soulMultiplier = 1 + (souls * 0.01);
  return Math.floor(def.baseOutput * currentLevel * soulMultiplier);
};

export const calculateProductionByType = (vesselLevels: Record<string, number>, isPaused: Record<WorshipperType, boolean>, souls: number = 0): Record<WorshipperType, number> => {
  const production: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
  };

  VESSEL_DEFINITIONS.forEach(def => {
    const level = vesselLevels[def.id] || 0;
    if (level > 0 && !isPaused[def.type]) {
      const output = calculateVesselOutput(def.id, level, souls);
      production[def.type] += output;
    }
  });

  return production;
};

/**
 * Consumption is tied to Vessel production capacity.
 */
export const calculateConsumptionByType = (vesselLevels: Record<string, number>, isPaused: Record<WorshipperType, boolean>, souls: number = 0): Record<WorshipperType, number> => {
  const totalConsumption: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
  };

  VESSEL_DEFINITIONS.forEach(def => {
    const level = vesselLevels[def.id] || 0;
    if (level > 0 && !isPaused[def.type]) {
      const output = calculateVesselOutput(def.id, level, souls);
      const rates = CONSUMPTION_RATES[def.type];
      
      (Object.keys(rates) as WorshipperType[]).forEach(resourceType => {
        const rate = rates[resourceType] || 0;
        totalConsumption[resourceType] += output * rate;
      });
    }
  });

  return totalConsumption;
};

export const calculateNetIncomeByType = (gameState: GameState): Record<WorshipperType, number> => {
  const production = calculateProductionByType(gameState.vesselLevels, gameState.isPaused, gameState.souls);
  const consumption = calculateConsumptionByType(gameState.vesselLevels, gameState.isPaused, gameState.souls);
  
  const net: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 0,
    [WorshipperType.LOWLY]: 0,
    [WorshipperType.WORLDLY]: 0,
    [WorshipperType.ZEALOUS]: 0,
  };

  WORSHIPPER_ORDER.forEach(type => {
    net[type] = production[type] - consumption[type];
  });

  return net;
};

export const calculateTotalPassiveIncome = (vesselLevels: Record<string, number>, isPaused: Record<WorshipperType, boolean>, souls: number = 0): number => {
  const prodByType = calculateProductionByType(vesselLevels, isPaused, souls);
  return Object.values(prodByType).reduce((total: number, val: number) => total + val, 0);
};

export const calculateBulkUpgrade = (
  currentLevel: number, 
  increment: number | 'MAX', 
  state: GameState
): { cost: number, count: number, targetLevel: number } => {
  
  const availableFunds = WORSHIPPER_ORDER.reduce((sum, t) => sum + state.worshippers[t], 0);
  
  if (increment === 'MAX') {
    let costSoFar = 0;
    let lvl = currentLevel;
    
    while (true) {
      const nextCost = calculateUpgradeCost(lvl);
      if (availableFunds >= costSoFar + nextCost) {
        costSoFar += nextCost;
        lvl++;
      } else {
        break;
      }
    }
    
    if (lvl === currentLevel) {
       return { cost: calculateUpgradeCost(currentLevel), count: 0, targetLevel: currentLevel + 1 };
    }
    
    return { cost: costSoFar, count: lvl - currentLevel, targetLevel: lvl };
  } else {
    const inc = increment as number;
    // Calculate how many to get to the next multiple
    let count = inc - (currentLevel % inc);
    if (currentLevel % inc === 0) count = inc;

    const target = currentLevel + count;
    
    let totalCost = 0;
    for (let l = currentLevel; l < target; l++) {
      totalCost += calculateUpgradeCost(l);
    }
    
    return { 
        cost: totalCost, 
        count: count, 
        targetLevel: target
    };
  }
};

export interface BulkVesselResult {
  cost: number;
  count: number;
  targetLevel: number;
  isCappedBySustainability?: boolean;
  costType?: WorshipperType;
}

export const calculateBulkVesselBuy = (
  vesselId: string,
  currentLevel: number,
  increment: number | 'MAX',
  state: GameState,
  vesselType: WorshipperType
): BulkVesselResult => {
  let initialCount = 0;
  let initialCost = 0;
  const available = state.worshippers[vesselType];

  if (increment === 'MAX') {
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
    initialCount = lvl - currentLevel;
    initialCost = costSoFar;
  } else {
    const inc = increment as number;
    // Round to nearest multiple
    let countToBuy = inc - (currentLevel % inc);
    if (currentLevel % inc === 0) countToBuy = inc;
    
    initialCount = countToBuy;
    let totalCost = 0;
    for (let l = currentLevel; l < currentLevel + countToBuy; l++) {
        totalCost += calculateVesselCost(vesselId, l);
    }
    initialCost = totalCost;
  }

  let finalCount = initialCount;
  let isCappedBySustainability = false;

  if (vesselType === WorshipperType.LOWLY) {
    const prod = calculateProductionByType(state.vesselLevels, state.isPaused, state.souls);
    const potentialCons = calculateConsumptionByType(state.vesselLevels, {
        [WorshipperType.INDOLENT]: false,
        [WorshipperType.LOWLY]: false,
        [WorshipperType.WORLDLY]: false,
        [WorshipperType.ZEALOUS]: false,
    }, state.souls);
    
    const indolentProd = prod[WorshipperType.INDOLENT];
    const indolentCons = potentialCons[WorshipperType.INDOLENT];
    const availableCapacity = Math.max(0, indolentProd - indolentCons);

    const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
    const consumptionPerLevel = (def?.baseOutput || 0) * (CONSUMPTION_RATES[WorshipperType.LOWLY][WorshipperType.INDOLENT] || 0);
    
    const sustainableExtraLevels = consumptionPerLevel > 0 ? Math.floor(availableCapacity / consumptionPerLevel) : 999999;
    
    if (finalCount > sustainableExtraLevels) {
      finalCount = Math.max(0, sustainableExtraLevels);
      isCappedBySustainability = true;
    }
  }

  let finalCost = initialCost;
  if (finalCount !== initialCount) {
    finalCost = 0;
    for (let l = currentLevel; l < currentLevel + finalCount; l++) {
      finalCost += calculateVesselCost(vesselId, l);
    }
  }

  if (increment !== 'MAX' && available < calculateVesselCost(vesselId, currentLevel)) {
    return {
      cost: calculateVesselCost(vesselId, currentLevel),
      count: 0,
      targetLevel: currentLevel + 1,
      isCappedBySustainability
    };
  }

  return {
    cost: finalCost,
    count: finalCount,
    targetLevel: currentLevel + finalCount,
    isCappedBySustainability
  };
};

export const calculateAssistantBulkVesselBuy = (
  currentLevel: number,
  increment: number | 'MAX',
  state: GameState
): BulkVesselResult => {
  let count = 0;
  let totalCost = 0;
  let currentLvl = currentLevel;
  let maxLevels = 5; 

  if (increment === 'MAX') {
    while (currentLvl < maxLevels) {
      const { amount, type } = calculateAssistantCost(currentLvl);
      if (state.worshippers[type] >= totalCost + amount) {
        if (count > 0) {
            const next = calculateAssistantCost(currentLvl);
            const prev = calculateAssistantCost(currentLvl - 1);
            if (next.type !== prev.type) break; 
        }
        totalCost += amount;
        currentLvl++;
        count++;
      } else {
        break;
      }
    }
  } else {
    const requested = increment as number;
    // Calculate rounding logic for assistant as well? Probably not strictly needed as it only goes to level 5,
    // but for consistency with the prompt's "This applies to all the increments":
    let countToBuy = requested - (currentLevel % requested);
    if (currentLevel % requested === 0) countToBuy = requested;

    for (let i = 0; i < countToBuy; i++) {
        if (currentLvl >= maxLevels) break;
        const { amount } = calculateAssistantCost(currentLvl);
        totalCost += amount;
        currentLvl++;
        count++;
    }
  }

  const { type: nextType } = calculateAssistantCost(currentLevel);

  return {
    cost: totalCost || calculateAssistantCost(currentLevel).amount,
    count: count,
    targetLevel: currentLevel + count,
    costType: nextType
  };
};

export const calculateSoulsEarned = (state: GameState): number => {
  const totalZealous = state.maxWorshippersByType[WorshipperType.ZEALOUS];
  if (totalZealous < PRESTIGE_UNLOCK_THRESHOLD) return 0;
  const surplus = totalZealous - PRESTIGE_UNLOCK_THRESHOLD;
  return Math.floor(10 + 0.01 * Math.pow(surplus, 1/3));
};
