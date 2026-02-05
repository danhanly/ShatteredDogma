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

export interface GameState {
  worshippers: Record<WorshipperType, number>;
  totalWorshippers: number;
  miracleLevel: number;
  equippedGem: GemType;
  settings: {
    soundEnabled: boolean;
  };
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