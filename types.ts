
export enum WorshipperType {
  WORLDLY = 'Worldly',
  LOWLY = 'Lowly',
  ZEALOUS = 'Zealous',
  INDOLENT = 'Indolent',
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
  tier: number;
}

export enum GemType {
  LAPIS = 'LAPIS',
  QUARTZ = 'QUARTZ',
  EMERALD = 'EMERALD',
  RUBY = 'RUBY'
}

export interface Bulletin {
  id: string;
  volume: number;
  date: string;
  title: string;
  body: string;
  rewardType: string;
  rewardAmount: number;
}

export interface GameState {
  worshippers: Record<WorshipperType, number>;
  totalWorshippers: number;
  totalAccruedWorshippers: number;
  miracleLevel: number;
  vesselLevels: Record<string, number>; // Map VesselId to level
  souls: number;
  
  // Historical stats
  maxTotalWorshippers: number;
  maxWorshippersByType: Record<WorshipperType, number>;
  
  // Flags
  hasSeenEodIntro: boolean;
  hasSeenStartSplash: boolean;
  hasSeenVesselIntro: boolean;
  hasSeenMiracleIntro: boolean;
  hasSeenAbyssIntro: boolean;
  hasSeenLowlyModal: boolean;
  hasSeenWorldlyModal: boolean;
  hasSeenZealousModal: boolean;
  hasSeenPausedModal: boolean;
  hasAcknowledgedPausedModal: boolean;
  hasSeenAssistantIntro: boolean;

  // New features
  lockedWorshippers: WorshipperType[];
  lastInfluenceTime: Record<WorshipperType, number>;

  // Starvation state
  isPaused: Record<WorshipperType, boolean>;
  pausedStartTime: number;
  ignoredHaltVessels: string[]; // Track which vessels have had their starvation warning dismissed

  // Assistant features
  assistantLevel: number;
  totalClicks: number;

  // Gem features
  unlockedGems: GemType[];
  activeGem: GemType | null;
  activeGemTimeRemaining: number; // seconds
  gemCooldowns: Record<GemType, number>; // seconds
  showGemDiscovery: GemType | null;

  // Bulletin features
  activeBulletin: Bulletin | null;

  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    musicVolume: number;
  };
  lastSaveTime: number; 
}

export interface ClickEffect {
  id: number;
  x: number;
  y: number;
  value: number; 
}

export const WORSHIPPER_ORDER = [
  WorshipperType.INDOLENT,
  WorshipperType.LOWLY,
  WorshipperType.WORLDLY,
  WorshipperType.ZEALOUS
];