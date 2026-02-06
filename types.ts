
export enum WorshipperType {
  WORLDLY = 'Worldly',
  LOWLY = 'Lowly',
  ZEALOUS = 'Zealous',
  INDOLENT = 'Indolent',
}

export enum GemType {
  NONE = 'None',
  GREED_STONE = 'Greed Stone',       // Favors Worldly
  POOR_MANS_TEAR = 'Poor Man\'s Tear', // Favors Lowly
  BLOOD_RUBY = 'Blood Ruby',         // Favors Zealous
  SLOTH_SAPPHIRE = 'Sloth Sapphire', // Favors Indolent
}

export enum VesselId {
  INDOLENT_1 = 'INDOLENT_1',
  LOWLY_1 = 'LOWLY_1',
  WORLDLY_1 = 'WORLDLY_1',
  ZEALOUS_1 = 'ZEALOUS_1',
  
  INDOLENT_2 = 'INDOLENT_2',
  LOWLY_2 = 'LOWLY_2',
  WORLDLY_2 = 'WORLDLY_2',
  ZEALOUS_2 = 'ZEALOUS_2',

  INDOLENT_3 = 'INDOLENT_3',
  LOWLY_3 = 'LOWLY_3',
  WORLDLY_3 = 'WORLDLY_3',
  ZEALOUS_3 = 'ZEALOUS_3',

  INDOLENT_4 = 'INDOLENT_4',
  LOWLY_4 = 'LOWLY_4',
  WORLDLY_4 = 'WORLDLY_4',
  ZEALOUS_4 = 'ZEALOUS_4',
}

export enum RelicId {
  MIRACLE_BOOST = 'MIRACLE_BOOST',
  INDOLENT_BOOST = 'INDOLENT_BOOST',
  LOWLY_BOOST = 'LOWLY_BOOST',
  WORLDLY_BOOST = 'WORLDLY_BOOST',
  ZEALOUS_BOOST = 'ZEALOUS_BOOST',
  ALL_VESSEL_BOOST = 'ALL_VESSEL_BOOST',
  OFFLINE_BOOST = 'OFFLINE_BOOST',
  GEM_BOOST = 'GEM_BOOST',
  INFLUENCE_INDOLENT = 'INFLUENCE_INDOLENT',
  INFLUENCE_LOWLY = 'INFLUENCE_LOWLY',
  INFLUENCE_WORLDLY = 'INFLUENCE_WORLDLY',
}

export interface VesselDefinition {
  id: VesselId;
  name: string;
  subtitle: string;
  lore: string;
  type: WorshipperType;
  baseCost: number;
  baseOutput: number; // Worshippers per second
  tier: number;
}

export interface RelicDefinition {
  id: RelicId;
  name: string;
  description: string;
  baseCost: number;
}

export interface GameState {
  worshippers: Record<WorshipperType, number>;
  totalWorshippers: number;
  totalAccruedWorshippers: number; // New variable for lifetime worshippers (this run)
  lockedWorshippers: WorshipperType[]; 
  miracleLevel: number;
  vesselLevels: Record<string, number>; // Map VesselId to level
  equippedGem: GemType;
  unlockedGems: GemType[];
  showGemDiscovery: GemType | null;
  souls: number;
  relicLevels: Record<string, number>; // Map RelicId to level
  
  // Influence Mechanics
  influenceUsage: Record<WorshipperType, number>; // Tracks how many times influence was used per type
  lastInfluenceTime: Record<WorshipperType, number>; // Timestamp of last influence usage for VFX

  // Historical stats
  maxTotalWorshippers: number;
  maxWorshippersByType: Record<WorshipperType, number>;
  
  // Flags
  hasSeenEodIntro: boolean;
  hasSeenStartSplash: boolean;
  hasSeenVesselIntro: boolean;
  hasSeenAbyssIntro: boolean;

  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    musicVolume: number;
  };
  lastSaveTime: number; // Timestamp
}

export interface ClickEffect {
  id: number;
  x: number;
  y: number;
  value: number; // How many worshippers gained
}

export const WORSHIPPER_ORDER = [
  WorshipperType.INDOLENT,
  WorshipperType.LOWLY,
  WorshipperType.WORLDLY,
  WorshipperType.ZEALOUS
];
