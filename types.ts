

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
  VOID_CATALYST = 'Relic_Gem_Consumption', 
  ABYSSAL_REFLEX = 'Relic_Gem_Refresh',
  FRENZY = 'Relic_Frenzy_Mode',
  REBELLION = 'Relic_Caste_Rebellion',
  SOUL_HARVESTER = 'Relic_Soul_Acquisition',
}

export type FateId = 
  | 'click_power'
  | 'indolent_output'
  | 'lowly_output'
  | 'worldly_output'
  | 'zealous_output'
  | 'lowly_cons'
  | 'worldly_cons'
  | 'zealous_cons'
  | 'gem_cooldown'
  | 'gem_power'
  | 'mattelock_power'
  | 'miracle_cost'
  | 'indolent_cost'
  | 'lowly_cost'
  | 'worldly_cost'
  | 'zealous_cost';

export interface FateDefinition {
  id: FateId;
  label: string;
  bonus: number;
  suffix: string;
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
  costMultiplier: number;
  isGenerator?: boolean; 
  baseConsumption?: Partial<Record<WorshipperType, number>>;
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
  vesselToggles: Record<string, boolean>; 
  souls: number;
  relics: Record<RelicId, number>;
  fates: Record<FateId, number>; 
  fatePurchases: number; 
  lastPurchasedFateId: FateId | null;
  lastPurchasedFateTime: number;
  lastPurchasedRelicId: RelicId | null;
  lastPurchasedRelicTime: number;
  
  maxTotalWorshippers: number;
  maxWorshippersByType: Record<WorshipperType, number>;
  
  hasUnlockedEndTimes: boolean;
  hasSeenEodIntro: boolean;
  hasSeenStartSplash: boolean;
  hasSeenVesselIntro: boolean;
  hasSeenMiracleIntro: boolean;
  hasSeenAbyssIntro: boolean;
  hasSeenLowlyModal: boolean;
  hasSeenWorldlyModal: boolean;
  hasSeenZealousModal: boolean;
  hasSeenPausedModal: boolean;
  hasSeenNetNegative: boolean; 
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
  manualClicks: number;
  mattelockClicks: number;

  unlockedGems: GemType[];
  activeGem: GemType | null;
  activeGemTimeRemaining: number;
  gemCooldowns: Record<GemType, number>;
  showGemDiscovery: GemType | null;
  highlightGem: GemType | null;

  frenzyTimeRemaining: number;
  rebellionTimeRemaining: number;
  rebelCaste: WorshipperType | null;

  activeBulletin: any | null;

  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    musicVolume: number;
  };
  lastSaveTime: number; 

  miracleIncrement: IncrementType;
  vesselIncrement: IncrementType;

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
