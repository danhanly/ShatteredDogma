
import { COST_MULTIPLIER, INITIAL_UPGRADE_COST, VESSEL_DEFINITIONS, CONSUMPTION_RATES_PER_LVL } from "../constants";
import { GameState, WorshipperType, RelicId, GemType, IncrementType, VesselId } from "../types";

export const calculateUpgradeCost = (currentLevel: number): number => {
  return Math.floor(INITIAL_UPGRADE_COST * Math.pow(COST_MULTIPLIER, currentLevel));
};

export const calculateBulkUpgrade = (currentLevel: number, increment: IncrementType, state: GameState) => {
  let count = 0;
  let totalCost = 0;
  let tempLevel = currentLevel;
  
  if (increment === 'MAX') {
    while (true) {
      const cost = calculateUpgradeCost(tempLevel);
      if (state.worshippers[WorshipperType.INDOLENT] < totalCost + cost) break;
      totalCost += cost;
      tempLevel++;
      count++;
      if (count >= 1000) break;
    }
  } else {
    const inc = increment as number;
    let targetCount = inc - (currentLevel % inc);
    if (currentLevel % inc === 0) targetCount = inc;

    for (let i = 0; i < targetCount; i++) {
      totalCost += calculateUpgradeCost(tempLevel + i);
    }
    count = targetCount;
  }

  return { count, cost: totalCost };
};

export const calculateClickPower = (currentLevel: number): number => {
  return 10 + (currentLevel * 5);
};

export const rollWorshipperType = (): WorshipperType => {
  return WorshipperType.INDOLENT; 
};

const getGemForCaste = (caste: WorshipperType | null): GemType | null => {
  if (caste === WorshipperType.INDOLENT) return GemType.LAPIS;
  if (caste === WorshipperType.LOWLY) return GemType.QUARTZ;
  if (caste === WorshipperType.WORLDLY) return GemType.EMERALD;
  if (caste === WorshipperType.ZEALOUS) return GemType.RUBY;
  return null;
};

export const calculateVesselEfficiency = (state: GameState, vesselId: VesselId): number => {
  const requirements = CONSUMPTION_RATES_PER_LVL[vesselId];
  if (!requirements || Object.keys(requirements).length === 0) return 1.0;

  const lvl = state.vesselLevels[vesselId] || 0;
  if (lvl === 0 || state.vesselToggles[vesselId]) return 0;

  const relicGluttonyLvl = state.relics[RelicId.GLUTTONY] || 0;
  const consumptionReduction = relicGluttonyLvl * 0.05;

  let minEfficiency = 1.0;

  Object.entries(requirements).forEach(([resType, baseRate]) => {
    const type = resType as WorshipperType;
    let required = Math.floor(baseRate! * lvl * (1 - consumptionReduction));
    
    if (state.activeGem && getGemForCaste(state.vesselLevels[vesselId] ? VESSEL_DEFINITIONS.find(v => v.id === vesselId)!.type : null) === state.activeGem) {
        required = Math.floor(required * 0.5);
    }

    if (required === 0) return;

    const available = state.worshippers[type] || 0;
    const eff = Math.floor(Math.min(1.0, available / required) * 100) / 100;
    if (eff < minEfficiency) minEfficiency = eff;
  });

  return minEfficiency;
};

export const calculateSingleVesselConsumption = (state: GameState, vesselId: VesselId, level: number): { type: WorshipperType, amount: number } | null => {
  const requirements = CONSUMPTION_RATES_PER_LVL[vesselId];
  if (!requirements) return null;

  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def) return null;

  // Find the consumed type (assuming 1 for now based on data)
  const consumedType = Object.keys(requirements)[0] as WorshipperType;
  if (!consumedType) return null;

  const baseRate = requirements[consumedType]!;
  
  const relicGluttonyLvl = state.relics[RelicId.GLUTTONY] || 0;
  const consumptionReduction = relicGluttonyLvl * 0.05;
  
  const efficiency = calculateVesselEfficiency(state, vesselId);
  
  let currentReduction = consumptionReduction;
  if (state.activeGem && getGemForCaste(def.type) === state.activeGem) {
      currentReduction = Math.min(1.0, currentReduction + 0.5);
  }

  const amount = Math.floor(baseRate * level * efficiency * (1 - currentReduction));
  
  return { type: consumedType, amount };
};

const getVesselMultiplier = (vesselId: string): number => {
  const multipliers: Record<string, number> = {
    [VesselId.INDOLENT_1]: 1.15, [VesselId.LOWLY_1]: 1.20, [VesselId.WORLDLY_1]: 1.22, [VesselId.ZEALOUS_1]: 1.25,
    [VesselId.INDOLENT_2]: 1.18, [VesselId.LOWLY_2]: 1.22, [VesselId.WORLDLY_2]: 1.24, [VesselId.ZEALOUS_2]: 1.28,
    [VesselId.INDOLENT_3]: 1.18, [VesselId.LOWLY_3]: 1.22, [VesselId.WORLDLY_3]: 1.25, [VesselId.ZEALOUS_3]: 1.30,
    [VesselId.INDOLENT_4]: 1.15, [VesselId.LOWLY_4]: 1.20, [VesselId.WORLDLY_4]: 1.22, [VesselId.ZEALOUS_4]: 1.25,
  };
  return multipliers[vesselId] || 1.2;
};

export const getVesselCostInfo = (vesselId: string, level: number): { amount: number, type: WorshipperType } => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def) return { amount: 0, type: WorshipperType.INDOLENT };

  if (level === 0) {
    if (vesselId === VesselId.LOWLY_1) return { amount: 1000, type: WorshipperType.INDOLENT };
    if (vesselId === VesselId.WORLDLY_1) return { amount: 1000, type: WorshipperType.LOWLY };
    if (vesselId === VesselId.ZEALOUS_1) return { amount: 1000, type: WorshipperType.WORLDLY };
  }

  const multiplier = getVesselMultiplier(vesselId);
  return { 
    amount: Math.floor(def.baseCost * Math.pow(multiplier, level)), 
    type: def.type 
  };
};

export const calculateVesselCost = (vesselId: string, currentLevel: number): number => {
  return getVesselCostInfo(vesselId, currentLevel).amount;
};

export const calculateBulkVesselBuy = (vesselId: string, currentLevel: number, increment: IncrementType, state: GameState) => {
  let count = 0;
  let totalCost = 0;
  let tempLevel = currentLevel;
  
  const { type: initialCostType } = getVesselCostInfo(vesselId, tempLevel);

  if (increment === 'MAX') {
    while (true) {
      const { amount, type } = getVesselCostInfo(vesselId, tempLevel);
      if (type !== initialCostType) break;

      if (state.worshippers[type] < totalCost + amount) break;
      totalCost += amount;
      tempLevel++;
      count++;
      if (count >= 1000) break;
    }
  } else {
    const inc = increment as number;
    let targetCount = inc - (currentLevel % inc);
    if (currentLevel % inc === 0) targetCount = inc;
    
    for (let i = 0; i < targetCount; i++) {
      const { amount, type } = getVesselCostInfo(vesselId, tempLevel + i);
      if (type !== initialCostType && count > 0) break;
      
      totalCost += amount;
      count++;
      if (type !== initialCostType) break; 
    }
  }

  return { count, cost: totalCost, costType: initialCostType };
};

export const calculateRelicCost = (relicId: RelicId, currentLevel: number): number => {
  const baseCosts: Record<RelicId, number> = {
    [RelicId.GLUTTONY]: 10, [RelicId.BETRAYAL]: 25, [RelicId.FALSE_IDOL]: 500, [RelicId.CONTRACT]: 50,
  };
  const base = baseCosts[relicId] || 10;
  const multiplier = 2;
  return Math.floor(base * Math.pow(multiplier, currentLevel));
};

export const calculateAssistantCost = (currentLevel: number): { amount: number, type: WorshipperType } => {
  const cost = Math.floor(100 * Math.pow(1.4, currentLevel));
  const type = currentLevel === 0 ? WorshipperType.WORLDLY : WorshipperType.ZEALOUS;
  return { amount: cost, type };
};

export const calculateAssistantBulkVesselBuy = (currentLevel: number, increment: IncrementType, state: GameState) => {
  let count = 0;
  let totalCost = 0;
  let tempLevel = currentLevel;
  let costType = WorshipperType.WORLDLY;

  if (increment === 'MAX') {
    while (tempLevel < 10) {
      const { amount, type } = calculateAssistantCost(tempLevel);
      costType = type;
      if (state.worshippers[costType] < totalCost + amount) break;
      totalCost += amount;
      tempLevel++;
      count++;
    }
  } else {
    const inc = increment as number;
    let targetCount = inc - (currentLevel % inc);
    if (currentLevel % inc === 0) targetCount = inc;
    
    for (let i = 0; i < targetCount; i++) {
      const { amount, type } = calculateAssistantCost(currentLevel + i);
      costType = type;
      totalCost += amount;
    }
    count = Math.max(0, targetCount);
  }

  return { count, cost: totalCost, costType };
};

export const calculateAssistantInterval = (level: number): number => {
  if (level === 0) return Infinity;
  // Adjusted: Formula: 1 click / (2.1 - (Level * 0.1)) seconds
  // At Level 1: 1 / (2.1 - 0.1) = 1 / 2.0 = 0.5 clicks/sec = 2.0 seconds
  const rate = 1 / Math.max(0.1, 2.1 - (level * 0.1)); 
  return 1000 / rate;
};

export const calculateVesselOutput = (vesselId: string, currentLevel: number): number => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def || currentLevel === 0) return 0;
  return def.baseOutput * currentLevel;
};

export const calculateProductionByType = (state: GameState): Record<WorshipperType, number> => {
  const production: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 0, [WorshipperType.LOWLY]: 0, [WorshipperType.WORLDLY]: 0, [WorshipperType.ZEALOUS]: 0,
  };

  VESSEL_DEFINITIONS.forEach(def => {
    const level = state.vesselLevels[def.id] || 0;
    if (level > 0 && !state.vesselToggles[def.id]) {
      const efficiency = calculateVesselEfficiency(state, def.id as VesselId);
      const baseOutput = calculateVesselOutput(def.id, level);
      production[def.type] += Math.floor(baseOutput * efficiency);
    }
  });

  return production;
};

export const calculateConsumptionByType = (state: GameState): Record<WorshipperType, number> => {
  const totalConsumption: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 0, [WorshipperType.LOWLY]: 0, [WorshipperType.WORLDLY]: 0, [WorshipperType.ZEALOUS]: 0,
  };

  const relicGluttonyLvl = state.relics[RelicId.GLUTTONY] || 0;
  const consumptionReduction = relicGluttonyLvl * 0.05;

  VESSEL_DEFINITIONS.forEach(def => {
    const level = state.vesselLevels[def.id] || 0;
    if (level > 0 && !state.vesselToggles[def.id]) {
      const efficiency = calculateVesselEfficiency(state, def.id as VesselId);
      const requirements = CONSUMPTION_RATES_PER_LVL[def.id as VesselId];
      
      let baseReduction = consumptionReduction;
      if (state.activeGem && getGemForCaste(def.type) === state.activeGem) {
          baseReduction = Math.min(1.0, baseReduction + 0.5);
      }

      Object.entries(requirements).forEach(([resType, rate]) => {
        const type = resType as WorshipperType;
        const amount = Math.floor(rate! * level * efficiency * (1 - baseReduction));
        totalConsumption[type] += amount;
      });
    }
  });

  return totalConsumption;
};

export const calculateNetIncomeByType = (state: GameState): Record<WorshipperType, number> => {
  const production = calculateProductionByType(state);
  const consumption = calculateConsumptionByType(state);
  
  return {
    [WorshipperType.INDOLENT]: production[WorshipperType.INDOLENT] - consumption[WorshipperType.INDOLENT],
    [WorshipperType.LOWLY]: production[WorshipperType.LOWLY] - consumption[WorshipperType.LOWLY],
    [WorshipperType.WORLDLY]: production[WorshipperType.WORLDLY] - consumption[WorshipperType.WORLDLY],
    [WorshipperType.ZEALOUS]: production[WorshipperType.ZEALOUS] - consumption[WorshipperType.ZEALOUS],
  };
};

export const calculateSoulsEarned = (state: GameState): number => {
  const maxZealous = state.maxWorshippersByType[WorshipperType.ZEALOUS];
  return Math.floor(Math.sqrt(maxZealous));
};
