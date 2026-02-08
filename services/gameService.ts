import { COST_MULTIPLIER, INITIAL_UPGRADE_COST, VESSEL_DEFINITIONS } from "../constants";
import { GameState, WorshipperType, RelicId, GemType, IncrementType, VesselId, FateId, WORSHIPPER_ORDER } from "../types";

const getFateMod = (state: GameState, id: FateId) => {
  return (state.fates[id] || 0);
};

export const calculateUpgradeCost = (currentLevel: number, state: GameState): number => {
  const fateCostMod = 1 + getFateMod(state, 'miracle_cost');
  return Math.floor(INITIAL_UPGRADE_COST * Math.pow(COST_MULTIPLIER, currentLevel) * fateCostMod);
};

export const calculateBulkUpgrade = (currentLevel: number, increment: IncrementType, state: GameState) => {
  let count = 0;
  let totalCost = 0;
  let tempLevel = currentLevel;
  
  if (increment === 'MAX') {
    while (true) {
      const cost = calculateUpgradeCost(tempLevel, state);
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
      totalCost += calculateUpgradeCost(tempLevel + i, state);
    }
    count = targetCount;
  }

  return { count, cost: totalCost };
};

export const calculateMilestoneMultiplier = (level: number): number => {
  let multiplier = 1;
  if (level >= 10) multiplier *= 2;
  if (level >= 25) multiplier *= 2;
  if (level >= 50) multiplier *= 2;
  if (level >= 100) {
    const hundreds = Math.floor(level / 100);
    multiplier *= Math.pow(2, hundreds);
  }
  return multiplier;
};

export const isMilestoneLevel = (level: number): boolean => {
  if (level === 10 || level === 25 || level === 50) return true;
  if (level >= 100 && level % 100 === 0) return true;
  return false;
};

// Split into Manual and Mattelock powers
export const calculateManualClickPower = (currentLevel: number, state: GameState): number => {
  const base = 10 + (currentLevel * 5);
  const milestoneMultiplier = calculateMilestoneMultiplier(currentLevel);
  const manualFateMod = 1 + getFateMod(state, 'click_power');
  // Manual power only uses manual bonuses
  return base * milestoneMultiplier * manualFateMod;
};

export const calculateMattelockClickPower = (currentLevel: number, state: GameState): number => {
  const base = 10 + (currentLevel * 5);
  const milestoneMultiplier = calculateMilestoneMultiplier(currentLevel);
  
  const mattelockFateMod = 1 + getFateMod(state, 'mattelock_power');
  const contractLvl = state.relics[RelicId.CONTRACT] || 0;
  const contractMultiplier = 1 + (contractLvl * 0.25);

  // Mattelock power uses exclusive Mattelock bonuses and Relic_CONTRACT
  return base * milestoneMultiplier * mattelockFateMod * contractMultiplier;
};

// Standard click power for UI display (usually manual)
export const calculateClickPower = (currentLevel: number, state: GameState): number => {
  return calculateManualClickPower(currentLevel, state);
};

const getGemForCaste = (caste: WorshipperType | null): GemType | null => {
  if (caste === WorshipperType.INDOLENT) return GemType.LAPIS;
  if (caste === WorshipperType.LOWLY) return GemType.QUARTZ;
  if (caste === WorshipperType.WORLDLY) return GemType.EMERALD;
  if (caste === WorshipperType.ZEALOUS) return GemType.RUBY;
  return null;
};

export const calculateVesselEfficiency = (state: GameState, vesselId: VesselId): number => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  const requirements = def?.baseConsumption;
  
  if (!requirements || Object.keys(requirements).length === 0) return 1.0;

  const lvl = state.vesselLevels[vesselId] || 0;
  if (lvl === 0 || state.vesselToggles[vesselId]) return 0;

  const milestoneMultiplier = calculateMilestoneMultiplier(lvl);
  const relicGluttonyLvl = state.relics[RelicId.GLUTTONY] || 0;
  const consumptionReduction = relicGluttonyLvl * 0.05;

  let minEfficiency = 1.0;

  Object.entries(requirements).forEach(([resType, baseRate]) => {
    const type = resType as WorshipperType;
    
    // REBELLION LOGIC: If a resource is rebelling, vessels consuming it have free efficiency for that resource
    if (state.rebellionTimeRemaining > 0 && state.rebelCaste === type) {
      return; 
    }

    let fateConsMod = 1;
    if (type === WorshipperType.LOWLY) fateConsMod += getFateMod(state, 'lowly_cons');
    if (type === WorshipperType.WORLDLY) fateConsMod += getFateMod(state, 'worldly_cons');
    if (type === WorshipperType.ZEALOUS) fateConsMod += getFateMod(state, 'zealous_cons');

    let required = Math.floor(baseRate! * lvl * milestoneMultiplier * (1 - consumptionReduction) * fateConsMod);
    
    const defType = VESSEL_DEFINITIONS.find(v => v.id === vesselId)?.type || null;
    const hasVoidCatalyst = (state.relics[RelicId.VOID_CATALYST] || 0) > 0;
    if (hasVoidCatalyst && state.activeGem && getGemForCaste(defType) === state.activeGem) {
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
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  const requirements = def?.baseConsumption;
  if (!requirements || level === 0) return null;

  const consumedType = Object.keys(requirements)[0] as WorshipperType;
  if (!consumedType) return null;

  // REBELLION LOGIC
  if (state.rebellionTimeRemaining > 0 && state.rebelCaste === consumedType) {
    return { type: consumedType, amount: 0 };
  }

  const baseRate = (requirements as any)[consumedType]!;
  const milestoneMultiplier = calculateMilestoneMultiplier(level);
  
  const relicGluttonyLvl = state.relics[RelicId.GLUTTONY] || 0;
  const consumptionReduction = relicGluttonyLvl * 0.05;

  let fateConsMod = 1;
  if (consumedType === WorshipperType.LOWLY) fateConsMod += getFateMod(state, 'lowly_cons');
  if (consumedType === WorshipperType.WORLDLY) fateConsMod += getFateMod(state, 'worldly_cons');
  if (consumedType === WorshipperType.ZEALOUS) fateConsMod += getFateMod(state, 'zealous_cons');
  
  const efficiency = calculateVesselEfficiency(state, vesselId);
  
  let currentReduction = consumptionReduction;
  const hasVoidCatalyst = (state.relics[RelicId.VOID_CATALYST] || 0) > 0;
  if (hasVoidCatalyst && state.activeGem && getGemForCaste(def!.type) === state.activeGem) {
      currentReduction = Math.min(1.0, currentReduction + 0.5);
  }

  const amount = Math.floor(baseRate * level * milestoneMultiplier * efficiency * (1 - currentReduction) * fateConsMod);
  
  return { type: consumedType, amount };
};

export const getVesselCostInfo = (vesselId: string, level: number, state: GameState): { amount: number, type: WorshipperType } => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def) return { amount: 0, type: WorshipperType.INDOLENT };

  let fateCostMod = 1;
  if (def.type === WorshipperType.INDOLENT) fateCostMod += getFateMod(state, 'indolent_cost');
  if (def.type === WorshipperType.LOWLY) fateCostMod += getFateMod(state, 'lowly_cost');
  if (def.type === WorshipperType.WORLDLY) fateCostMod += getFateMod(state, 'worldly_cost');
  if (def.type === WorshipperType.ZEALOUS) fateCostMod += getFateMod(state, 'zealous_cost');

  if (level === 0) {
    if (vesselId === VesselId.LOWLY_1) return { amount: Math.floor(1000 * fateCostMod), type: WorshipperType.INDOLENT };
    if (vesselId === VesselId.WORLDLY_1) return { amount: Math.floor(1000 * fateCostMod), type: WorshipperType.LOWLY };
    if (vesselId === VesselId.ZEALOUS_1) return { amount: Math.floor(1000 * fateCostMod), type: WorshipperType.WORLDLY };
  }

  const multiplier = def.costMultiplier;
  return { 
    amount: Math.floor(def.baseCost * Math.pow(multiplier, level) * fateCostMod), 
    type: def.type 
  };
};

export const calculateVesselCost = (vesselId: string, currentLevel: number, state: GameState): number => {
  return getVesselCostInfo(vesselId, currentLevel, state).amount;
};

export const calculateBulkVesselBuy = (vesselId: string, currentLevel: number, increment: IncrementType, state: GameState) => {
  let count = 0;
  let totalCost = 0;
  let tempLevel = currentLevel;
  
  const { type: initialCostType } = getVesselCostInfo(vesselId, tempLevel, state);

  if (increment === 'MAX') {
    while (true) {
      const { amount, type } = getVesselCostInfo(vesselId, tempLevel, state);
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
      const { amount, type } = getVesselCostInfo(vesselId, tempLevel + i, state);
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
    [RelicId.GLUTTONY]: 10, 
    [RelicId.BETRAYAL]: 25, 
    [RelicId.FALSE_IDOL]: 500, 
    [RelicId.CONTRACT]: 50,
    [RelicId.VOID_CATALYST]: 500, 
    [RelicId.ABYSSAL_REFLEX]: 100, 
    [RelicId.FRENZY]: 1000, 
    [RelicId.REBELLION]: 1000,
    [RelicId.SOUL_HARVESTER]: 500
  };
  const base = baseCosts[relicId] || 10;
  const multiplier = (relicId === RelicId.SOUL_HARVESTER) ? 4 : 2;
  // Level caps are 1 for specific relics
  if (relicId === RelicId.FRENZY || relicId === RelicId.REBELLION || relicId === RelicId.FALSE_IDOL || relicId === RelicId.VOID_CATALYST) return base;
  return Math.floor(base * Math.pow(multiplier, currentLevel));
};

export const calculateAssistantCost = (currentLevel: number): { amount: number, type: WorshipperType } => {
  const cost = Math.floor(1 * Math.pow(100, currentLevel));
  return { amount: cost, type: WorshipperType.WORLDLY };
};

export const calculateAssistantBulkVesselBuy = (currentLevel: number, increment: IncrementType, state: GameState) => {
  let count = 0;
  let totalCost = 0;
  let tempLevel = currentLevel;
  const costType = WorshipperType.WORLDLY;
  const MAX_LEVEL = 5;

  if (currentLevel >= MAX_LEVEL) {
    return { count: 0, cost: 0, costType };
  }

  if (increment === 'MAX') {
    while (tempLevel < MAX_LEVEL) {
      const { amount } = calculateAssistantCost(tempLevel);
      if (state.worshippers[costType] < totalCost + amount) break;
      totalCost += amount;
      tempLevel++;
      count++;
    }
  } else {
    const inc = increment as number;
    let targetCount = inc - (currentLevel % inc);
    if (currentLevel % inc === 0) targetCount = inc;
    
    if (currentLevel + targetCount > MAX_LEVEL) {
        targetCount = MAX_LEVEL - currentLevel;
    }

    for (let i = 0; i < targetCount; i++) {
      const { amount } = calculateAssistantCost(tempLevel + i);
      totalCost += amount;
    }
    count = targetCount;
  }

  return { count, cost: totalCost, costType };
};

export const calculateAssistantInterval = (level: number, state?: GameState): number => {
  if (level === 0) return Infinity;
  let baseInterval = 2000 / Math.pow(2, level - 1);
  
  // FRENZY LOGIC: Quadruple speed
  if (state && state.frenzyTimeRemaining > 0) {
    baseInterval /= 4;
  }

  return baseInterval;
};

export const calculateVesselOutput = (vesselId: string, currentLevel: number, state: GameState): number => {
  const def = VESSEL_DEFINITIONS.find(v => v.id === vesselId);
  if (!def || currentLevel === 0) return 0;
  const milestoneMultiplier = calculateMilestoneMultiplier(currentLevel);
  
  let fateOutMod = 1;
  if (def.type === WorshipperType.INDOLENT) fateOutMod += getFateMod(state, 'indolent_output');
  if (def.type === WorshipperType.LOWLY) fateOutMod += getFateMod(state, 'lowly_output');
  if (def.type === WorshipperType.WORLDLY) fateOutMod += getFateMod(state, 'worldly_output');
  if (def.type === WorshipperType.ZEALOUS) fateOutMod += getFateMod(state, 'zealous_output');

  return def.baseOutput * currentLevel * milestoneMultiplier * fateOutMod;
};

export const calculateProductionByType = (state: GameState): Record<WorshipperType, number> => {
  const production: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 0, [WorshipperType.LOWLY]: 0, [WorshipperType.WORLDLY]: 0, [WorshipperType.ZEALOUS]: 0,
  };

  VESSEL_DEFINITIONS.forEach(def => {
    const level = state.vesselLevels[def.id] || 0;
    if (level > 0 && !state.vesselToggles[def.id]) {
      const efficiency = calculateVesselEfficiency(state, def.id as VesselId);
      const output = calculateVesselOutput(def.id, level, state);
      production[def.type] += Math.floor(output * efficiency);
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
      const requirements = def.baseConsumption;
      
      if (!requirements) return;

      const milestoneMultiplier = calculateMilestoneMultiplier(level);
      let baseReduction = consumptionReduction;
      
      const hasVoidCatalyst = (state.relics[RelicId.VOID_CATALYST] || 0) > 0;
      if (hasVoidCatalyst && state.activeGem && getGemForCaste(def.type) === state.activeGem) {
          baseReduction = Math.min(1.0, baseReduction + 0.5);
      }

      Object.entries(requirements).forEach(([resType, rate]) => {
        const type = resType as WorshipperType;
        
        // REBELLION LOGIC: Skip consumption if rebelling
        if (state.rebellionTimeRemaining > 0 && state.rebelCaste === type) {
          return;
        }

        let fateConsMod = 1;
        if (type === WorshipperType.LOWLY) fateConsMod += getFateMod(state, 'lowly_cons');
        if (type === WorshipperType.WORLDLY) fateConsMod += getFateMod(state, 'worldly_cons');
        if (type === WorshipperType.ZEALOUS) fateConsMod += getFateMod(state, 'zealous_cons');

        const amount = Math.floor(rate! * level * milestoneMultiplier * efficiency * (1 - baseReduction) * fateConsMod);
        totalConsumption[type] += amount;
      });
    }
  });

  return totalConsumption;
};

export const calculateNetIncomeByType = (state: GameState): Record<WorshipperType, number> => {
  const production = calculateProductionByType(state);
  const consumption = calculateConsumptionByType(state);
  const net: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 0, [WorshipperType.LOWLY]: 0, [WorshipperType.WORLDLY]: 0, [WorshipperType.ZEALOUS]: 0,
  };
  WORSHIPPER_ORDER.forEach(type => {
    net[type] = production[type] - consumption[type];
  });
  return net;
};

export const calculateSoulsEarned = (state: GameState): number => {
  const currentZealous = state.worshippers[WorshipperType.ZEALOUS] || 0;
  const baseSouls = Math.sqrt(currentZealous);
  const eyeLvl = state.relics[RelicId.SOUL_HARVESTER] || 0;
  const bonus = 1 + (eyeLvl * 0.05);
  return Math.floor(baseSouls * bonus);
};