

import { WorshipperType, VesselId, VesselDefinition, GemType } from "./types";

export const INITIAL_UPGRADE_COST = 25;
export const COST_MULTIPLIER = 1.15;

export const PRESTIGE_UNLOCK_THRESHOLD = 100000;

// Consumption Rates (Per worshipper per second)
export const CONSUMPTION_RATES: Record<WorshipperType, Partial<Record<WorshipperType, number>>> = {
  [WorshipperType.INDOLENT]: {},
  [WorshipperType.LOWLY]: {
    [WorshipperType.INDOLENT]: 3
  },
  [WorshipperType.WORLDLY]: {
    [WorshipperType.LOWLY]: 5
  },
  [WorshipperType.ZEALOUS]: {
    [WorshipperType.LOWLY]: 3,
    [WorshipperType.WORLDLY]: 3
  }
};

export const WORSHIPPER_DETAILS: Record<WorshipperType, {
  description: string;
  lore: string;
}> = {
  [WorshipperType.INDOLENT]: {
    description: "The passive masses.",
    lore: "They drift into the cult seeking easy answers and effortless salvation. They contribute little but their sheer numbers, acting as the raw, metaphysical biomass required to fuel the initial stages of ascension."
  },
  [WorshipperType.LOWLY]: {
    description: "The desperate and downtrodden.",
    lore: "Broken by the cruelties of the mortal world, they turn to the Eldritch Truth not out of ambition, but out of necessity. Their suffering has carved out a hollow space within their souls that is easily filled by your dark influence."
  },
  [WorshipperType.WORLDLY]: {
    description: "The wealthy and ambitious.",
    lore: "Merchants, nobles, and kings who foolishly believe their earthly assets can purchase divine favor. They seek to harness your power for political gain, unaware that in your eyes, their gold is merely another chain."
  },
  [WorshipperType.ZEALOUS]: {
    description: "The fanatical vanguard.",
    lore: "Those who have stared into the abyss and smiled back. They require no coercion, only direction. Their fury is a focused beam of psionic energy, capable of tearing the veil between worlds."
  }
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
    description: "Attuning to this Lapis makes your miracles burn ever brighter for the Indolent",
    color: "#60a5fa",
    type: WorshipperType.INDOLENT,
    image: './public/gems/1.jpg'
  },
  [GemType.QUARTZ]: {
    name: "Quartz of the Industrious",
    description: "Attuning to this Quartz allows your miracles to be seen by the Lowly",
    color: "#9ca3af",
    type: WorshipperType.LOWLY,
    image: './public/gems/2.jpg'
  },
  [GemType.EMERALD]: {
    name: "Emerald of the Greedy",
    description: "Attuning to this Emerald allows your miracles to be seen by the Worldly",
    color: "#4ade80",
    type: WorshipperType.WORLDLY,
    image: './public/gems/3.jpg'
  },
  [GemType.RUBY]: {
    name: "Ruby of the Fervent",
    description: "Attuning to this Ruby allows your miracles to be seen by the Zealous",
    color: "#ef4444",
    type: WorshipperType.ZEALOUS,
    image: './public/gems/4.jpg'
  }
};

export const GEM_DISCOVERY_FLAVOR = {
  title: "The Abyss Grants a Gift",
  description: "As your shadow stretches across the mortal realm, the very fabric of the void crystallizes. These focus gems allow you to channel your miracles with terrifying precision."
};

export const VESSEL_DEFINITIONS: VesselDefinition[] = [
  // TIER 1
  {
    id: VesselId.INDOLENT_1,
    name: "Mudge the Slumbering",
    subtitle: "The Drifter",
    lore: "Mudge has forgotten the sound of his own voice. Years of scavenging in the city’s gutters have left him with a soul so thin it barely anchors his body to the earth.",
    type: WorshipperType.INDOLENT,
    baseCost: 100,
    baseOutput: 15,
    tier: 1
  },
  {
    id: VesselId.LOWLY_1,
    name: "Little Pip, the Empty",
    subtitle: "The Destitute",
    lore: "Pip died of hunger in a doorway three days before the cult found him; it just took a while for his body to realize it.",
    type: WorshipperType.LOWLY,
    baseCost: 250,
    baseOutput: 15,
    tier: 1
  },
  {
    id: VesselId.WORLDLY_1,
    name: "Caspian Gold-Tongue",
    subtitle: "The Cunning Merchant",
    lore: "Caspian prides himself on knowing the price of everything. He sees the eldritch mist as a new currency—a volatile asset he can trade for influence.",
    type: WorshipperType.WORLDLY,
    baseCost: 500,
    baseOutput: 15,
    tier: 1
  },
  {
    id: VesselId.ZEALOUS_1,
    name: "Kaleb the Fevered",
    subtitle: "The Fanatic Cultist",
    lore: "Kaleb doesn't sleep; he only trembles. His devotion is so intense it has begun to cook his mind, manifesting as a jittery, pale psionic aura.",
    type: WorshipperType.ZEALOUS,
    baseCost: 2000,
    baseOutput: 15,
    tier: 1
  },

  // TIER 2
  {
    id: VesselId.INDOLENT_2,
    name: "Haman of the Heavy Breath",
    subtitle: "The Labourer",
    lore: "For decades, Haman moved the stones that built the city's cathedrals. Now, his lungs are filled with dust and his will is spent.",
    type: WorshipperType.INDOLENT,
    baseCost: 5000,
    baseOutput: 400,
    tier: 2
  },
  {
    id: VesselId.LOWLY_2,
    name: "Kaelen the Unmade",
    subtitle: "The Broken Worker",
    lore: "Kaelen was a man of iron until the day the mine collapsed, taking his legs and his hope.",
    type: WorshipperType.LOWLY,
    baseCost: 15000,
    baseOutput: 400,
    tier: 2
  },
  {
    id: VesselId.WORLDLY_2,
    name: "Baron Valerius Thorne",
    subtitle: "The Ambitious Lord",
    lore: "The Baron is obsessed with the \"Thorne\" name surviving the coming dark. He has used the cult's influence to purge his rivals.",
    type: WorshipperType.WORLDLY,
    baseCost: 40000,
    baseOutput: 400,
    tier: 2
  },
  {
    id: VesselId.ZEALOUS_2,
    name: "Varkas the Spiked",
    subtitle: "The Zealot Warrior",
    lore: "Varkas has driven iron spikes into his own flesh to ensure he never knows a moment’s peace from his devotion.",
    type: WorshipperType.ZEALOUS,
    baseCost: 100000,
    baseOutput: 400,
    tier: 2
  },

  // TIER 3
  {
    id: VesselId.INDOLENT_3,
    name: "Master Silas Vane",
    subtitle: "The Merchant",
    lore: "Silas once believed that a full belly and a locked vault were the only shields a man needed.",
    type: WorshipperType.INDOLENT,
    baseCost: 250000,
    baseOutput: 12000,
    tier: 3
  },
  {
    id: VesselId.LOWLY_3,
    name: "Erasmus the Silenced",
    subtitle: "The Disgraced Scholar",
    lore: "Erasmus spent forty years translating the Liturgy of Screams only to realize that words are useless. He burned his library.",
    type: WorshipperType.LOWLY,
    baseCost: 600000,
    baseOutput: 12000,
    tier: 3
  },
  {
    id: VesselId.WORLDLY_3,
    name: "Archduke Malakor",
    subtitle: "The Powerful Duke",
    lore: "Malakor believes he is the architect of a new world order. From his high throne, he \"commands\" the swirling clouds of power.",
    type: WorshipperType.WORLDLY,
    baseCost: 1500000,
    baseOutput: 12000,
    tier: 3
  },
  {
    id: VesselId.ZEALOUS_3,
    name: "Commander Thraxton",
    subtitle: "The Elite Champion",
    lore: "Thraxton was once a general of the royal army, but he found the limits of mortal steel too restrictive.",
    type: WorshipperType.ZEALOUS,
    baseCost: 4000000,
    baseOutput: 12000,
    tier: 3
  },

  // TIER 4
  {
    id: VesselId.INDOLENT_4,
    name: "Lord Alaric Morn",
    subtitle: "The Noble",
    lore: "The Morn lineage was old when the capital was founded, but Alaric is the last of his blood.",
    type: WorshipperType.INDOLENT,
    baseCost: 10000000,
    baseOutput: 500000,
    tier: 4
  },
  {
    id: VesselId.LOWLY_4,
    name: "Sir Gawen the Reft",
    subtitle: "The Ruined Knight",
    lore: "A knight without a quest is a dangerous thing. Gawen’s spirit shattered after failing to protect his manor.",
    type: WorshipperType.LOWLY,
    baseCost: 25000000,
    baseOutput: 500000,
    tier: 4
  },
  {
    id: VesselId.WORLDLY_4,
    name: "High King Osric the Blinded",
    subtitle: "The Deluded King",
    lore: "Osric is the ultimate cautionary tale. He believes his crown was gifted by the gods to rule the stars themselves.",
    type: WorshipperType.WORLDLY,
    baseCost: 75000000,
    baseOutput: 500000,
    tier: 4
  },
  {
    id: VesselId.ZEALOUS_4,
    name: "The Icon of Aether",
    subtitle: "The Apex Champion",
    lore: "This being has no memories of a mother or a home. It is a creature of pure, geometric light and psionic pressure.",
    type: WorshipperType.ZEALOUS,
    baseCost: 250000000,
    baseOutput: 500000,
    tier: 4
  }
];
