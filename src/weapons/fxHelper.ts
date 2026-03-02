import Phaser from 'phaser';
import { DEPTHS, SPRITE_SCALE, WeaponId } from '../constants';

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC SPRITE FX HELPERS — replace all add.graphics() procedural drawing
// ═══════════════════════════════════════════════════════════════════════════

/** Spawn a sprite that fades out and self-destructs. Returns the sprite. */
export function spawnFX(
  scene: Phaser.Scene,
  x: number, y: number,
  texture: string,
  opts: {
    scale?: number;
    tint?: number;
    alpha?: number;
    duration?: number;
    depth?: number;
    blendMode?: Phaser.BlendModes;
    rotation?: number;
    fadeOut?: boolean;
    scaleEnd?: number;
  } = {},
): Phaser.GameObjects.Sprite {
  const tex = scene.textures.exists(texture) ? texture : 'fx_circle_spark';
  const sprite = scene.add.sprite(x, y, tex, 0);
  sprite.setDepth(opts.depth ?? DEPTHS.EFFECTS);
  sprite.setScale(opts.scale ?? 1);
  if (opts.tint != null) sprite.setTint(opts.tint);
  sprite.setAlpha(opts.alpha ?? 0.8);
  if (opts.blendMode != null) sprite.setBlendMode(opts.blendMode);
  if (opts.rotation != null) sprite.setRotation(opts.rotation);

  const duration = opts.duration ?? 300;
  const tweenConfig: Phaser.Types.Tweens.TweenBuilderConfig = {
    targets: sprite,
    duration,
    ease: 'Quad.easeOut',
    onComplete: () => sprite.destroy(),
  };
  if (opts.fadeOut !== false) tweenConfig.alpha = 0;
  if (opts.scaleEnd != null) {
    tweenConfig.scaleX = opts.scaleEnd;
    tweenConfig.scaleY = opts.scaleEnd;
  }
  scene.tweens.add(tweenConfig);
  return sprite;
}

/** Circle zone indicator (AoE, poison cloud, consecrate). Fades out. */
export function spawnCircleZone(
  scene: Phaser.Scene,
  x: number, y: number,
  radius: number,
  color: number,
  alpha: number,
  duration: number,
  depth = DEPTHS.EFFECTS - 2,
): Phaser.GameObjects.Sprite {
  const tex = scene.textures.exists('fx_circle_orange') ? 'fx_circle_orange' : 'fx_circle_spark';
  const sprite = scene.add.sprite(x, y, tex, 0);
  sprite.setDepth(depth);
  const baseSize = 32; // fx_circle_orange is 32x32
  const scale = (radius * 2) / baseSize;
  sprite.setScale(scale);
  sprite.setTint(color);
  sprite.setAlpha(alpha);
  scene.tweens.add({
    targets: sprite,
    alpha: 0,
    duration,
    ease: 'Linear',
    onComplete: () => sprite.destroy(),
  });
  return sprite;
}

/** Flash/burst effect at a point using additive blend. */
export function spawnFlash(
  scene: Phaser.Scene,
  x: number, y: number,
  radius: number,
  color: number,
  duration = 200,
): Phaser.GameObjects.Sprite {
  return spawnFX(scene, x, y, 'fx_circle_spark', {
    scale: (radius * 2) / 32,
    tint: color,
    alpha: 0.9,
    duration,
    blendMode: Phaser.BlendModes.ADD,
    scaleEnd: (radius * 2) / 32 * 0.3,
  });
}

/** Expanding ring / shockwave. Scales up from startRadius to endRadius. */
export function spawnRing(
  scene: Phaser.Scene,
  x: number, y: number,
  startRadius: number,
  endRadius: number,
  color: number,
  duration = 300,
  alpha = 0.6,
): Phaser.GameObjects.Sprite {
  const tex = scene.textures.exists('fx_circle_white') ? 'fx_circle_white' : 'fx_circle_spark';
  const sprite = scene.add.sprite(x, y, tex, 0);
  sprite.setDepth(DEPTHS.EFFECTS);
  const startScale = (startRadius * 2) / 32;
  const endScale = (endRadius * 2) / 32;
  sprite.setScale(startScale);
  sprite.setTint(color);
  sprite.setAlpha(alpha);
  sprite.setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: sprite,
    scaleX: endScale,
    scaleY: endScale,
    alpha: 0,
    duration,
    ease: 'Quad.easeOut',
    onComplete: () => sprite.destroy(),
  });
  return sprite;
}

/** Lightning/line between two points using a stretched sprite. */
export function spawnLine(
  scene: Phaser.Scene,
  x1: number, y1: number,
  x2: number, y2: number,
  color: number,
  duration = 150,
  alpha = 0.7,
): Phaser.GameObjects.Sprite {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const tex = scene.textures.exists('fx_spark') ? 'fx_spark' : 'fx_circle_spark';
  const sprite = scene.add.sprite(midX, midY, tex, 0);
  sprite.setDepth(DEPTHS.EFFECTS);
  sprite.setScale(dist / 27, 0.15); // stretch horizontally, thin vertically
  sprite.setRotation(angle);
  sprite.setTint(color);
  sprite.setAlpha(alpha);
  sprite.setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: sprite,
    alpha: 0,
    duration,
    onComplete: () => sprite.destroy(),
  });
  return sprite;
}

/** Spawn multiple spark particles flying outward from a point. */
export function spawnParticleBurst(
  scene: Phaser.Scene,
  x: number, y: number,
  count: number,
  color: number,
  speed = 60,
  duration = 300,
): void {
  const tex = scene.textures.exists('fx_spark') ? 'fx_spark' : 'fx_circle_spark';
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const dist = speed + Math.random() * speed * 0.5;
    const p = scene.add.sprite(x, y, tex, 0);
    p.setDepth(DEPTHS.EFFECTS);
    p.setScale(0.3 + Math.random() * 0.3);
    p.setTint(color);
    p.setAlpha(0.8);
    p.setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      scale: 0.1,
      duration: duration + Math.random() * 100,
      ease: 'Quad.easeOut',
      onComplete: () => p.destroy(),
    });
  }
}

/** Spawn a projectile-style sprite that travels from A to B. Returns the sprite for chaining. */
export function spawnProjectileFX(
  scene: Phaser.Scene,
  fromX: number, fromY: number,
  toX: number, toY: number,
  texture: string,
  opts: {
    scale?: number;
    tint?: number;
    duration?: number;
    onComplete?: () => void;
  } = {},
): Phaser.GameObjects.Sprite {
  const tex = scene.textures.exists(texture) ? texture : 'kunai';
  const sprite = scene.add.sprite(fromX, fromY, tex, 0);
  sprite.setDepth(DEPTHS.EFFECTS);
  sprite.setScale(opts.scale ?? SPRITE_SCALE);
  if (opts.tint != null) sprite.setTint(opts.tint);
  sprite.setRotation(Math.atan2(toY - fromY, toX - fromX));
  scene.tweens.add({
    targets: sprite,
    x: toX,
    y: toY,
    duration: opts.duration ?? 200,
    ease: 'Quad.easeIn',
    onComplete: () => {
      sprite.destroy();
      opts.onComplete?.();
    },
  });
  return sprite;
}

/**
 * Play a slash FX spritesheet animation at a position with rotation.
 * Used by melee weapons (BattleAxe, DarkClaymore, Katana, etc.)
 */
export function playSlashFX(
  scene: Phaser.Scene,
  x: number, y: number,
  angle: number,
  textureKey: string,
  scale: number,
  tint: number,
  duration: number,
): void {
  if (!scene.textures.exists(textureKey)) return;

  const sprite = scene.add.sprite(x, y, textureKey, 0);
  sprite.setDepth(DEPTHS.EFFECTS);
  sprite.setScale(scale);
  sprite.setRotation(angle);
  sprite.setTint(tint);
  sprite.setAlpha(0.9);

  // Animate through frames
  const totalFrames = sprite.texture.frameTotal - 1; // exclude __BASE
  let frame = 0;
  const animEvent = scene.time.addEvent({
    delay: Math.floor(duration / Math.max(totalFrames, 1)),
    repeat: totalFrames - 1,
    callback: () => {
      frame++;
      if (sprite.active && frame < totalFrames) {
        sprite.setFrame(frame);
      }
    },
  });

  scene.tweens.add({
    targets: sprite,
    alpha: 0,
    duration,
    ease: 'Quad.easeOut',
    onComplete: () => { animEvent.destroy(); sprite.destroy(); },
  });
}

/**
 * Play an impact FX spritesheet animation at a position.
 * Used by IronFists, SacredShield, etc.
 */
export function playImpactFX(
  scene: Phaser.Scene,
  x: number, y: number,
  angle: number,
  textureKey: string,
  scale: number,
  tint: number,
  duration: number,
): void {
  if (!scene.textures.exists(textureKey)) return;

  const sprite = scene.add.sprite(x, y, textureKey, 0);
  sprite.setDepth(DEPTHS.EFFECTS);
  sprite.setScale(scale);
  sprite.setRotation(angle);
  sprite.setTint(tint);
  sprite.setBlendMode(Phaser.BlendModes.ADD);
  sprite.setAlpha(0.8);

  const totalFrames = sprite.texture.frameTotal - 1;
  let frame = 0;
  const animEvent = scene.time.addEvent({
    delay: Math.floor(duration / Math.max(totalFrames, 1)),
    repeat: totalFrames - 1,
    callback: () => {
      frame++;
      if (sprite.active && frame < totalFrames) {
        sprite.setFrame(frame);
      }
    },
  });

  scene.tweens.add({
    targets: sprite,
    alpha: 0,
    scaleX: scale * 0.5,
    scaleY: scale * 0.5,
    duration,
    ease: 'Quad.easeOut',
    onComplete: () => { animEvent.destroy(); sprite.destroy(); },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WEAPON IN-HAND SPRITE — show weapon being held during attacks
// ═══════════════════════════════════════════════════════════════════════════

/** Maps each game WeaponId to its in-hand sprite texture key */
const WEAPON_INHAND_MAP: Partial<Record<WeaponId, string>> = {
  [WeaponId.KATANA]:          'inhand_katana',
  [WeaponId.BATTLE_AXE]:      'inhand_axe',
  [WeaponId.DARK_CLAYMORE]:   'inhand_bigsword',
  [WeaponId.WAR_LANCE]:       'inhand_lance',
  [WeaponId.IRON_FISTS]:      'inhand_ninjaku',
  [WeaponId.SACRED_SHIELD]:   'inhand_hammer',
  [WeaponId.HUNTERS_BOW]:     'inhand_bow',
  [WeaponId.FIRE_ROD]:        'inhand_wand',
  [WeaponId.HOLY_ROD]:        'inhand_wand',
  [WeaponId.ETHER_ROD]:       'inhand_wand',
  [WeaponId.CHRONO_ROD]:      'inhand_wand',
  [WeaponId.EARTH_ROD]:       'inhand_stick',
  [WeaponId.WAR_HARP]:        'inhand_fork',
  [WeaponId.FLASK_THROW]:     'inhand_book',
};

/**
 * Show the weapon in-hand sprite during an attack.
 * Snaps to 4 cardinal directions (matching Attack.png), follows the player,
 * and disappears cleanly when the attack ends (no ghost/fade).
 */
export function showWeaponInHand(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  angle: number,
  weaponId: WeaponId,
  duration = 200,
): void {
  const textureKey = WEAPON_INHAND_MAP[weaponId];
  if (!textureKey || !scene.textures.exists(textureKey)) return;

  // Snap angle to 4 cardinal directions (same logic as showAttackSprite)
  const deg = ((angle * 180 / Math.PI) % 360 + 360) % 360;
  let rot: number;
  let offX: number;
  let offY: number;
  let behindPlayer = false;

  // In-hand sprites point "down" by default (handle at top, blade at bottom).
  // DOWN=0, RIGHT=-π/2, LEFT=π/2, UP=π
  if (deg >= 315 || deg < 45) {
    // RIGHT
    rot = -Math.PI / 2;
    offX = 10; offY = 2;
  } else if (deg >= 45 && deg < 135) {
    // DOWN
    rot = 0;
    offX = 4; offY = 10;
  } else if (deg >= 135 && deg < 225) {
    // LEFT
    rot = Math.PI / 2;
    offX = -10; offY = 2;
  } else {
    // UP
    rot = Math.PI;
    offX = -4; offY = -6;
    behindPlayer = true;
  }

  const sx = offX * SPRITE_SCALE;
  const sy = offY * SPRITE_SCALE;

  const weapon = scene.add.image(player.x + sx, player.y + sy, textureKey);
  weapon.setDepth(behindPlayer ? DEPTHS.PLAYER - 1 : DEPTHS.PLAYER + 1);
  weapon.setScale(SPRITE_SCALE);
  weapon.setRotation(rot);

  // Follow the player during the attack
  const followEvent = scene.time.addEvent({
    delay: 16,
    repeat: Math.ceil(duration / 16),
    callback: () => {
      if (weapon.active && player.active) {
        weapon.setPosition(player.x + sx, player.y + sy);
      }
    },
  });

  // Remove weapon when attack ends — no fade, no ghost
  scene.time.delayedCall(duration, () => {
    followEvent.destroy();
    if (weapon.active) weapon.destroy();
  });
}
