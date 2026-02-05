
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

export interface VesselDefinition {
  id: VesselId;
  name: string;
  subtitle: string;
  lore: string;
  type: WorshipperType;
  baseCost: number;
  baseOutput: number; // Worshippers per second
}

export interface GameState {
  worshippers: Record<WorshipperType, number>;
  totalWorshippers: number;
  miracleLevel: number;
  vesselLevels: Record<string, number>; // Map VesselId to level
  equippedGem: GemType;
  unlockedGems: GemType[];
  showGemDiscovery: GemType | null;
  settings: {
    soundEnabled: boolean;
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