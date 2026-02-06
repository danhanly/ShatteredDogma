
import { GemType, WorshipperType, VesselId, VesselDefinition, RelicId, RelicDefinition } from "./types";

export const INITIAL_UPGRADE_COST = 25;
export const COST_MULTIPLIER = 1.15;
export const MILESTONE_INTERVAL = 25;

export const PRESTIGE_UNLOCK_THRESHOLD = 1000000;

export const MILESTONE_MULTIPLIERS: Record<WorshipperType, number> = {
  [WorshipperType.INDOLENT]: 5,
  [WorshipperType.LOWLY]: 2.5,
  [WorshipperType.WORLDLY]: 1.75,
  [WorshipperType.ZEALOUS]: 1.25,
};

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

export const BULLETIN_STORIES: Record<WorshipperType, { title: string; body: string }[]> = {
  [WorshipperType.INDOLENT]: [
    { title: "CITY SQUARE CROWDS 'JUST STANDING THERE'", body: "Authorities are baffled as hundreds of citizens have gathered in the market square, reportedly doing absolutely nothing. 'They just stare at the sky,' says one guard. 'It's easier than working,' claims another." },
    { title: "MASS LETHARGY SWEEPS DOCKS", body: "Work at the shipyards has ground to a halt. The foremen report that laborers have simply laid down their tools, muttering about 'the sweet embrace of the void'. Productivity is at an all-time low." },
    { title: "SLEEPING SICKNESS OR DIVINE NAP?", body: "Doctors are investigating a strange phenomenon where entire households are refusing to leave their beds. No fever is present, only a profound lack of desire to participate in reality." }
  ],
  [WorshipperType.LOWLY]: [
    { title: "ORPHANAGE OVERFLOW SPILLS INTO STREETS", body: "The recent famine has left thousands destitute. They wander the alleyways, hollow-eyed and hungry, whispering of a new god who demands nothing but their emptiness." },
    { title: "BEGGARS GUILD DISSOLVES", body: "The Organized Union of Beggars has disbanded. Its members were last seen marching en masse towards the undercity, claiming they have found a 'True Purpose' in their suffering." },
    { title: "WORKHOUSES EMPTY OVERNIGHT", body: "Industrial district owners are in an uproar as their workforce vanished under the cover of fog. Notes left behind simply read: 'The machine is broken. We go to the one who fixes.'" }
  ],
  [WorshipperType.WORLDLY]: [
    { title: "MARKET CRASH DRIVES MERCHANTS MAD", body: "The fluctuations in the gold standard have ruined many noble houses today. In their desperation, fallen aristocrats are turning to esoteric cults to restore their fortunes." },
    { title: "SCANDAL AT THE ROYAL BALL", body: "Lady Vane was seen casting her diamond necklace into a sewer grate, laughing hysterically. 'It is but weight!' she screamed. Her peers are intrigued by this new, liberating philosophy." },
    { title: "GUILD MASTERS SEEK NEW ALLIANCES", body: "With the trade routes blocked by 'unnatural storms', the Merchant Princes are seeking supernatural aid. A hefty donation has been made to 'The Cause' in exchange for safe passage." }
  ],
  [WorshipperType.ZEALOUS]: [
    { title: "RIOTS IN THE TEMPLE DISTRICT", body: "The old gods are dead, or so the mobs claim. Statues of the sun deity were defaced last night by figures wielding strange, geometric daggers. The city guard is terrified." },
    { title: "LOCAL GUARD REGIMENT VANISHES", body: "The 7th Infantry Battalion failed to report for duty. Their barracks were found empty, save for a single message carved into the wall: 'WE ARE THE SWORD NOW.'" },
    { title: "FLAGELLANTS ROAM THE HIGHWAY", body: "A procession of self-mortifying fanatics has entered the city gates. They bleed freely, shouting that pain is the only way to wake up from the dream of life." }
  ]
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
    description: "Significantly improves the chance to attract those bound to earthly possessions (Worldly).",
    favoredType: WorshipperType.WORLDLY,
    color: "bg-green-900 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
  },
  [GemType.POOR_MANS_TEAR]: {
    name: "Poor Man's Tear",
    description: "Significantly improves the chance to attract the downtrodden and meek (Lowly).",
    favoredType: WorshipperType.LOWLY,
    color: "bg-gray-700 border-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.3)]"
  },
  [GemType.BLOOD_RUBY]: {
    name: "Blood Ruby",
    description: "Significantly improves the chance to attract the fanatical and aggressive (Zealous).",
    favoredType: WorshipperType.ZEALOUS,
    color: "bg-red-900 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
  },
  [GemType.SLOTH_SAPPHIRE]: {
    name: "Sloth Sapphire",
    description: "Significantly improves the chance to attract the lazy and passive (Indolent).",
    favoredType: WorshipperType.INDOLENT,
    color: "bg-blue-900 border-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.3)]"
  }
};

export const RELIC_DEFINITIONS: RelicDefinition[] = [
  {
    id: RelicId.MIRACLE_BOOST,
    name: "Hand of the Void",
    description: "Miracles are 5% more effective per level.",
    baseCost: 10
  },
  {
    id: RelicId.INDOLENT_BOOST,
    name: "Shepherd's Crook",
    description: "Indolent vessels produce +5% more per level.",
    baseCost: 10
  },
  {
    id: RelicId.LOWLY_BOOST,
    name: "Chain of Binding",
    description: "Lowly vessels produce +5% more per level.",
    baseCost: 10
  },
  {
    id: RelicId.WORLDLY_BOOST,
    name: "Coin of Charon",
    description: "Worldly vessels produce +5% more per level.",
    baseCost: 10
  },
  {
    id: RelicId.ZEALOUS_BOOST,
    name: "Blade of the Martyr",
    description: "Zealous vessels produce +5% more per level.",
    baseCost: 10
  },
  {
    id: RelicId.ALL_VESSEL_BOOST,
    name: "Crown of Eternity",
    description: "All vessels produce +2% more per level.",
    baseCost: 10
  },
  {
    id: RelicId.OFFLINE_BOOST,
    name: "Hourglass of the Sleeper",
    description: "Increases max offline time by +5 minutes per level (Base: 30m).",
    baseCost: 10
  },
  {
    id: RelicId.GEM_BOOST,
    name: "Prism of Desire",
    description: "Focus Gems are +50% more effective at attracting their target per level.",
    baseCost: 10
  },
  {
    id: RelicId.INFLUENCE_INDOLENT,
    name: "Sigil of Stagnation",
    description: "Retains 1% of Indolent Vessel levels when performing 'Motivate the Torpid' per level.",
    baseCost: 10
  },
  {
    id: RelicId.INFLUENCE_LOWLY,
    name: "Sigil of Servitude",
    description: "Retains 1% of Lowly Vessel levels when performing 'Invest in the Poor' per level.",
    baseCost: 10
  },
  {
    id: RelicId.INFLUENCE_WORLDLY,
    name: "Sigil of Hubris",
    description: "Retains 1% of Worldly Vessel levels when performing 'Stoke The Fires of Zeal' per level.",
    baseCost: 10
  }
];

export const GEM_DISPLAY_ORDER = [
  GemType.SLOTH_SAPPHIRE, // Indolent
  GemType.POOR_MANS_TEAR, // Lowly
  GemType.GREED_STONE,    // Worldly
  GemType.BLOOD_RUBY      // Zealous
];

export const VESSEL_DEFINITIONS: VesselDefinition[] = [
  // TIER 1 (Benefit: 15/s each)
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

  // TIER 2 (Benefit: 400/s each)
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
    lore: "Kaelen was a man of iron until the day the mine collapsed, taking his legs and his hope. The despair that followed was so profound it became a physical weight.",
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

  // TIER 3 (Benefit: 12,000/s each)
  {
    id: VesselId.INDOLENT_3,
    name: "Master Silas Vane",
    subtitle: "The Merchant",
    lore: "Silas once believed that a full belly and a locked vault were the only shields a man needed. When the cult came, he tried to bribe the shadows.",
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

  // TIER 4 (Benefit: 500,000/s each)
  {
    id: VesselId.INDOLENT_4,
    name: "Lord Alaric Morn",
    subtitle: "The Noble",
    lore: "The Morn lineage was old when the capital was founded, but Alaric is the last of his blood. He has traded his family’s history for a seat at the end of the world.",
    type: WorshipperType.INDOLENT,
    baseCost: 10000000,
    baseOutput: 500000,
    tier: 4
  },
  {
    id: VesselId.LOWLY_4,
    name: "Sir Gawen the Reft",
    subtitle: "The Ruined Knight",
    lore: "A knight without a quest is a dangerous thing. After failing to protect his manor from the very horrors he now serves, Gawen’s spirit shattered.",
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
