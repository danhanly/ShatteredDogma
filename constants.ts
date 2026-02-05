import { GemType, WorshipperType, VesselId, VesselDefinition } from "./types";

export const INITIAL_UPGRADE_COST = 25;
export const COST_MULTIPLIER = 1.15;
export const MILESTONE_INTERVAL = 25;
export const VESSEL_COST_MULTIPLIER = 1.25;

export const WORSHIPPER_DETAILS: Record<WorshipperType, {
  description: string;
  lore: string;
}> = {
  [WorshipperType.INDOLENT]: {
    description: "The passive masses.",
    lore: "They drift into the cult seeking easy answers and effortless salvation. They contribute little but their sheer numbers, acting as the raw, metaphysical biomass required to fuel the initial stages of ascension. They are the slumbering fuel for the fire."
  },
  [WorshipperType.LOWLY]: {
    description: "The desperate and downtrodden.",
    lore: "Broken by the cruelties of the mortal world, they turn to the Eldritch Truth not out of ambition, but out of necessity. Their suffering has carved out a hollow space within their souls that is easily filled by your dark influence. They are the foundation."
  },
  [WorshipperType.WORLDLY]: {
    description: "The wealthy and ambitious.",
    lore: "Merchants, nobles, and kings who foolishly believe their earthly assets can purchase divine favor. They seek to harness your power for political gain, unaware that in your eyes, their gold is merely another chain to be broken and repurposed."
  },
  [WorshipperType.ZEALOUS]: {
    description: "The fanatical vanguard.",
    lore: "Those who have stared into the abyss and smiled back. They require no coercion, only direction. Their fury is a focused beam of psionic energy, capable of tearing the veil between worlds. They are the apex of your flock, forged from the sacrifice of the lesser."
  }
};

export const MILESTONE_DEFINITIONS = [
  {
    type: WorshipperType.INDOLENT,
    name: "Awaken the Slumbering",
    description: "The lazy must be roused to fuel the ascension.",
    gemReward: GemType.SLOTH_SAPPHIRE
  },
  {
    type: WorshipperType.LOWLY,
    name: "Cull the Weak",
    description: "The downtrodden shall form the foundation.",
    gemReward: GemType.POOR_MANS_TEAR
  },
  {
    type: WorshipperType.WORLDLY,
    name: "Seize the Assets",
    description: "Strip the wealthy of their earthly tethers.",
    gemReward: GemType.GREED_STONE
  },
  {
    type: WorshipperType.ZEALOUS,
    name: "Channel the Fury",
    description: "Focus the blinding rage of the fanatics.",
    gemReward: GemType.BLOOD_RUBY
  }
];

export const GEM_DISCOVERY_FLAVOR = {
  title: "A Shard of Intent",
  description: "As the milestone reveals itself, a crystalline resonance forms. This 'Focus Gem' allows you to tune your miracles to specific soul frequencies, drawing more of their kind to your call."
};

export const GEM_DEFINITIONS: Record<GemType, { 
  name: string; 
  description: string; 
  favoredType?: WorshipperType;
  color: string;
}> = {
  [GemType.NONE]: {
    name: "Empty Slot",
    description: "No specific influence on worshippers.",
    color: "bg-gray-900 border-gray-700"
  },
  [GemType.GREED_STONE]: {
    name: "Greed Stone",
    description: "Attracts those bound to earthly possessions (Worldly).",
    favoredType: WorshipperType.WORLDLY,
    color: "bg-green-900 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
  },
  [GemType.POOR_MANS_TEAR]: {
    name: "Poor Man's Tear",
    description: "Attracts the downtrodden and meek (Lowly).",
    favoredType: WorshipperType.LOWLY,
    color: "bg-gray-700 border-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.3)]"
  },
  [GemType.BLOOD_RUBY]: {
    name: "Blood Ruby",
    description: "Attracts the fanatical and aggressive (Zealous).",
    favoredType: WorshipperType.ZEALOUS,
    color: "bg-red-900 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
  },
  [GemType.SLOTH_SAPPHIRE]: {
    name: "Sloth Sapphire",
    description: "Attracts the lazy and passive (Indolent).",
    favoredType: WorshipperType.INDOLENT,
    color: "bg-blue-900 border-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.3)]"
  }
};

export const GEM_DISPLAY_ORDER = [
  GemType.SLOTH_SAPPHIRE, // Indolent
  GemType.POOR_MANS_TEAR, // Lowly
  GemType.GREED_STONE,    // Worldly
  GemType.BLOOD_RUBY      // Zealous
];

export const VESSEL_DEFINITIONS: VesselDefinition[] = [
  // TIER 1
  {
    id: VesselId.INDOLENT_1,
    name: "Mudge the Slumbering",
    subtitle: "The Drifter",
    lore: "Mudge has forgotten the sound of his own voice. Years of scavenging in the city’s gutters have left him with a soul so thin it barely anchors his body to the earth. He does not dream of the Great Beyond; he simply exists as a slow-burning ember, providing the cult with just enough warmth to begin the ritual.",
    type: WorshipperType.INDOLENT,
    baseCost: 15,
    baseOutput: 1
  },
  {
    id: VesselId.LOWLY_1,
    name: "Little Pip, the Empty",
    subtitle: "The Destitute",
    lore: "Pip died of hunger in a doorway three days before the cult found him; it just took a while for his body to realize it. The cult’s energy has stepped into the space where his childhood should have been. He is a quiet, haunting battery, his small frame vibrating with a power that tastes of cold iron and tears.",
    type: WorshipperType.LOWLY,
    baseCost: 100,
    baseOutput: 4
  },
  {
    id: VesselId.WORLDLY_1,
    name: "Caspian Gold-Tongue",
    subtitle: "The Cunning Merchant",
    lore: "Caspian prides himself on knowing the price of everything. He sees the eldritch mist as a new currency—a volatile asset he can trade for influence. He wears the coiling energy like a fine silk shawl, never noticing that the mist is slowly tightening its grip around his throat.",
    type: WorshipperType.WORLDLY,
    baseCost: 500,
    baseOutput: 12
  },
  {
    id: VesselId.ZEALOUS_1,
    name: "Kaleb the Fevered",
    subtitle: "The Fanatic Cultist",
    lore: "Kaleb doesn't sleep; he only trembles. His devotion is so intense it has begun to cook his mind, manifesting as a jittery, pale psionic aura. He is the first to charge, his simple dagger vibrating with a frequency that can cut through the fabric of a man’s sanity.",
    type: WorshipperType.ZEALOUS,
    baseCost: 2000,
    baseOutput: 40
  },

  // TIER 2
  {
    id: VesselId.INDOLENT_2,
    name: "Haman of the Heavy Breath",
    subtitle: "The Labourer",
    lore: "For decades, Haman moved the stones that built the city's cathedrals. Now, his lungs are filled with dust and his will is spent. He has stopped fighting the encroaching mist, finding it a lighter burden than the pickaxe. He is a sturdy vessel, his thick frame holding a steady, low-grade hum of harvested energy.",
    type: WorshipperType.INDOLENT,
    baseCost: 5000,
    baseOutput: 80
  },
  {
    id: VesselId.LOWLY_2,
    name: "Kaelen the Unmade",
    subtitle: "The Broken Worker",
    lore: "Kaelen was a man of iron until the day the mine collapsed, taking his legs and his hope. The despair that followed was so profound it became a physical weight. The cult does not heal him; they simply fill the cracks in his broken psyche with dark essence, turning his misery into a beacon for the Void.",
    type: WorshipperType.LOWLY,
    baseCost: 15000,
    baseOutput: 200
  },
  {
    id: VesselId.WORLDLY_2,
    name: "Baron Valerius Thorne",
    subtitle: "The Ambitious Lord",
    lore: "The Baron is obsessed with the \"Thorne\" name surviving the coming dark. He has used the cult's influence to purge his rivals and secure his borders. He clutches his lineage scrolls with white-knuckled fervor, oblivious to the fact that the energy wrapping around them is erasing the ink of his ancestors.",
    type: WorshipperType.WORLDLY,
    baseCost: 40000,
    baseOutput: 450
  },
  {
    id: VesselId.ZEALOUS_2,
    name: "Varkas the Spiked",
    subtitle: "The Zealot Warrior",
    lore: "Varkas has driven iron spikes into his own flesh to ensure he never knows a moment’s peace from his devotion. His mace is a focus for his hatred, wreathed in a psionic fire that hums like a hornet’s nest. He is the cult’s blunt instrument, a soldier of the \"True Will.\"",
    type: WorshipperType.ZEALOUS,
    baseCost: 100000,
    baseOutput: 1000
  },

  // TIER 3
  {
    id: VesselId.INDOLENT_3,
    name: "Master Silas Vane",
    subtitle: "The Merchant",
    lore: "Silas once believed that a full belly and a locked vault were the only shields a man needed. When the cult came, he tried to bribe the shadows. Now he sits in his velvet chair, remarkably well-preserved, but his wealth has become the \"biomass\" that feeds the furnace—a rich, marbeled source of fuel for the higher rites.",
    type: WorshipperType.INDOLENT,
    baseCost: 250000,
    baseOutput: 2500
  },
  {
    id: VesselId.LOWLY_3,
    name: "Erasmus the Silenced",
    subtitle: "The Disgraced Scholar",
    lore: "Erasmus spent forty years translating the Liturgy of Screams only to realize that words are useless. He burned his library and tore out his own tongue to make room for the \"True Language.\" He is no longer a scholar; he is a living inkwell, his intellectual vacuum drawing in massive currents of dark energy.",
    type: WorshipperType.LOWLY,
    baseCost: 600000,
    baseOutput: 5000
  },
  {
    id: VesselId.WORLDLY_3,
    name: "Archduke Malakor",
    subtitle: "The Powerful Duke",
    lore: "Malakor believes he is the architect of a new world order. From his high throne, he \"commands\" the swirling clouds of power, using the orb of his office to direct the flow. In reality, the orb is a drain, and he is the plug holding back a sea of madness that will eventually swallow his duchy whole.",
    type: WorshipperType.WORLDLY,
    baseCost: 1500000,
    baseOutput: 12000
  },
  {
    id: VesselId.ZEALOUS_3,
    name: "Commander Thraxton",
    subtitle: "The Elite Champion",
    lore: "Thraxton was once a general of the royal army, but he found the limits of mortal steel too restrictive. Now encased in plate that shouldn't be able to stand, he carries a sword that bleeds reality. The rift behind him is a window into the mind of his god, and he is its grim gatekeeper.",
    type: WorshipperType.ZEALOUS,
    baseCost: 4000000,
    baseOutput: 35000
  },

  // TIER 4
  {
    id: VesselId.INDOLENT_4,
    name: "Lord Alaric Morn",
    subtitle: "The Noble",
    lore: "The Morn lineage was old when the capital was founded, but Alaric is the last of his blood. He has traded his family’s history for a seat at the end of the world. Too frail to lead, he is now a living reliquary, his noble blood acting as a high-conductive fluid for a dense, glowing cloud of eldritch power.",
    type: WorshipperType.INDOLENT,
    baseCost: 10000000,
    baseOutput: 80000
  },
  {
    id: VesselId.LOWLY_4,
    name: "Sir Gawen the Reft",
    subtitle: "The Ruined Knight",
    lore: "A knight without a quest is a dangerous thing. After failing to protect his manor from the very horrors he now serves, Gawen’s spirit shattered. He remains in his armor not for protection, but because there is nothing left inside to hold his shape. He is a hollow pipe through which the cult’s most violent energies roar.",
    type: WorshipperType.LOWLY,
    baseCost: 25000000,
    baseOutput: 180000
  },
  {
    id: VesselId.WORLDLY_4,
    name: "High King Osric the Blinded",
    subtitle: "The Deluded King",
    lore: "Osric is the ultimate cautionary tale. He believes his crown was gifted by the gods to rule the stars themselves. He stands at the center of a massive vortex, his sword raised in a silent, eternal command. He feels invincible, never realizing he is the lightning rod for a storm that intends to use his kingdom as a landing site.",
    type: WorshipperType.WORLDLY,
    baseCost: 75000000,
    baseOutput: 500000
  },
  {
    id: VesselId.ZEALOUS_4,
    name: "The Icon of Aether",
    subtitle: "The Apex Champion",
    lore: "This being has no memories of a mother or a home. It is a creature of pure, geometric light and psionic pressure. It walks the earth as a hole in the universe, a living torrent of power that has transcended the need for a name. To look upon the Icon is to see the cult’s final victory made manifest.",
    type: WorshipperType.ZEALOUS,
    baseCost: 250000000,
    baseOutput: 2000000
  }
];