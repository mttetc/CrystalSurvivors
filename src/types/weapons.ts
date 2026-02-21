import { WeaponId, EnchantId, ElementId, JobId } from '../constants';

export interface WeaponLevelStats {
  damage: number;
  cooldown: number;       // ms
  projectileSpeed?: number;
  pierce?: number;
  count?: number;         // multi-shot / shard count / chain count
  radius?: number;        // AoE radius
  damageRetention?: number; // % damage kept per pierce/chain
}

export interface WeaponDef {
  id: WeaponId;
  name: string;
  description: string;
  affinityJob?: JobId;    // class affinity (bonus when player has this job)
  levels: WeaponLevelStats[];   // index 0 = level 1, up to 4 = level 5
}

export interface WeaponInstance {
  id: WeaponId;
  level: number;           // 1-5
  enchant: EnchantId | null;
  enchantTier: number;     // 0-3 (0 = none)
  element: ElementId | null;       // element (coexists with enchant)
  elementUpgrades: string[];       // IDs of unlocked element upgrades (max 3)
}
