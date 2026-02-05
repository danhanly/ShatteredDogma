import { GemType, WorshipperType } from "./types";

export const INITIAL_UPGRADE_COST = 25;
export const COST_MULTIPLIER = 1.15;
export const MILESTONE_INTERVAL = 25;

// Using simple relative path assuming image is in the same directory as index.html
const WORSHIPPER_SPRITE_URL = "worshippers.png";

export const WORSHIPPER_DETAILS: Record<WorshipperType, {
  description: string;
  imageUrl: string;
  position: string;
  lore: string;
}> = {
  [WorshipperType.INDOLENT]: {
    description: "The passive masses.",
    lore: "They drift into the cult seeking easy answers and effortless salvation. They contribute little but their sheer numbers, acting as the raw, metaphysical biomass required to fuel the initial stages of ascension. They are the slumbering fuel for the fire.",
    imageUrl: WORSHIPPER_SPRITE_URL,
    position: "0% 0%" // Top-Left
  },
  [WorshipperType.LOWLY]: {
    description: "The desperate and downtrodden.",
    lore: "Broken by the cruelties of the mortal world, they turn to the Eldritch Truth not out of ambition, but out of necessity. Their suffering has carved out a hollow space within their souls that is easily filled by your dark influence. They are the foundation.",
    imageUrl: WORSHIPPER_SPRITE_URL,
    position: "0% 100%" // Bottom-Left
  },
  [WorshipperType.WORLDLY]: {
    description: "The wealthy and ambitious.",
    lore: "Merchants, nobles, and kings who foolishly believe their earthly assets can purchase divine favor. They seek to harness your power for political gain, unaware that in your eyes, their gold is merely another chain to be broken and repurposed.",
    imageUrl: WORSHIPPER_SPRITE_URL,
    position: "100% 0%" // Top-Right
  },
  [WorshipperType.ZEALOUS]: {
    description: "The fanatical vanguard.",
    lore: "Those who have stared into the abyss and smiled back. They require no coercion, only direction. Their fury is a focused beam of psionic energy, capable of tearing the veil between worlds. They are the apex of your flock, forged from the sacrifice of the lesser.",
    imageUrl: WORSHIPPER_SPRITE_URL,
    position: "100% 100%" // Bottom-Right
  }
};

export const MILESTONE_DEFINITIONS = [
  {
    type: WorshipperType.INDOLENT,
    name: "Awaken the Slumbering",
    description: "The lazy must be roused to fuel the ascension."
  },
  {
    type: WorshipperType.LOWLY,
    name: "Cull the Weak",
    description: "The downtrodden shall form the foundation."
  },
  {
    type: WorshipperType.WORLDLY,
    name: "Seize the Assets",
    description: "Strip the wealthy of their earthly tethers."
  },
  {
    type: WorshipperType.ZEALOUS,
    name: "Channel the Fury",
    description: "Focus the blinding rage of the fanatics."
  }
];

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