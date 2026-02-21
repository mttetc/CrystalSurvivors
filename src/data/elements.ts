import { ElementId } from '../constants';

export interface ElementUpgradeDef {
  id: string;
  elementId: ElementId;
  name: string;
  description: string;
  // Effects applied on hit or passively
  effect: {
    // Burn-related
    burnDamage?: number; // extra burn dmg/s
    burnDuration?: number; // ms
    burnAoeOnKill?: boolean; // embrasement: AoE on burning kill
    burnSpread?: boolean; // inferno: burn spreads to nearby
    // Ice-related
    slowBonus?: number; // extra slow %
    shatterAoe?: boolean; // AoE on frozen kill
    freezeChance?: number; // chance to freeze solid
    // Lightning-related
    chainBonus?: number; // extra chain targets
    stunDuration?: number; // ms
    chainRangeBonus?: number; // extra chain range px
    // Poison-related
    dotDamage?: number; // extra DoT dmg/s
    puddleOnKill?: boolean; // poison puddle on kill
    poisonSpread?: boolean; // poison spreads
    // Holy-related
    healBonus?: number; // extra heal per hit
    groupDamageBonus?: number; // bonus dmg vs 3+ enemies near
    cleanse?: boolean; // remove debuffs
    // Dark-related
    lifestealBonus?: number; // extra lifesteal %
    fearDuration?: number; // ms fear
    ignoreArmor?: boolean; // ignore enemy armor
  };
}

export interface ElementDef {
  id: ElementId;
  name: string;
  color: number; // hex color for tinting
  description: string;
  upgrades: ElementUpgradeDef[]; // 3 upgrades per element
}

// ---------------------------------------------------------------------------
// FIRE
// ---------------------------------------------------------------------------

const FIRE_UPGRADES: ElementUpgradeDef[] = [
  {
    id: 'fire_embrasement',
    elementId: ElementId.FIRE,
    name: 'Embrasement',
    description: 'Burning enemies explode in an AoE on kill',
    effect: {
      burnAoeOnKill: true,
    },
  },
  {
    id: 'fire_fournaise',
    elementId: ElementId.FIRE,
    name: 'Fournaise',
    description: '+3 burn dmg/s, +1s burn duration',
    effect: {
      burnDamage: 3,
      burnDuration: 1000,
    },
  },
  {
    id: 'fire_inferno',
    elementId: ElementId.FIRE,
    name: 'Inferno',
    description: 'Burn spreads to nearby enemies',
    effect: {
      burnSpread: true,
    },
  },
];

// ---------------------------------------------------------------------------
// ICE
// ---------------------------------------------------------------------------

const ICE_UPGRADES: ElementUpgradeDef[] = [
  {
    id: 'ice_gel_profond',
    elementId: ElementId.ICE,
    name: 'Gel Profond',
    description: '+15% slow bonus',
    effect: {
      slowBonus: 15,
    },
  },
  {
    id: 'ice_brisure',
    elementId: ElementId.ICE,
    name: 'Brisure',
    description: 'Shatter AoE on frozen kill',
    effect: {
      shatterAoe: true,
    },
  },
  {
    id: 'ice_blizzard',
    elementId: ElementId.ICE,
    name: 'Blizzard',
    description: '15% chance to freeze enemies solid',
    effect: {
      freezeChance: 0.15,
    },
  },
];

// ---------------------------------------------------------------------------
// LIGHTNING
// ---------------------------------------------------------------------------

const LIGHTNING_UPGRADES: ElementUpgradeDef[] = [
  {
    id: 'lightning_arc_voltaique',
    elementId: ElementId.LIGHTNING,
    name: 'Arc Voltaique',
    description: '+2 chain targets',
    effect: {
      chainBonus: 2,
    },
  },
  {
    id: 'lightning_surcharge',
    elementId: ElementId.LIGHTNING,
    name: 'Surcharge',
    description: 'Stun enemies for 300ms on chain hit',
    effect: {
      stunDuration: 300,
    },
  },
  {
    id: 'lightning_tempete',
    elementId: ElementId.LIGHTNING,
    name: 'Tempete',
    description: '+1 chain target, +40px chain range',
    effect: {
      chainBonus: 1,
      chainRangeBonus: 40,
    },
  },
];

// ---------------------------------------------------------------------------
// POISON
// ---------------------------------------------------------------------------

const POISON_UPGRADES: ElementUpgradeDef[] = [
  {
    id: 'poison_virulence',
    elementId: ElementId.POISON,
    name: 'Virulence',
    description: '+2 DoT dmg/s',
    effect: {
      dotDamage: 2,
    },
  },
  {
    id: 'poison_flaque',
    elementId: ElementId.POISON,
    name: 'Flaque',
    description: 'Leave a poison puddle on kill',
    effect: {
      puddleOnKill: true,
    },
  },
  {
    id: 'poison_pandemie',
    elementId: ElementId.POISON,
    name: 'Pandemie',
    description: 'Poison spreads to nearby enemies',
    effect: {
      poisonSpread: true,
    },
  },
];

// ---------------------------------------------------------------------------
// HOLY
// ---------------------------------------------------------------------------

const HOLY_UPGRADES: ElementUpgradeDef[] = [
  {
    id: 'holy_lumiere',
    elementId: ElementId.HOLY,
    name: 'Lumiere',
    description: '+30% bonus damage vs groups of 3+',
    effect: {
      groupDamageBonus: 0.3,
    },
  },
  {
    id: 'holy_benediction',
    elementId: ElementId.HOLY,
    name: 'Benediction',
    description: '+1 heal per hit',
    effect: {
      healBonus: 1,
    },
  },
  {
    id: 'holy_purification',
    elementId: ElementId.HOLY,
    name: 'Purification',
    description: 'Periodically cleanse debuffs',
    effect: {
      cleanse: true,
    },
  },
];

// ---------------------------------------------------------------------------
// DARK
// ---------------------------------------------------------------------------

const DARK_UPGRADES: ElementUpgradeDef[] = [
  {
    id: 'dark_drain',
    elementId: ElementId.DARK,
    name: 'Drain',
    description: '+5% lifesteal bonus',
    effect: {
      lifestealBonus: 5,
    },
  },
  {
    id: 'dark_terreur',
    elementId: ElementId.DARK,
    name: 'Terreur',
    description: 'Fear enemies for 500ms on hit',
    effect: {
      fearDuration: 500,
    },
  },
  {
    id: 'dark_neant',
    elementId: ElementId.DARK,
    name: 'Neant',
    description: 'Attacks ignore enemy armor',
    effect: {
      ignoreArmor: true,
    },
  },
];

// ---------------------------------------------------------------------------
// Combined definitions
// ---------------------------------------------------------------------------

export const ELEMENT_DEFS: Record<ElementId, ElementDef> = {
  [ElementId.FIRE]: {
    id: ElementId.FIRE,
    name: 'Fire',
    color: 0xff4400,
    description: 'Burn 2 dmg/s 2s',
    upgrades: FIRE_UPGRADES,
  },
  [ElementId.ICE]: {
    id: ElementId.ICE,
    name: 'Ice',
    color: 0x44aaff,
    description: 'Slow 25% 2s',
    upgrades: ICE_UPGRADES,
  },
  [ElementId.LIGHTNING]: {
    id: ElementId.LIGHTNING,
    name: 'Lightning',
    color: 0xffff44,
    description: 'Chain to 1 enemy',
    upgrades: LIGHTNING_UPGRADES,
  },
  [ElementId.POISON]: {
    id: ElementId.POISON,
    name: 'Poison',
    color: 0x44ff44,
    description: 'DoT 1 dmg/s 3s',
    upgrades: POISON_UPGRADES,
  },
  [ElementId.HOLY]: {
    id: ElementId.HOLY,
    name: 'Holy',
    color: 0xffdd44,
    description: 'Heal 1 HP on hit',
    upgrades: HOLY_UPGRADES,
  },
  [ElementId.DARK]: {
    id: ElementId.DARK,
    name: 'Dark',
    color: 0x9933ff,
    description: '10% lifesteal',
    upgrades: DARK_UPGRADES,
  },
};
