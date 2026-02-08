
import { WorshipperType, VesselId, VesselDefinition, GemType, RelicId, RelicDefinition } from "./types";

export const INITIAL_UPGRADE_COST = 50; // Technical Report: 50 * (1.5 ^ Level)
export const COST_MULTIPLIER = 1.5;

export const PRESTIGE_UNLOCK_THRESHOLD = 1; // Trigger: 1 Zealous

export const RELIC_DEFINITIONS: RelicDefinition[] = [
  {
    id: RelicId.GLUTTONY,
    name: "Chalice of Gluttony",
    description: "Reduces the consumption requirements of all vessels by 5% per level.",
    maxLevel: 10,
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
    id: RelicId.FALSE_IDOL,
    name: "The False Idol",
    description: "Unlocks New Game+ visibility: all vessel tiers are visible from the start.",
    maxLevel: 1,
    baseCost: 500
  },
  {
    id: RelicId.CONTRACT,
    name: "Mattelock’s Contract",
    description: "Mattelock gains +25% efficiency per level.",
    maxLevel: 10,
    baseCost: 50
  }
];

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
    isGenerator: true
  },
  {
    id: VesselId.LOWLY_1,
    name: "Little Pip, the Empty",
    subtitle: "The Destitute",
    lore: "Pip consumes the lazy energy of the Indolent to fuel his tireless work.",
    type: WorshipperType.LOWLY,
    baseCost: 150,
    baseOutput: 2,
    tier: 1
  },
  {
    id: VesselId.WORLDLY_1,
    name: "Caspian Gold-Tongue",
    subtitle: "The Cunning Merchant",
    lore: "Caspian trades the labor of the Lowly for influence.",
    type: WorshipperType.WORLDLY,
    baseCost: 5000,
    baseOutput: 2,
    tier: 1
  },
  {
    id: VesselId.ZEALOUS_1,
    name: "Kaleb the Fevered",
    subtitle: "The Fanatic Cultist",
    lore: "Kaleb burns worldly assets to fuel spiritual fire.",
    type: WorshipperType.ZEALOUS,
    baseCost: 100000,
    baseOutput: 1,
    tier: 1
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
    tier: 2
  },
  {
    id: VesselId.WORLDLY_2,
    name: "Baron Valerius Thorne",
    subtitle: "The Ambitious Lord",
    lore: "Exploits the Lowly with industrial efficiency.",
    type: WorshipperType.WORLDLY,
    baseCost: 500000,
    baseOutput: 25,
    tier: 2
  },
  {
    id: VesselId.ZEALOUS_2,
    name: "Varkas the Spiked",
    subtitle: "The Zealot Warrior",
    lore: "His pain fuels a greater conversion of worldly greed.",
    type: WorshipperType.ZEALOUS,
    baseCost: 5000000,
    baseOutput: 5,
    tier: 2
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
    tier: 3
  },
  {
    id: VesselId.WORLDLY_3,
    name: "Archduke Malakor",
    subtitle: "The Powerful Duke",
    lore: "A high-tier parasite of the broken scholar caste.",
    type: WorshipperType.WORLDLY,
    baseCost: 2500000,
    baseOutput: 50,
    tier: 3
  },
  {
    id: VesselId.ZEALOUS_3,
    name: "Commander Thraxton",
    subtitle: "The Elite Champion",
    lore: "His dogma consumes the Archduke's influence.",
    type: WorshipperType.ZEALOUS,
    baseCost: 50000000,
    baseOutput: 10,
    tier: 3
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
    tier: 4
  },
  {
    id: VesselId.WORLDLY_4,
    name: "High King Osric the Blinded",
    subtitle: "The Deluded King",
    lore: "Rules a kingdom built on Gawen's ruin.",
    type: WorshipperType.WORLDLY,
    baseCost: 250000000,
    baseOutput: 250,
    tier: 4
  },
  {
    id: VesselId.ZEALOUS_4,
    name: "The Icon of Aether",
    subtitle: "The Apex Champion",
    lore: "The final step in the Liturgy.",
    type: WorshipperType.ZEALOUS,
    baseCost: 500000000,
    baseOutput: 50,
    tier: 4
  }
];

// Technical Report: Integer Consumption Rates
export const CONSUMPTION_RATES_PER_LVL: Record<VesselId, Partial<Record<WorshipperType, number>>> = {
  [VesselId.INDOLENT_1]: {},
  [VesselId.LOWLY_1]: { [WorshipperType.INDOLENT]: 20 },
  [VesselId.WORLDLY_1]: { [WorshipperType.LOWLY]: 50 },
  [VesselId.ZEALOUS_1]: { [WorshipperType.WORLDLY]: 100 },
  
  [VesselId.INDOLENT_2]: {},
  [VesselId.LOWLY_2]: { [WorshipperType.INDOLENT]: 250 },
  [VesselId.WORLDLY_2]: { [WorshipperType.LOWLY]: 500 },
  [VesselId.ZEALOUS_2]: { [WorshipperType.WORLDLY]: 500 },

  [VesselId.INDOLENT_3]: {},
  [VesselId.LOWLY_3]: { [WorshipperType.INDOLENT]: 1000 },
  [VesselId.WORLDLY_3]: { [WorshipperType.LOWLY]: 1000 },
  [VesselId.ZEALOUS_3]: { [WorshipperType.WORLDLY]: 2500 },

  [VesselId.INDOLENT_4]: {},
  [VesselId.LOWLY_4]: { [WorshipperType.INDOLENT]: 10000 },
  [VesselId.WORLDLY_4]: { [WorshipperType.LOWLY]: 5000 },
  [VesselId.ZEALOUS_4]: { [WorshipperType.WORLDLY]: 10000 },
};

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
    image: './public/gems/1.jpg'
  },
  [GemType.QUARTZ]: {
    name: "Quartz of the Industrious",
    description: "Convert miracles to attract the Lowly (1:1 Ratio).",
    color: "#9ca3af",
    type: WorshipperType.LOWLY,
    image: './public/gems/2.jpg'
  },
  [GemType.EMERALD]: {
    name: "Emerald of the Greedy",
    description: "Convert miracles to attract the Worldly (4:1 Ratio).",
    color: "#4ade80",
    type: WorshipperType.WORLDLY,
    image: './public/gems/3.jpg'
  },
  [GemType.RUBY]: {
    name: "Ruby of the Fervent",
    description: "Convert miracles to attract the Zealous (10:1 Ratio).",
    color: "#ef4444",
    type: WorshipperType.ZEALOUS,
    image: './public/gems/4.jpg'
  }
};

export const GEM_DISCOVERY_FLAVOR = {
  title: "The Abyss Grants a Gift",
  description: "As your shadow stretches across the mortal realm, focus gems crystallize from the void. They reduce consumption of their caste while active."
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
