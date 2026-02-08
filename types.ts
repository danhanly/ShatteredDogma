
export enum WorshipperType {
  WORLDLY = 'Worldly',
  LOWLY = 'Lowly',
  ZEALOUS = 'Zealous',
  INDOLENT = 'Indolent',
}

export type IncrementType = 1 | 5 | 10 | 25 | 100 | 'MAX';

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
  GLUTTONY = 'Relic_Consumption_Reduct',
  BETRAYAL = 'Relic_Cooldown_Reduct',
  FALSE_IDOL = 'Relic_Unlock_Bypass',
  CONTRACT = 'Relic_Auto_Buff',
}

export interface RelicDefinition {
  id: RelicId;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
}

export interface RelicDefinition {
  id: RelicId;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
}

export interface VesselDefinition {
  id: VesselId;
  name: string;
  subtitle: string;
  lore: string;
  type: WorshipperType;
  baseCost: number;
  baseOutput: number;
  tier: number;
  isGenerator?: boolean; // T-A vessels are generators, others are parasites
}

export enum GemType {
  LAPIS = 'LAPIS',
  QUARTZ = 'QUARTZ',
  EMERALD = 'EMERALD',
  RUBY = 'RUBY'
}

export interface GameState {
  worshippers: Record<WorshipperType, number>;
  totalWorshippers: number;
  totalAccruedWorshippers: number;
  miracleLevel: number;
  vesselLevels: Record<string, number>;
  vesselToggles: Record<string, boolean>; // Imprisonment/Toggles
  souls: number;
  relics: Record<RelicId, number>;
  
  maxTotalWorshippers: number;
  maxWorshippersByType: Record<WorshipperType, number>;
  
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

  lockedWorshippers: WorshipperType[];
  lastInfluenceTime: Record<WorshipperType, number>;

  isPaused: Record<WorshipperType, boolean>;
  pausedStartTime: number;
  ignoredHaltVessels: string[];

  assistantLevel: number;
  assistantActive: boolean;
  totalClicks: number;

  unlockedGems: GemType[];
  activeGem: GemType | null;
  activeGemTimeRemaining: number;
  gemCooldowns: Record<GemType, number>;
  showGemDiscovery: GemType | null;

  activeBulletin: any | null;

  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    musicVolume: number;
  };
  lastSaveTime: number; 

  // Increment memory
  miracleIncrement: IncrementType;
  vesselIncrement: IncrementType;

  // Starvation tracking
  vesselStarvationTimers: Record<string, number>;
}

export interface ClickEffect {
  id: number;
  x: number;
  y: number;
  value: number;
  type: WorshipperType;
}

export const WORSHIPPER_ORDER = [
  WorshipperType.INDOLENT,
  WorshipperType.LOWLY,
  WorshipperType.WORLDLY,
  WorshipperType.ZEALOUS
];
