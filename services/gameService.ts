import { COST_MULTIPLIER, INITIAL_UPGRADE_COST, GEM_DEFINITIONS, MILESTONE_INTERVAL, MILESTONE_DEFINITIONS } from "../constants";
import { GameState, GemType, WorshipperType, WORSHIPPER_ORDER } from "../types";

/**
 * Calculates the cost of the next miracle upgrade.
 * Formula: Initial * (1.15 ^ CurrentLevel)
 */
export const calculateUpgradeCost = (currentLevel: number): number => {
  return Math.floor(INITIAL_UPGRADE_COST * Math.pow(COST_MULTIPLIER, currentLevel));
};

/**
 * Calculates the production power (worshippers per click).
 * Formula: 1 + CurrentLevel (Linear scaling starting at 1)
 */
export const calculateClickPower = (currentLevel: number): number => {
  return 1 + currentLevel; // Level 0 = 1 power, Level 1 = 2 power, etc.
};

/**
 * Determines which worshipper type is attracted based on the equipped gem.
 * Uses a weighted system: Indolent (Common) > Lowly > Worldly > Zealous (Rare).
 * Focus gems double the weight of the favored type.
 */
export const rollWorshipperType = (gem: GemType): WorshipperType => {
  const definition = GEM_DEFINITIONS[gem];
  
  // Base weights (Total 100 without gems)
  const weights: Record<WorshipperType, number> = {
    [WorshipperType.INDOLENT]: 40,
    [WorshipperType.LOWLY]: 30,
    [WorshipperType.WORLDLY]: 20,
    [WorshipperType.ZEALOUS]: 10,
  };

  // Apply Gem Modifier (Double the weight of the favored type)
  if (definition.favoredType) {
    weights[definition.favoredType] *= 2;
  }

  // Calculate total weight
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  
  // Roll random number
  let random = Math.random() * totalWeight;
  
  // Determine result
  for (const type of [WorshipperType.INDOLENT, WorshipperType.LOWLY, WorshipperType.WORLDLY, WorshipperType.ZEALOUS]) {
    random -= weights[type];
    if (random <= 0) {
      return type;
    }
  }

  return WorshipperType.INDOLENT; // Fallback
};

/**
 * Returns milestone details if the current level triggers a milestone.
 * Progression: Level 5, 10, then 25, 50, 75, etc.
 */
export const getMilestoneState = (currentLevel: number) => {
  if (currentLevel === 5) {
    return {
      isMilestone: true,
      definition: MILESTONE_DEFINITIONS[0], // Indolent
      costMultiplier: 2
    };
  }

  if (currentLevel === 10) {
    return {
      isMilestone: true,
      definition: MILESTONE_DEFINITIONS[1], // Lowly
      costMultiplier: 2
    };
  }

  if (currentLevel >= MILESTONE_INTERVAL && currentLevel % MILESTONE_INTERVAL === 0) {
    // For levels 25, 50, 75...
    // We need to map 25 -> Index 2 (Worldly)
    // 50 -> Index 3 (Zealous)
    // 75 -> Index 0 (Indolent)
    
    const count = currentLevel / MILESTONE_INTERVAL; 
    const definitionIndex = (count + 1) % MILESTONE_DEFINITIONS.length;

    return {
      isMilestone: true,
      definition: MILESTONE_DEFINITIONS[definitionIndex],
      costMultiplier: 2
    };
  }
  
  return { isMilestone: false };
};

/**
 * Checks if the player can afford an upgrade (Normal or Milestone).
 */
export const canAffordUpgrade = (state: GameState): boolean => {
  const baseCost = calculateUpgradeCost(state.miracleLevel);
  const milestone = getMilestoneState(state.miracleLevel);

  if (milestone.isMilestone && milestone.definition) {
    const cost = baseCost * milestone.costMultiplier!;
    return state.worshippers[milestone.definition.type] >= cost;
  }

  return state.totalWorshippers >= baseCost;
};

/**
 * Processes the sacrifice of worshippers to pay for an upgrade.
 */
export const sacrificeWorshippers = (state: GameState): Record<WorshipperType, number> => {
  const baseCost = calculateUpgradeCost(state.miracleLevel);
  const milestone = getMilestoneState(state.miracleLevel);
  const newWorshippers = { ...state.worshippers };

  // Milestone Logic: Specific Type Sacrifice
  if (milestone.isMilestone && milestone.definition) {
    const cost = baseCost * milestone.costMultiplier!;
    newWorshippers[milestone.definition.type] -= cost;
    return newWorshippers;
  }

  // Normal Logic: Order Cascade
  let remainingCost = baseCost;
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