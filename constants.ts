
import { WorshipperType, VesselId, VesselDefinition, GemType, RelicId, RelicDefinition, FateId, FateDefinition, ZealotryId, ZealotryDefinition } from "./types";

export const INITIAL_UPGRADE_COST = 50; 
export const COST_MULTIPLIER = 1.5;

// Updated threshold handled in gameService/logic, keeping constant for reference or legacy checks
export const PRESTIGE_UNLOCK_THRESHOLD = 1; 

export const RELIC_DEFINITIONS: RelicDefinition[] = [
  {
    id: RelicId.GLUTTONY,
    name: "Chalice of Gluttony",
    description: "Reduces the consumption requirements of all vessels by 5% per level.",
    maxLevel: 10,
    baseCost: 10
  },
  {
    id: RelicId.MATTELOCKS_GEMS,
    name: "Mattelock’s Bag of Gemstones",
    description: "Unlocks permanent Focus Gem alignment switches for Mattelock.",
    maxLevel: 1,
    baseCost: 10
  },
  {
    id: RelicId.FURY_OF_ZEALOUS,
    name: "Fury of the Zealous",
    description: "Unlocks automation switches for Zealotry powers, allowing them to auto-renew.",
    maxLevel: 1,
    baseCost: 10
  },
  {
    id: RelicId.BETRAYAL,
    name: "Dagger of Betrayal",
    description: "Reduces the cooldown of Focus Gems by 10s per level.",
    maxLevel: 6,
    baseCost: 25
  },
  {
    id: RelicId.CONTRACT,
    name: "Mattelock’s Contract",
    description: "Mattelock gains +25% efficiency per level.",
    maxLevel: 10,
    baseCost: 50
  },
  {
    id: RelicId.ABYSSAL_REFLEX,
    name: "Abyssal Reflex",
    description: "10% chance per level (max 50%) for Focus Gem cooldown to reset immediately after use.",
    maxLevel: 5,
    baseCost: 100
  },
  {
    id: RelicId.FALSE_IDOL,
    name: "The False Idol",
    description: "Unlocks New Game+ visibility: all vessel tiers are visible from the start.",
    maxLevel: 1,
    baseCost: 500
  },
  {
    id: RelicId.VOID_CATALYST,
    name: "Void Catalyst",
    description: "Unlocks the 50% consumption reduction bonus for Focus Gems.",
    maxLevel: 1,
    baseCost: 500
  },
  {
    id: RelicId.SOUL_HARVESTER,
    name: "Eye of the Abyss",
    description: "Permanent +5% Soul acquisition per level. Endlessly upgradeable.",
    maxLevel: 999,
    baseCost: 500
  },
  {
    id: RelicId.FRENZY,
    name: "The Frenzied Heart",
    description: "Mattelock occasionally enters a 15s frenzy, quadrupling his click rate. (Once every 5 mins of play time)",
    maxLevel: 1,
    baseCost: 1000
  },
  {
    id: RelicId.REBELLION,
    name: "Martyr's Defiance",
    description: "A random caste occasionally rebels for 30s, refusing to be consumed by the caste above them. (Once every 5 mins of play time)",
    maxLevel: 1,
    baseCost: 1000
  }
];

export const ZEALOTRY_DEFINITIONS: ZealotryDefinition[] = [
  {
    id: ZealotryId.DISDAIN,
    name: "Disdain for the Lazy",
    flavor: "Zealots take exception to the bone-idle, and make it their mission to force them into action.",
    description: "Indolent Production x4",
    cost: 500,
    duration: 30
  },
  {
    id: ZealotryId.NO_BREAKS,
    name: "No Breaks!",
    flavor: "Zealots begin preventing any respite of the Lowly worshippers. No sleep, no rest, no water.",
    description: "Lowly Production x4",
    cost: 1000,
    duration: 30
  },
  {
    id: ZealotryId.POLITICS,
    name: "Politics and the Abyss",
    flavor: "The Zealous have noticed the Worldly escaping the clutches of the Abyss, and vow to put a stop to it.",
    description: "Worldly Production x4",
    cost: 2500,
    duration: 30
  },
  {
    id: ZealotryId.SELF_FLAGELLATION,
    name: "Self-Flaggelation",
    flavor: "For the Abyss, the Zealots will even punish themselves.",
    description: "Zealous Consumption / 2",
    cost: 5000,
    duration: 30
  },
  {
    id: ZealotryId.ISOLATING,
    name: "Isolating the Worker",
    flavor: "Seeing what the Worldly do to the Lowly, the Zealots form a protective wall.",
    description: "Worldly Consumption / 2",
    cost: 2000,
    duration: 30
  },
  {
    id: ZealotryId.PITY,
    name: "The Pity of the Abyss",
    flavor: "The Zealots take pity on the foolish and lazy.",
    description: "Lowly Consumption / 2",
    cost: 1000,
    duration: 30
  }
];

export const FATE_DEFINITIONS: Record<FateId, FateDefinition> = {
  click_power: { id: 'click_power', label: 'Manual Click Power', bonus: 0.01, suffix: '%' },
  indolent_output: { id: 'indolent_output', label: 'Indolent Vessel Output', bonus: 0.01, suffix: '%' },
  lowly_output: { id: 'lowly_output', label: 'Lowly Vessel Output', bonus: 0.01, suffix: '%' },
  worldly_output: { id: 'worldly_output', label: 'Worldly Vessel Output', bonus: 0.01, suffix: '%' },
  zealous_output: { id: 'zealous_output', label: 'Zealous Vessel Output', bonus: 0.01, suffix: '%' },
  lowly_cons: { id: 'lowly_cons', label: 'Lowly Vessel Consumption', bonus: -0.01, suffix: '%' },
  worldly_cons: { id: 'worldly_cons', label: 'Worldly Vessel Consumption', bonus: -0.01, suffix: '%' },
  zealous_cons: { id: 'zealous_cons', label: 'Zealous Vessel Consumption', bonus: -0.01, suffix: '%' },
  gem_cooldown: { id: 'gem_cooldown', label: 'Focus Gem Cooldown', bonus: -0.01, suffix: '%' },
  gem_power: { id: 'gem_power', label: 'Focus Gem Click Power', bonus: 0.05, suffix: '%' },
  mattelock_power: { id: 'mattelock_power', label: 'Mattelock Click Power', bonus: 0.02, suffix: '%' },
  miracle_cost: { id: 'miracle_cost', label: 'Dark Miracle Costs', bonus: -0.01, suffix: '%' },
  indolent_cost: { id: 'indolent_cost', label: 'Indolent Vessel Costs', bonus: -0.01, suffix: '%' },
  lowly_cost: { id: 'lowly_cost', label: 'Lowly Vessel Costs', bonus: -0.01, suffix: '%' },
  worldly_cost: { id: 'worldly_cost', label: 'Worldly Vessel Costs', bonus: -0.01, suffix: '%' },
  zealous_cost: { id: 'zealous_cost', label: 'Zealous Vessel Costs', bonus: -0.01, suffix: '%' },
};

export const VESSEL_DEFINITIONS: VesselDefinition[] = [
  // TIER 1 - Foundation
  {
    id: VesselId.INDOLENT_1,
    name: "Mudge the Slumbering",
    subtitle: "The Drifter",
    lore: "Forgotten even by time, Mudge acts as a beacon for those who simply wish to exist.",
    type: WorshipperType.INDOLENT,
    baseCost: 15,
    baseOutput: 5,
    tier: 1,
    costMultiplier: 1.15,
    isGenerator: true
  },
  {
    id: VesselId.LOWLY_1,
    name: "Little Pip, the Empty",
    subtitle: "The Destitute",
    lore: "Pip consumes the lazy energy of the Indolent to fuel his tireless work.",
    type: WorshipperType.LOWLY,
    baseCost: 150,
    baseOutput: 5,
    tier: 1,
    costMultiplier: 1.15,
    baseConsumption: { [WorshipperType.INDOLENT]: 25 }
  },
  {
    id: VesselId.WORLDLY_1,
    name: "Caspian Gold-Tongue",
    subtitle: "The Cunning Merchant",
    lore: "Caspian trades the labor of the Lowly for influence.",
    type: WorshipperType.WORLDLY,
    baseCost: 5000,
    baseOutput: 5,
    tier: 1,
    costMultiplier: 1.15,
    baseConsumption: { [WorshipperType.LOWLY]: 50 }
  },
  {
    id: VesselId.ZEALOUS_1,
    name: "Kaleb the Fevered",
    subtitle: "The Fanatic Cultist",
    lore: "Kaleb burns worldly assets to fuel spiritual fire.",
    type: WorshipperType.ZEALOUS,
    baseCost: 100000,
    baseOutput: 1,
    tier: 1,
    costMultiplier: 1.15,
    baseConsumption: { [WorshipperType.WORLDLY]: 100 }
  },

  // TIER 2 - Correction (Saviors)
  {
    id: VesselId.INDOLENT_2,
    name: "Haman of the Heavy Breath",
    subtitle: "The Labourer",
    lore: "A massive source of Indolent souls to stabilize your crashing economy.",
    type: WorshipperType.INDOLENT,
    baseCost: 2500,
    baseOutput: 100,
    tier: 2,
    costMultiplier: 1.18,
    isGenerator: true
  },
  {
    id: VesselId.LOWLY_2,
    name: "Kaelen the Unmade",
    subtitle: "The Broken Worker",
    lore: "Massive Lowly output at a heavy cost of Indolent essence.",
    type: WorshipperType.LOWLY,
    baseCost: 25000,
    baseOutput: 25,
    tier: 2,
    costMultiplier: 1.22,
    baseConsumption: { [WorshipperType.INDOLENT]: 250 }
  },
  {
    id: VesselId.WORLDLY_2,
    name: "Baron Valerius Thorne",
    subtitle: "The Ambitious Lord",
    lore: "Exploits the Lowly with industrial efficiency.",
    type: WorshipperType.WORLDLY,
    baseCost: 500000,
    baseOutput: 25,
    tier: 2,
    costMultiplier: 1.24,
    baseConsumption: { [WorshipperType.LOWLY]: 500 }
  },
  {
    id: VesselId.ZEALOUS_2,
    name: "Varkas the Spiked",
    subtitle: "The Zealot Warrior",
    lore: "His pain fuels a greater conversion of worldly greed.",
    type: WorshipperType.ZEALOUS,
    baseCost: 5000000,
    baseOutput: 5,
    tier: 2,
    costMultiplier: 1.28,
    baseConsumption: { [WorshipperType.WORLDLY]: 500 }
  },

  // TIER 3 - Escalation
  {
    id: VesselId.INDOLENT_3,
    name: "Master Silas Vane",
    subtitle: "The Merchant",
    lore: "Commanding vast streams of the passive masses.",
    type: WorshipperType.INDOLENT,
    baseCost: 50000,
    baseOutput: 1500,
    tier: 3,
    costMultiplier: 1.18,
    isGenerator: true
  },
  {
    id: VesselId.LOWLY_3,
    name: "Erasmus the Silenced",
    subtitle: "The Disgraced Scholar",
    lore: "Converts the aether into structured labor.",
    type: WorshipperType.LOWLY,
    baseCost: 250000,
    baseOutput: 150,
    tier: 3,
    costMultiplier: 1.22,
    baseConsumption: { [WorshipperType.INDOLENT]: 1000 }
  },
  {
    id: VesselId.WORLDLY_3,
    name: "Archduke Malakor",
    subtitle: "The Powerful Duke",
    lore: "A high-tier parasite of the broken scholar caste.",
    type: WorshipperType.WORLDLY,
    baseCost: 2500000,
    baseOutput: 50,
    tier: 3,
    costMultiplier: 1.25,
    baseConsumption: { [WorshipperType.LOWLY]: 1000 }
  },
  {
    id: VesselId.ZEALOUS_3,
    name: "Commander Thraxton",
    subtitle: "The Elite Champion",
    lore: "His dogma consumes the Archduke's influence.",
    type: WorshipperType.ZEALOUS,
    baseCost: 50000000,
    baseOutput: 10,
    tier: 3,
    costMultiplier: 1.30,
    baseConsumption: { [WorshipperType.WORLDLY]: 2500 }
  },

  // TIER 4 - Apex
  {
    id: VesselId.INDOLENT_4,
    name: "Lord Alaric Morn",
    subtitle: "The Noble",
    lore: "The ultimate beacon of Indolent souls.",
    type: WorshipperType.INDOLENT,
    baseCost: 5000000,
    baseOutput: 10000,
    tier: 4,
    costMultiplier: 1.15,
    isGenerator: true
  },
  {
    id: VesselId.LOWLY_4,
    name: "Sir Gawen the Reft",
    subtitle: "The Ruined Knight",
    lore: "A catastrophic consumer of Indolent essence.",
    type: WorshipperType.LOWLY,
    baseCost: 25000000,
    baseOutput: 1000,
    tier: 4,
    costMultiplier: 1.20,
    baseConsumption: { [WorshipperType.INDOLENT]: 10000 }
  },
  {
    id: VesselId.WORLDLY_4,
    name: "High King Osric the Blinded",
    subtitle: "The Deluded King",
    lore: "Rules a kingdom built on Gawen's ruin.",
    type: WorshipperType.WORLDLY,
    baseCost: 250000000,
    baseOutput: 250,
    tier: 4,
    costMultiplier: 1.22,
    baseConsumption: { [WorshipperType.LOWLY]: 5000 }
  },
  {
    id: VesselId.ZEALOUS_4,
    name: "The Icon of Aether",
    subtitle: "The Apex Champion",
    lore: "The final step in the Liturgy.",
    type: WorshipperType.ZEALOUS,
    baseCost: 500000000,
    baseOutput: 50,
    tier: 4,
    costMultiplier: 1.25,
    baseConsumption: { [WorshipperType.WORLDLY]: 10000 }
  }
];

export const GEM_DEFINITIONS: Record<GemType, {
  name: string;
  description: string;
  color: string;
  type: WorshipperType;
  image: string;
}> = {
  [GemType.LAPIS]: {
    name: "Lapis of the Torpid",
    description: "Double Click Output.",
    color: "#60a5fa",
    type: WorshipperType.INDOLENT,
    image: '/img/gems/1.jpeg'
  },
  [GemType.QUARTZ]: {
    name: "Quartz of the Industrious",
    description: "Convert miracles to attract the Lowly (1:1 Ratio).",
    color: "#9ca3af",
    type: WorshipperType.LOWLY,
    image: '/img/gems/2.jpeg'
  },
  [GemType.EMERALD]: {
    name: "Emerald of the Greedy",
    description: "Convert miracles to attract the Worldly (4:1 Ratio).",
    color: "#4ade80",
    type: WorshipperType.WORLDLY,
    image: '/img/gems/3.jpeg'
  },
  [GemType.RUBY]: {
    name: "Ruby of the Fervent",
    description: "Convert miracles to attract the Zealous (10:1 Ratio).",
    color: "#ef4444",
    type: WorshipperType.ZEALOUS,
    image: '/img/gems/4.jpeg'
  }
};

export const GEM_DISCOVERY_FLAVOR = {
  title: "The Abyss Grants a Gift",
  description: "As your shadow stretches across the mortal realm, focus gems crystallize from the void. They can be focused to enhance manual soul collection."
};

export const WORSHIPPER_DETAILS: Record<WorshipperType, { description: string; lore: string }> = {
  [WorshipperType.INDOLENT]: {
    description: "The biomass",
    lore: "Those who have given up on worldly struggle, their souls drifting like autumn leaves in the aether."
  },
  [WorshipperType.LOWLY]: {
    description: "The foundation",
    lore: "Broken by labor yet relentless in their desperation, they fuel the machinery of the cult."
  },
  [WorshipperType.WORLDLY]: {
    description: "The tethers",
    lore: "Ambitious merchants and lords who trade their influence for a seat at the end of the world."
  },
  [WorshipperType.ZEALOUS]: {
    description: "The fury",
    lore: "Fanatics whose fire burns everything it touches, including their own humanity."
  }
};
