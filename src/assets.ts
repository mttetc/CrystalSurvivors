// ══════════════════════════════════════════════════════════════════════════════
// ASSET MANIFEST
// Every game asset is listed here with its file path.
// To swap an asset: change the path, keep the key.
// ══════════════════════════════════════════════════════════════════════════════

// ─── Types ─────────────────────────────────────────────────────────────────
interface SheetDef { path: string; frameWidth: number; frameHeight: number }
type ImageDef = string;   // just the path
type AudioDef = string;   // just the path

// ══════════════════════════════════════════════════════════════════════════════
// CHARACTERS  (spritesheet 16x16, 4 cols x 4 rows)
// Each key produces 4 texture keys:
//   <key>           → walk  (the path below)
//   <key>_jump      → <basePath>_jump.png
//   <key>_attack    → <basePath>_attack.png
//   <key>_dead      → <basePath>_dead.png  (single image)
// ══════════════════════════════════════════════════════════════════════════════
export const CHARACTERS: Record<string, ImageDef> = {
  player:              'assets/characters/player.png',
  player_paladin:      'assets/characters/paladin.png',
  player_dark_knight:  'assets/characters/dark_knight.png',
  player_dragoon:      'assets/characters/dragoon.png',
  player_ninja:        'assets/characters/ninja.png',
  player_monk:         'assets/characters/monk.png',
  player_berserker:    'assets/characters/berserker.png',
  player_ranger:       'assets/characters/ranger.png',
  player_bard:         'assets/characters/bard.png',
  player_black_mage:   'assets/characters/black_mage.png',
  player_white_mage:   'assets/characters/white_mage.png',
  player_summoner:     'assets/characters/summoner.png',
  player_time_mage:    'assets/characters/time_mage.png',
  player_alchemist:    'assets/characters/alchemist.png',
  player_geomancer:    'assets/characters/geomancer.png',
  player_samurai:      'assets/characters/samurai.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// MONSTERS  (spritesheet 16x16, 4 cols x 4 rows)
// ══════════════════════════════════════════════════════════════════════════════
export const MONSTERS: Record<string, ImageDef> = {
  shambler:    'assets/monsters/shambler.png',
  sprinter:    'assets/monsters/sprinter.png',
  brute:       'assets/monsters/brute.png',
  spitter:     'assets/monsters/spitter.png',
  splitter:    'assets/monsters/splitter.png',
  swarmer:     'assets/monsters/swarmer.png',
  necromancer: 'assets/monsters/necromancer.png',
  phantom:     'assets/monsters/phantom.png',
  bomber:      'assets/monsters/bomber.png',
  tank:        'assets/monsters/tank.png',
  leaper:      'assets/monsters/leaper.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// BOSSES  (spritesheets with custom frame sizes)
// ══════════════════════════════════════════════════════════════════════════════
export const BOSSES: Record<string, SheetDef> = {
  gorehound: { path: 'assets/bosses/gorehound.png', frameWidth: 48, frameHeight: 48 },
  hivemind:  { path: 'assets/bosses/hivemind.png',  frameWidth: 50, frameHeight: 50 },
};

// ══════════════════════════════════════════════════════════════════════════════
// PROJECTILES
// ══════════════════════════════════════════════════════════════════════════════
export const PROJECTILE_IMAGES: Record<string, ImageDef> = {
  arrow:      'assets/fx/projectile/Arrow.png',
  kunai:      'assets/fx/projectile/Kunai.png',
  big_kunai:  'assets/fx/projectile/BigKunai.png',
  icespike:   'assets/fx/projectile/IceSpike.png',
  plantspike: 'assets/fx/projectile/PlantSpike.png',
};

export const PROJECTILE_SHEETS: Record<string, SheetDef> = {
  fireball:        { path: 'assets/fx/projectile/Fireball.png',      frameWidth: 16, frameHeight: 16 },
  shuriken:        { path: 'assets/fx/projectile/Shuriken.png',      frameWidth: 16, frameHeight: 16 },
  energyball:      { path: 'assets/fx/projectile/EnergyBall.png',    frameWidth: 16, frameHeight: 16 },
  canonball:       { path: 'assets/fx/projectile/CanonBall.png',     frameWidth: 16, frameHeight: 16 },
  big_energyball:  { path: 'assets/fx/projectile/BigEnergyBall.png', frameWidth: 24, frameHeight: 24 },
  rock_projectile: { path: 'assets/fx/projectile/SpriteSheetRock.png', frameWidth: 16, frameHeight: 16 },
  shuriken_magic:  { path: 'assets/fx/projectile/ShurikenMagic.png', frameWidth: 16, frameHeight: 16 },
  big_shuriken:    { path: 'assets/fx/projectile/BigShuriken.png',   frameWidth: 23, frameHeight: 23 },
};

// ══════════════════════════════════════════════════════════════════════════════
// FX — SLASH  (spritesheets 32x32)
// ══════════════════════════════════════════════════════════════════════════════
export const FX_SLASH: Record<string, ImageDef> = {
  fx_slash:               'assets/fx/slash/slash.png',
  fx_slash_curved:        'assets/fx/slash/slash_curved.png',
  fx_slash_double:        'assets/fx/slash/slash_double.png',
  fx_slash_double_curved: 'assets/fx/slash/slash_double_curved.png',
  fx_circular_slash:      'assets/fx/slash/circular_slash.png',
  fx_claw:                'assets/fx/slash/claw.png',
  fx_claw_double:         'assets/fx/slash/claw_double.png',
  fx_cut:                 'assets/fx/slash/cut.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// FX — ELEMENTAL  (spritesheets, varied frame sizes)
// ══════════════════════════════════════════════════════════════════════════════
export const FX_ELEMENTAL: Record<string, SheetDef> = {
  fx_explosion:    { path: 'assets/fx/elemental/explosion.png',    frameWidth: 40, frameHeight: 40 },
  fx_flame:        { path: 'assets/fx/elemental/flame.png',        frameWidth: 40, frameHeight: 30 },
  fx_ice:          { path: 'assets/fx/elemental/ice.png',          frameWidth: 32, frameHeight: 32 },
  fx_ice_b:        { path: 'assets/fx/elemental/ice_b.png',        frameWidth: 32, frameHeight: 32 },
  fx_thunder:      { path: 'assets/fx/elemental/thunder.png',      frameWidth: 32, frameHeight: 28 },
  fx_rock:         { path: 'assets/fx/elemental/rock.png',         frameWidth: 30, frameHeight: 30 },
  fx_rock_spike:   { path: 'assets/fx/elemental/rock_spike.png',   frameWidth: 48, frameHeight: 48 },
  fx_plant:        { path: 'assets/fx/elemental/plant.png',        frameWidth: 30, frameHeight: 28 },
  fx_water:        { path: 'assets/fx/elemental/water.png',        frameWidth: 40, frameHeight: 33 },
  fx_water_pillar: { path: 'assets/fx/elemental/water_pillar.png', frameWidth: 27, frameHeight: 41 },
};

// ══════════════════════════════════════════════════════════════════════════════
// FX — MAGIC  (spritesheets, varied frame sizes)
// ══════════════════════════════════════════════════════════════════════════════
export const FX_MAGIC: Record<string, SheetDef> = {
  fx_shield_blue:   { path: 'assets/fx/magic/shield_blue.png',   frameWidth: 24, frameHeight: 26 },
  fx_shield_yellow: { path: 'assets/fx/magic/shield_yellow.png', frameWidth: 24, frameHeight: 26 },
  fx_circle_orange: { path: 'assets/fx/magic/circle_orange.png', frameWidth: 32, frameHeight: 32 },
  fx_circle_white:  { path: 'assets/fx/magic/circle_white.png',  frameWidth: 32, frameHeight: 32 },
  fx_circle_spark:  { path: 'assets/fx/magic/circle_spark.png',  frameWidth: 32, frameHeight: 32 },
  fx_spirit:        { path: 'assets/fx/magic/spirit.png',        frameWidth: 32, frameHeight: 32 },
  fx_spirit_blue:   { path: 'assets/fx/magic/spirit_blue.png',   frameWidth: 32, frameHeight: 32 },
  fx_spirit_double: { path: 'assets/fx/magic/spirit_double.png', frameWidth: 32, frameHeight: 32 },
  fx_aura:          { path: 'assets/fx/magic/aura.png',          frameWidth: 25, frameHeight: 24 },
  fx_boost:         { path: 'assets/fx/magic/boost.png',         frameWidth: 35, frameHeight: 35 },
  fx_spark:         { path: 'assets/fx/magic/spark.png',         frameWidth: 27, frameHeight: 35 },
};

// ══════════════════════════════════════════════════════════════════════════════
// FX — SMOKE  (spritesheets)
// ══════════════════════════════════════════════════════════════════════════════
export const FX_SMOKE: Record<string, SheetDef> = {
  fx_smoke:          { path: 'assets/fx/smoke/smoke.png',          frameWidth: 32, frameHeight: 32 },
  fx_smoke_circular: { path: 'assets/fx/smoke/smoke_circular.png', frameWidth: 16, frameHeight: 14 },
};

// ══════════════════════════════════════════════════════════════════════════════
// FX — PARTICLES  (single images)
// ══════════════════════════════════════════════════════════════════════════════
export const PARTICLES: Record<string, ImageDef> = {
  particle_fire:   'assets/fx/particle/Fire.png',
  particle_spark:  'assets/fx/particle/Spark.png',
  particle_leaf:   'assets/fx/particle/Leaf.png',
  particle_rock:   'assets/fx/particle/Rock.png',
  particle_wood:   'assets/fx/particle/Wood.png',
  particle_grass:  'assets/fx/particle/Grass.png',
  particle_snow:   'assets/fx/particle/Snow.png',
  particle_rain:   'assets/fx/particle/Rain.png',
  particle_clouds: 'assets/fx/particle/Clouds.png',
  particle_bamboo: 'assets/fx/particle/Bamboo.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// ITEMS — WEAPONS  (single images)
// ══════════════════════════════════════════════════════════════════════════════
export const ITEM_WEAPONS: Record<string, ImageDef> = {
  item_sword:    'assets/items/weapons/Sword.png',
  item_katana:   'assets/items/weapons/Katana.png',
  item_axe:      'assets/items/weapons/Axe.png',
  item_bow:      'assets/items/weapons/Bow.png',
  item_lance:    'assets/items/weapons/Lance.png',
  item_hammer:   'assets/items/weapons/Hammer.png',
  item_wand:     'assets/items/weapons/MagicWand.png',
  item_whip:     'assets/items/weapons/Whip.png',
  item_bigsword: 'assets/items/weapons/BigSword.png',
  item_club:     'assets/items/weapons/Club.png',
  item_sai:      'assets/items/weapons/Sai.png',
  item_rapier:   'assets/items/weapons/Rapier.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// ITEMS — WEAPONS IN HAND  (tiny pixel sprites shown during attacks)
// ══════════════════════════════════════════════════════════════════════════════
export const WEAPON_INHAND: Record<string, ImageDef> = {
  inhand_sword:    'assets/items/weapons_inhand/sword.png',
  inhand_sword2:   'assets/items/weapons_inhand/sword2.png',
  inhand_katana:   'assets/items/weapons_inhand/katana.png',
  inhand_axe:      'assets/items/weapons_inhand/axe.png',
  inhand_bigsword: 'assets/items/weapons_inhand/bigsword.png',
  inhand_lance:    'assets/items/weapons_inhand/lance.png',
  inhand_lance2:   'assets/items/weapons_inhand/lance2.png',
  inhand_wand:     'assets/items/weapons_inhand/wand.png',
  inhand_hammer:   'assets/items/weapons_inhand/hammer.png',
  inhand_ninjaku:  'assets/items/weapons_inhand/ninjaku.png',
  inhand_club:     'assets/items/weapons_inhand/club.png',
  inhand_sai:      'assets/items/weapons_inhand/sai.png',
  inhand_whip:     'assets/items/weapons_inhand/whip.png',
  inhand_rapier:   'assets/items/weapons_inhand/rapier.png',
  inhand_book:     'assets/items/weapons_inhand/book.png',
  inhand_stick:    'assets/items/weapons_inhand/stick.png',
  inhand_bow:      'assets/items/weapons_inhand/bow.png',
  inhand_fork:     'assets/items/weapons_inhand/fork.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// ITEMS — MISC  (single images)
// ══════════════════════════════════════════════════════════════════════════════
export const ITEM_MISC: Record<string, ImageDef> = {
  item_bomb:        'assets/items/bomb.png',
  item_gem_green:   'assets/items/gem_green.png',
  item_gem_purple:  'assets/items/gem_purple.png',
  item_gem_red:     'assets/items/gem_red.png',
  item_gem_yellow:  'assets/items/gem_yellow.png',
  item_heart:       'assets/items/heart_item.png',
  item_money_bag:   'assets/items/money_bag.png',
  item_hit:         'assets/items/hit_action.png',
  item_scroll_fire: 'assets/items/scroll_fire.png',
  item_scroll_ice:  'assets/items/scroll_ice.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// TILESETS  (spritesheets 16x16)
// ══════════════════════════════════════════════════════════════════════════════
export const TILESETS: Record<string, ImageDef> = {
  tileset_field:          'assets/tilesets/field.png',
  tileset_nature:         'assets/tilesets/nature.png',
  tileset_element:        'assets/tilesets/element.png',
  tileset_house:          'assets/tilesets/house.png',
  tileset_relief:         'assets/tilesets/relief.png',
  tileset_relief_detail:  'assets/tilesets/relief_detail.png',
  tileset_water:          'assets/tilesets/water.png',
  tileset_floor:          'assets/tilesets/floor.png',
  tileset_grass:          'assets/tilesets/grass.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// PICKUPS  (single images + chest spritesheets)
// ══════════════════════════════════════════════════════════════════════════════
export const PICKUP_IMAGES: Record<string, ImageDef> = {
  heart_pickup: 'assets/pickups/heart.png',
  life_pot:     'assets/pickups/life_pot.png',
};

export const PICKUP_SHEETS: Record<string, SheetDef> = {
  chest_small: { path: 'assets/pickups/chest_small.png', frameWidth: 16, frameHeight: 16 },
  chest_big:   { path: 'assets/pickups/chest_big.png',   frameWidth: 16, frameHeight: 14 },
};

// ══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT  (single images)
// ══════════════════════════════════════════════════════════════════════════════
export const ENVIRONMENT: Record<string, ImageDef> = {
  env_bush:    'assets/environment/bush.png',
  env_flowers: 'assets/environment/flowers.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// UI — BARS  (single images)
// ══════════════════════════════════════════════════════════════════════════════
export const UI_BARS: Record<string, ImageDef> = {
  ui_heart:  'assets/ui/bars/Heart.png',
  ui_hp_bar: 'assets/ui/bars/ProgressHealth.png',
  ui_bar_bg: 'assets/ui/bars/BackgroundWood.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// UI — THEME  (nine-patch panels, buttons, cells)
// ══════════════════════════════════════════════════════════════════════════════
export const UI_THEME: Record<string, ImageDef> = {
  ui_panel:           'assets/ui/theme/nine_path_panel.png',
  ui_panel_2:         'assets/ui/theme/nine_path_panel_2.png',
  ui_panel_3:         'assets/ui/theme/nine_path_panel_3.png',
  ui_panel_interior:  'assets/ui/theme/nine_path_panel_interior.png',
  ui_panel_bg:        'assets/ui/theme/nine_path_bg.png',
  ui_panel_bg_2:      'assets/ui/theme/nine_path_bg_2.png',
  ui_panel_focus:     'assets/ui/theme/nine_path_focus.png',
  ui_btn_normal:      'assets/ui/theme/button_normal.png',
  ui_btn_hover:       'assets/ui/theme/button_hover.png',
  ui_btn_pressed:     'assets/ui/theme/button_pressed.png',
  ui_btn_disabled:    'assets/ui/theme/button_disabled.png',
  ui_inv_cell:        'assets/ui/theme/inventory_cell.png',
  ui_tab:             'assets/ui/theme/tab.png',
  ui_tab_selected:    'assets/ui/theme/tab_selected.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// UI — RECEPTACLE  (health hearts, bar pieces, sphere containers)
// ══════════════════════════════════════════════════════════════════════════════
export const UI_RECEPTACLE: Record<string, ImageDef> = {
  ui_heart_full:       'assets/ui/receptacle/heart_full.png',
  ui_heart_half:       'assets/ui/receptacle/heart_half.png',
  ui_heart_empty:      'assets/ui/receptacle/heart_empty.png',
  ui_heart_icon:       'assets/ui/receptacle/heart_icon.png',
  ui_lifebar_fill:     'assets/ui/receptacle/lifebar_mini_progress.png',
  ui_lifebar_bg:       'assets/ui/receptacle/lifebar_mini_under.png',
  ui_rect_bg_wood:     'assets/ui/receptacle/rect_bg_wood.png',
  ui_rect_health:      'assets/ui/receptacle/rect_progress_health.png',
  ui_rect_white:       'assets/ui/receptacle/rect_progress_white.png',
  ui_rect_ammo:        'assets/ui/receptacle/rect_ammo_skill.png',
  ui_sphere_bg:        'assets/ui/receptacle_sphere/bg_wood.png',
  ui_sphere_bg_metal:  'assets/ui/receptacle_sphere/bg_metal.png',
  ui_sphere_hp:        'assets/ui/receptacle_sphere/progress_health.png',
  ui_sphere_mana:      'assets/ui/receptacle_sphere/progress_mana.png',
  ui_sphere_green:     'assets/ui/receptacle_sphere/progress_green.png',
  ui_sphere_yellow:    'assets/ui/receptacle_sphere/progress_yellow.png',
  ui_sphere_over:      'assets/ui/receptacle_sphere/over.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// UI — DIALOG  (dialog boxes)
// ══════════════════════════════════════════════════════════════════════════════
export const UI_DIALOG: Record<string, ImageDef> = {
  ui_dialog:           'assets/ui/dialog/DialogBox.png',
  ui_dialog_simple:    'assets/ui/dialog/DialogueBoxSimple.png',
  ui_dialog_info:      'assets/ui/dialog/DialogInfo.png',
  ui_choice_box:       'assets/ui/dialog/ChoiceBox.png',
};

// ══════════════════════════════════════════════════════════════════════════════
// UI — ICONS  (single images, all from assets/ui/icons/)
// Key = texture key used in code, Value = filename inside assets/ui/icons/
//
// Many keys point to the same file (aliases). This is intentional so that
// each weapon / skill / stat can be re-skinned independently.
// ══════════════════════════════════════════════════════════════════════════════
const ICON_DIR = 'assets/ui/icons';

export const ICONS: Record<string, ImageDef> = {
  // ── Base icons ───────────────────────────────────────────────────────────
  icon_arrow:           `${ICON_DIR}/Arrow.png`,
  icon_guard:           `${ICON_DIR}/Guard.png`,
  icon_fireball:        `${ICON_DIR}/Fireball.png`,
  icon_cut:             `${ICON_DIR}/Cut.png`,
  icon_sing:            `${ICON_DIR}/Sing.png`,
  icon_shuriken_icon:   `${ICON_DIR}/Shuriken.png`,
  icon_punch:           `${ICON_DIR}/Punch.png`,
  icon_alchemy:         `${ICON_DIR}/Alchemy.png`,
  icon_rockspike:       `${ICON_DIR}/RockSpike.png`,
  icon_moon:            `${ICON_DIR}/Moon.png`,
  icon_explosion:       `${ICON_DIR}/Explosion.png`,
  icon_death:           `${ICON_DIR}/Death.png`,
  icon_boot:            `${ICON_DIR}/Boot.png`,
  icon_amulet:          `${ICON_DIR}/Amulet.png`,
  icon_scroll:          `${ICON_DIR}/Scroll.png`,
  icon_attack_upgrade:  `${ICON_DIR}/AttackUpgrade.png`,
  icon_armor:           `${ICON_DIR}/Armor.png`,
  icon_heal:            `${ICON_DIR}/Heal.png`,
  icon_luck_upgrade:    `${ICON_DIR}/LuckUpgrade.png`,
  icon_money:           `${ICON_DIR}/Money.png`,
  icon_upgrade:         `${ICON_DIR}/Upgrade.png`,
  icon_ring:            `${ICON_DIR}/Ring.png`,
  icon_necromancy:      `${ICON_DIR}/Necromancy.png`,
  icon_sun:             `${ICON_DIR}/Sun.png`,
  icon_downgrade:       `${ICON_DIR}/Downgrade.png`,
  icon_magic_weapon:    `${ICON_DIR}/MagicWeapon.png`,
  icon_defense_upgrade: `${ICON_DIR}/DefenseUpgrade.png`,
  icon_orb_light:       `${ICON_DIR}/OrbLight.png`,
  icon_orb_darkness:    `${ICON_DIR}/OrbDarkness.png`,
  icon_orb_fire:        `${ICON_DIR}/OrbFire.png`,
  icon_orb_water:       `${ICON_DIR}/OrbWater.png`,
  icon_orb_plant:       `${ICON_DIR}/OrbPlant.png`,
  icon_book_fire:       `${ICON_DIR}/BookFire.png`,
  icon_book_ice:        `${ICON_DIR}/BookIce.png`,
  icon_book_thunder:    `${ICON_DIR}/BookThunder.png`,
  icon_book_darkness:   `${ICON_DIR}/BookDarkness.png`,
  icon_book_light:      `${ICON_DIR}/BookLight.png`,
  icon_book_wind:       `${ICON_DIR}/BookWind.png`,
  icon_book_rock:       `${ICON_DIR}/BookRock.png`,
  icon_book_plant:      `${ICON_DIR}/BookPlant.png`,
  icon_snow:            `${ICON_DIR}/Snow.png`,
  icon_water:           `${ICON_DIR}/Water.png`,
  icon_potion:          `${ICON_DIR}/Potion.png`,
  icon_mine:            `${ICON_DIR}/Mine.png`,
  icon_mist:            `${ICON_DIR}/Mist.png`,
  icon_camouflage:      `${ICON_DIR}/Camouflage.png`,
  icon_rain:            `${ICON_DIR}/Rain.png`,
  icon_helmet:          `${ICON_DIR}/Helmet.png`,
  icon_counter:         `${ICON_DIR}/Counter.png`,
  icon_water_canon:     `${ICON_DIR}/WaterCanon.png`,
  icon_vision:          `${ICON_DIR}/Vision.png`,

  // ── Weapon icons ─────────────────────────────────────────────────────────
  icon_hunters_bow:     `${ICON_DIR}/Arrow.png`,
  icon_sacred_shield:   `${ICON_DIR}/Guard.png`,
  icon_fire_rod:        `${ICON_DIR}/Fireball.png`,
  icon_dark_claymore:   `${ICON_DIR}/MagicWeapon.png`,  // dark magic sword
  icon_war_harp:        `${ICON_DIR}/Sing.png`,
  icon_katana:          `${ICON_DIR}/Cut.png`,
  icon_battle_axe:      `${ICON_DIR}/Hook.png`,          // axe shape
  icon_war_lance:       `${ICON_DIR}/Kunai.png`,         // pointed polearm
  icon_flask_throw:     `${ICON_DIR}/Potion.png`,        // thrown flask/potion
  icon_holy_rod:        `${ICON_DIR}/OrbLight.png`,
  icon_ether_rod:       `${ICON_DIR}/OrbDarkness.png`,
  icon_iron_fists:      `${ICON_DIR}/Punch.png`,
  icon_chrono_rod:      `${ICON_DIR}/Moon.png`,
  icon_earth_rod:       `${ICON_DIR}/RockSpike.png`,
  icon_pulse_pistol:    `${ICON_DIR}/OrbFire.png`,       // energy shot
  icon_orbital_shield:  `${ICON_DIR}/Ring.png`,           // orbital ring shape
  icon_nova_burst:      `${ICON_DIR}/Explosion.png`,
  icon_piercing_beam:   `${ICON_DIR}/Vision.png`,         // beam of energy
  icon_chain_lightning: `${ICON_DIR}/BookThunder.png`,
  icon_shuriken:        `${ICON_DIR}/Shuriken.png`,
  icon_spectral_sword:  `${ICON_DIR}/MagicWeapon.png`,
  icon_throwing_axe:    `${ICON_DIR}/Shuriken.png`,       // thrown weapon
  icon_bone_lance:      `${ICON_DIR}/BookDeath.png`,      // undead lance
  icon_poison_dagger:   `${ICON_DIR}/Alchemy.png`,
  icon_holy_cross:      `${ICON_DIR}/OrbLight.png`,
  icon_homing_orb:      `${ICON_DIR}/OrbFire.png`,
  icon_flame_whip:      `${ICON_DIR}/BookFire.png`,       // fire weapon
  icon_frost_nova:      `${ICON_DIR}/Snow.png`,
  icon_death_aura:      `${ICON_DIR}/Death.png`,

  // ── Stat icons ───────────────────────────────────────────────────────────
  icon_vitality:        `${ICON_DIR}/Heal.png`,
  icon_swift_feet:      `${ICON_DIR}/Boot.png`,
  icon_magnet:          `${ICON_DIR}/Amulet.png`,
  icon_scholar:         `${ICON_DIR}/Scroll.png`,
  icon_rapid_fire:      `${ICON_DIR}/Shuriken.png`,      // rapid attacks
  icon_power_surge:     `${ICON_DIR}/AttackUpgrade.png`,
  icon_iron_skin:       `${ICON_DIR}/Armor.png`,
  icon_regen:           `${ICON_DIR}/Potion.png`,         // regen = healing potion
  icon_lucky_find:      `${ICON_DIR}/LuckUpgrade.png`,
  icon_adrenaline:      `${ICON_DIR}/Counter.png`,        // adrenaline rush
  stat_power:           `${ICON_DIR}/AttackUpgrade.png`,
  stat_speed:           `${ICON_DIR}/Boot.png`,
  stat_armor:           `${ICON_DIR}/Armor.png`,
  stat_hp:              `${ICON_DIR}/Heal.png`,
  stat_regen:           `${ICON_DIR}/Potion.png`,         // distinct from hp
  stat_move:            `${ICON_DIR}/Boot.png`,
  stat_magnet:          `${ICON_DIR}/Amulet.png`,
  stat_crit:            `${ICON_DIR}/LuckUpgrade.png`,
  stat_gem:             `${ICON_DIR}/Money.png`,
  stat_xp:              `${ICON_DIR}/Upgrade.png`,
  stat_range:           `${ICON_DIR}/Arrow.png`,
  stat_damage:          `${ICON_DIR}/AttackUpgrade.png`,
  stat_synergy:         `${ICON_DIR}/Ring.png`,

  // ── Family icons ─────────────────────────────────────────────────────────
  family_projectile:    `${ICON_DIR}/Arrow.png`,
  family_magic:         `${ICON_DIR}/MagicWeapon.png`,
  family_melee:         `${ICON_DIR}/Cut.png`,
  family_aura:          `${ICON_DIR}/Ring.png`,
  family_support:       `${ICON_DIR}/Heal.png`,
  family_summoning:     `${ICON_DIR}/Necromancy.png`,

  // ── Special icons ────────────────────────────────────────────────────────
  icon_awakening:       `${ICON_DIR}/Sun.png`,
  icon_malus:           `${ICON_DIR}/Downgrade.png`,

  // ── Job icons ────────────────────────────────────────────────────────────
  job_paladin:          `${ICON_DIR}/Guard.png`,
  job_dark_knight:      `${ICON_DIR}/BookDarkness.png`,
  job_dragoon:          `${ICON_DIR}/Kunai.png`,          // lance wielder
  job_ninja:            `${ICON_DIR}/Camouflage.png`,
  job_monk:             `${ICON_DIR}/Punch.png`,
  job_berserker:        `${ICON_DIR}/Counter.png`,        // berserker fury
  job_ranger:           `${ICON_DIR}/Arrow.png`,
  job_bard:             `${ICON_DIR}/Sing.png`,
  job_black_mage:       `${ICON_DIR}/BookFire.png`,
  job_white_mage:       `${ICON_DIR}/Heal.png`,
  job_summoner:         `${ICON_DIR}/Necromancy.png`,
  job_time_mage:        `${ICON_DIR}/Moon.png`,
  job_alchemist:        `${ICON_DIR}/Alchemy.png`,
  job_geomancer:        `${ICON_DIR}/RockSpike.png`,
  job_samurai:          `${ICON_DIR}/Cut.png`,

  // ── Skill icons ──────────────────────────────────────────────────────────
  // Paladin
  skill_holy_shield:        `${ICON_DIR}/Guard.png`,
  skill_divine_guard:       `${ICON_DIR}/DefenseUpgrade.png`,
  skill_consecrate:         `${ICON_DIR}/OrbLight.png`,
  // Dark Knight
  skill_abyssal_drain:      `${ICON_DIR}/OrbDarkness.png`,   // drain = dark orb
  skill_dark_force:         `${ICON_DIR}/BookDarkness.png`,   // dark force = dark magic
  skill_darkness:           `${ICON_DIR}/Death.png`,
  // Dragoon
  skill_jump:               `${ICON_DIR}/Boot.png`,
  skill_lance_mastery:      `${ICON_DIR}/Kunai.png`,          // lance, not arrow
  skill_dragon_dive:        `${ICON_DIR}/BookWind.png`,       // aerial dive
  // Ninja
  skill_katon:              `${ICON_DIR}/Fireball.png`,
  skill_raiton:             `${ICON_DIR}/BookThunder.png`,
  skill_doton:              `${ICON_DIR}/RockSpike.png`,
  // Monk
  skill_iron_fist:          `${ICON_DIR}/Punch.png`,
  skill_chi_burst:          `${ICON_DIR}/OrbFire.png`,
  skill_hadouken:           `${ICON_DIR}/WaterCanon.png`,     // energy projectile
  // Berserker
  skill_war_cry:            `${ICON_DIR}/AttackUpgrade.png`,
  skill_frenzy:             `${ICON_DIR}/Explosion.png`,      // explosive rage
  skill_rampage:            `${ICON_DIR}/Counter.png`,        // aggressive rampage
  // Ranger
  skill_multi_shot:         `${ICON_DIR}/Arrow.png`,
  skill_rain_of_arrows:     `${ICON_DIR}/Rain.png`,
  skill_barrage:            `${ICON_DIR}/Shuriken.png`,       // scatter projectiles
  // Bard
  skill_war_song:           `${ICON_DIR}/Sing.png`,
  skill_crescendo:          `${ICON_DIR}/Upgrade.png`,        // escalation
  skill_requiem:            `${ICON_DIR}/BookDeath.png`,      // death song
  // Black Mage
  skill_fire:               `${ICON_DIR}/BookFire.png`,
  skill_blizzard:           `${ICON_DIR}/BookIce.png`,
  skill_thunder:            `${ICON_DIR}/BookThunder.png`,
  // White Mage
  skill_regen_wm:           `${ICON_DIR}/Heal.png`,
  skill_protect:            `${ICON_DIR}/DefenseUpgrade.png`, // protection = defense
  skill_holy:               `${ICON_DIR}/OrbLight.png`,
  // Summoner
  skill_ifrit:              `${ICON_DIR}/Fireball.png`,
  skill_shiva:              `${ICON_DIR}/Snow.png`,
  skill_bahamut:            `${ICON_DIR}/Sun.png`,            // megaflare = solar
  skill_ramuh:              `${ICON_DIR}/BookThunder.png`,
  skill_titan:              `${ICON_DIR}/RockSpike.png`,
  skill_carbuncle:          `${ICON_DIR}/OrbLight.png`,
  skill_leviathan:          `${ICON_DIR}/WaterCanon.png`,     // water blast
  skill_odin:               `${ICON_DIR}/Death.png`,          // zantetsuken = death
  skill_alexander:          `${ICON_DIR}/DefenseUpgrade.png`, // defensive summon
  skill_diabolos:           `${ICON_DIR}/BookDeath.png`,      // death/darkness
  skill_knights_of_the_round: `${ICON_DIR}/MagicWeapon.png`,
  skill_eden:               `${ICON_DIR}/Vision.png`,         // eden = cosmic vision
  skill_phoenix:            `${ICON_DIR}/Heal.png`,           // rebirth/healing
  skill_dreadwyrm:          `${ICON_DIR}/BookDarkness.png`,
  // Time Mage
  skill_haste:              `${ICON_DIR}/Boot.png`,
  skill_slow_field:         `${ICON_DIR}/Moon.png`,
  skill_meteor:             `${ICON_DIR}/Explosion.png`,
  // Alchemist
  skill_potion_lore:        `${ICON_DIR}/Potion.png`,
  skill_transmute:          `${ICON_DIR}/Alchemy.png`,
  skill_elixir:             `${ICON_DIR}/Potion.png`,
  // Geomancer
  skill_pitfall:            `${ICON_DIR}/Mine.png`,
  skill_gust:               `${ICON_DIR}/BookWind.png`,
  skill_quake:              `${ICON_DIR}/RockSpike.png`,
  // Samurai
  skill_bushido:            `${ICON_DIR}/Cut.png`,
  skill_blade_storm:        `${ICON_DIR}/MagicWeapon.png`,   // magical blade storm
  skill_zantetsuken:        `${ICON_DIR}/Death.png`,         // instant death slash
  // Mastery skills
  skill_sacred_orbit:       `${ICON_DIR}/Ring.png`,
  skill_dual_strike:        `${ICON_DIR}/Counter.png`,       // dual hit
  skill_shadow_step:        `${ICON_DIR}/Camouflage.png`,
  skill_smoke_bomb:         `${ICON_DIR}/Mist.png`,
  skill_swift_song:         `${ICON_DIR}/Sing.png`,
  skill_hallowed_ground:    `${ICON_DIR}/OrbLight.png`,
  skill_clemency:           `${ICON_DIR}/Heal.png`,
  skill_soul_eater:         `${ICON_DIR}/BookDeath.png`,     // soul eating = death
  skill_living_dead:        `${ICON_DIR}/Death.png`,
  skill_stardiver:          `${ICON_DIR}/BookLight.png`,     // star-powered dive
  skill_nastrond:           `${ICON_DIR}/BookDarkness.png`,
  skill_forbidden_chakra:   `${ICON_DIR}/Punch.png`,
  skill_phantom_rush:       `${ICON_DIR}/Permutation.png`,   // teleport rush
  skill_inner_beast:        `${ICON_DIR}/AttackUpgrade.png`,
  skill_fell_cleave:        `${ICON_DIR}/Hook.png`,          // cleave = axe-like
  skill_sidewinder:         `${ICON_DIR}/Arrow.png`,
  skill_empyreal_arrow:     `${ICON_DIR}/BookLight.png`,     // empyreal = celestial
  skill_finale:             `${ICON_DIR}/Sing.png`,
  skill_flare:              `${ICON_DIR}/Fireball.png`,
  skill_freeze:             `${ICON_DIR}/BookIce.png`,       // freeze = ice magic
  skill_benediction:        `${ICON_DIR}/Heal.png`,
  skill_asylum:             `${ICON_DIR}/Guard.png`,
  skill_time_stop:          `${ICON_DIR}/Permutation.png`,   // time manipulation
  skill_comet:              `${ICON_DIR}/BookRock.png`,       // falling rock
  skill_philosopher_stone:  `${ICON_DIR}/Alchemy.png`,
  skill_mega_potion:        `${ICON_DIR}/Potion.png`,
  skill_eruption:           `${ICON_DIR}/Explosion.png`,     // volcanic eruption
  skill_landslide:          `${ICON_DIR}/RockSpike.png`,
  skill_midare_setsugekka:  `${ICON_DIR}/Snow.png`,
  skill_hissatsu:           `${ICON_DIR}/Cut.png`,
};

// ══════════════════════════════════════════════════════════════════════════════
// AUDIO — MUSIC
// ══════════════════════════════════════════════════════════════════════════════
export const MUSIC: Record<string, AudioDef> = {
  music_title:    'assets/audio/music/peaceful.ogg',
  music_game:     'assets/audio/music/dungeon.ogg',
  music_boss:     'assets/audio/music/fight.ogg',
  music_gameover: 'assets/audio/music/sad.ogg',
};

// ══════════════════════════════════════════════════════════════════════════════
// AUDIO — JINGLES
// ══════════════════════════════════════════════════════════════════════════════
export const JINGLES: Record<string, AudioDef> = {
  sfx_level_up:  'assets/audio/jingles/level_up.wav',
  sfx_game_over: 'assets/audio/jingles/game_over.wav',
  sfx_success:   'assets/audio/jingles/success.wav',
};

// ══════════════════════════════════════════════════════════════════════════════
// AUDIO — SOUND EFFECTS
// ══════════════════════════════════════════════════════════════════════════════
export const SFX: Record<string, AudioDef> = {
  sfx_hit1:      'assets/audio/sounds/hit1.wav',
  sfx_hit2:      'assets/audio/sounds/hit2.wav',
  sfx_impact:    'assets/audio/sounds/impact.wav',
  sfx_slash:     'assets/audio/sounds/slash.wav',
  sfx_slash2:    'assets/audio/sounds/slash2.wav',
  sfx_whoosh:    'assets/audio/sounds/whoosh.wav',
  sfx_launch:    'assets/audio/sounds/launch.wav',
  sfx_magic1:    'assets/audio/sounds/magic1.wav',
  sfx_magic2:    'assets/audio/sounds/magic2.wav',
  sfx_heal:      'assets/audio/sounds/heal.wav',
  sfx_spirit:    'assets/audio/sounds/spirit.wav',
  sfx_jump:      'assets/audio/sounds/jump.wav',
  sfx_bounce:    'assets/audio/sounds/bounce.wav',
  sfx_coin:      'assets/audio/sounds/coin.wav',
  sfx_powerup:   'assets/audio/sounds/powerup.wav',
  sfx_gold:      'assets/audio/sounds/gold.wav',
  sfx_explosion: 'assets/audio/sounds/explosion.wav',
  sfx_fire:      'assets/audio/sounds/fire.wav',
  sfx_fireball:  'assets/audio/sounds/fireball_sfx.wav',
  sfx_accept:    'assets/audio/sounds/accept.wav',
  sfx_cancel:    'assets/audio/sounds/cancel.wav',
  sfx_menu_move: 'assets/audio/sounds/menu_move.wav',
  sfx_alert:     'assets/audio/sounds/alert.wav',
};
