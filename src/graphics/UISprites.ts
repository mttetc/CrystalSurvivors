import { SPRITE_SCALE } from '../constants';

export function generateUITextures(scene: Phaser.Scene): void {
  // Enhancement card background
  const cardW = 80, cardH = 100;
  const canvas = scene.textures.createCanvas('card_bg', cardW, cardH)!;
  const ctx = canvas.context;

  // Card body
  ctx.fillStyle = '#1A1A2E';
  ctx.fillRect(0, 0, cardW, cardH);
  // Border
  ctx.strokeStyle = '#4488CC';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, cardW - 2, cardH - 2);
  // Header area
  ctx.fillStyle = '#223355';
  ctx.fillRect(2, 2, cardW - 4, 20);

  canvas.refresh();

  // Card highlight (selected)
  const canvas2 = scene.textures.createCanvas('card_bg_selected', cardW, cardH)!;
  const ctx2 = canvas2.context;
  ctx2.fillStyle = '#1A2A3E';
  ctx2.fillRect(0, 0, cardW, cardH);
  ctx2.strokeStyle = '#88CCFF';
  ctx2.lineWidth = 2;
  ctx2.strokeRect(1, 1, cardW - 2, cardH - 2);
  ctx2.fillStyle = '#334466';
  ctx2.fillRect(2, 2, cardW - 4, 20);
  canvas2.refresh();

  // Weapon icons (small 12x12)
  generateWeaponIcon(scene, 'icon_pulse_pistol', '#FFDD44', (ctx, s) => {
    ctx.fillRect(2, 3, 8, 3);
    ctx.fillRect(4, 1, 4, 2);
    ctx.fillRect(5, 6, 3, 3);
  });
  generateWeaponIcon(scene, 'icon_orbital_shield', '#44DDFF', (ctx, s) => {
    ctx.strokeStyle = '#44DDFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillRect(5, 5, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_nova_burst', '#FFFFFF', (ctx, s) => {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(6, 6, 2, 0, Math.PI * 2);
    ctx.stroke();
  });
  generateWeaponIcon(scene, 'icon_piercing_beam', '#FF4444', (ctx, s) => {
    ctx.fillRect(1, 5, 10, 2);
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(1, 5, 10, 1);
  });
  generateWeaponIcon(scene, 'icon_chain_lightning', '#88BBFF', (ctx, s) => {
    ctx.beginPath();
    ctx.moveTo(2, 1);
    ctx.lineTo(5, 4);
    ctx.lineTo(3, 5);
    ctx.lineTo(8, 10);
    ctx.lineTo(6, 6);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();
  });
  generateWeaponIcon(scene, 'icon_shuriken', '#CCCCCC', (ctx, s) => {
    // 4-pointed star
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(7, 5);
    ctx.lineTo(12, 6);
    ctx.lineTo(7, 7);
    ctx.lineTo(6, 12);
    ctx.lineTo(5, 7);
    ctx.lineTo(0, 6);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
  });
  generateWeaponIcon(scene, 'icon_spectral_sword', '#44FFCC', (ctx, s) => {
    // Sword blade
    ctx.fillRect(5, 0, 2, 8);
    // Crossguard
    ctx.fillRect(3, 7, 6, 2);
    // Handle
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(5, 9, 2, 3);
  });
  generateWeaponIcon(scene, 'icon_throwing_axe', '#FFAA44', (ctx, s) => {
    // Handle
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(5, 4, 2, 8);
    // Axe head
    ctx.fillStyle = '#FFAA44';
    ctx.fillRect(2, 0, 8, 4);
    ctx.fillRect(1, 1, 10, 2);
  });

  // Stat boost icons (12x12 each, distinct shapes and colors)
  generateWeaponIcon(scene, 'icon_vitality', '#FF4466', (ctx, s) => {
    // Heart shape
    ctx.beginPath();
    ctx.moveTo(6, 10);
    ctx.lineTo(1, 5);
    ctx.lineTo(1, 3);
    ctx.lineTo(3, 1);
    ctx.lineTo(6, 4);
    ctx.lineTo(9, 1);
    ctx.lineTo(11, 3);
    ctx.lineTo(11, 5);
    ctx.closePath();
    ctx.fill();
  });
  generateWeaponIcon(scene, 'icon_swift_feet', '#44DDFF', (ctx, s) => {
    // Boot with wing
    ctx.fillRect(3, 3, 4, 7);
    ctx.fillRect(3, 9, 7, 2);
    ctx.fillRect(7, 8, 3, 1);
    // Wing
    ctx.fillStyle = '#88EEFF';
    ctx.fillRect(1, 2, 2, 1);
    ctx.fillRect(0, 3, 3, 1);
    ctx.fillRect(1, 4, 2, 1);
  });
  generateWeaponIcon(scene, 'icon_magnet', '#FF44FF', (ctx, s) => {
    // U-magnet shape
    ctx.fillRect(2, 1, 3, 8);
    ctx.fillRect(7, 1, 3, 8);
    ctx.fillRect(2, 8, 8, 3);
    // Gap in middle
    ctx.clearRect(5, 1, 2, 8);
    ctx.clearRect(4, 4, 4, 4);
    // Pole tips
    ctx.fillStyle = '#CC33CC';
    ctx.fillRect(2, 1, 3, 2);
    ctx.fillRect(7, 1, 3, 2);
  });
  generateWeaponIcon(scene, 'icon_scholar', '#FFDD44', (ctx, s) => {
    // Book shape
    ctx.fillRect(2, 2, 8, 8);
    ctx.fillStyle = '#CCAA22';
    ctx.fillRect(2, 2, 1, 8);
    // Pages
    ctx.fillStyle = '#FFFFCC';
    ctx.fillRect(4, 3, 5, 6);
    // Text lines
    ctx.fillStyle = '#CCAA44';
    ctx.fillRect(5, 4, 3, 1);
    ctx.fillRect(5, 6, 3, 1);
    ctx.fillRect(5, 8, 2, 1);
  });
  generateWeaponIcon(scene, 'icon_rapid_fire', '#FF8844', (ctx, s) => {
    // Double arrow (fast-forward style)
    ctx.beginPath();
    ctx.moveTo(1, 2);
    ctx.lineTo(6, 6);
    ctx.lineTo(1, 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, 2);
    ctx.lineTo(11, 6);
    ctx.lineTo(6, 10);
    ctx.closePath();
    ctx.fill();
  });
  generateWeaponIcon(scene, 'icon_power_surge', '#FF4444', (ctx, s) => {
    // Fist/star burst
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(7, 4);
    ctx.lineTo(11, 3);
    ctx.lineTo(8, 6);
    ctx.lineTo(12, 9);
    ctx.lineTo(8, 8);
    ctx.lineTo(6, 12);
    ctx.lineTo(4, 8);
    ctx.lineTo(0, 9);
    ctx.lineTo(4, 6);
    ctx.lineTo(1, 3);
    ctx.lineTo(5, 4);
    ctx.closePath();
    ctx.fill();
  });
  generateWeaponIcon(scene, 'icon_iron_skin', '#8888CC', (ctx, s) => {
    // Shield shape
    ctx.beginPath();
    ctx.moveTo(6, 11);
    ctx.lineTo(1, 7);
    ctx.lineTo(1, 2);
    ctx.lineTo(6, 1);
    ctx.lineTo(11, 2);
    ctx.lineTo(11, 7);
    ctx.closePath();
    ctx.fill();
    // Inner highlight
    ctx.fillStyle = '#9999DD';
    ctx.fillRect(5, 3, 2, 2);
    ctx.fillRect(4, 5, 4, 1);
  });
  generateWeaponIcon(scene, 'icon_regen', '#44FF88', (ctx, s) => {
    // Plus/cross
    ctx.fillRect(4, 1, 4, 10);
    ctx.fillRect(1, 4, 10, 4);
  });
  generateWeaponIcon(scene, 'icon_lucky_find', '#FFFF44', (ctx, s) => {
    // Diamond/clover shape
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(10, 6);
    ctx.lineTo(6, 12);
    ctx.lineTo(2, 6);
    ctx.closePath();
    ctx.fill();
    // Inner sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_adrenaline', '#FF6644', (ctx, s) => {
    // Lightning bolt
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(3, 5);
    ctx.lineTo(6, 5);
    ctx.lineTo(4, 12);
    ctx.lineTo(10, 5);
    ctx.lineTo(7, 5);
    ctx.lineTo(9, 0);
    ctx.closePath();
    ctx.fill();
  });

  // New weapon icons
  generateWeaponIcon(scene, 'icon_bone_lance', '#EEEEDD', (ctx, s) => {
    ctx.fillRect(1, 5, 10, 2);
    ctx.fillRect(0, 4, 2, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 5, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_poison_dagger', '#88CC44', (ctx, s) => {
    ctx.fillRect(5, 0, 2, 8);
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(4, 8, 4, 3);
    ctx.fillStyle = '#AAFF66';
    ctx.fillRect(5, 1, 1, 3);
  });
  generateWeaponIcon(scene, 'icon_holy_cross', '#FFD700', (ctx, s) => {
    ctx.fillRect(5, 0, 2, 12);
    ctx.fillRect(2, 3, 8, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 3, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_homing_orb', '#AA66FF', (ctx, s) => {
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DD99FF';
    ctx.beginPath();
    ctx.arc(6, 6, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  generateWeaponIcon(scene, 'icon_flame_whip', '#FF6600', (ctx, s) => {
    ctx.strokeStyle = '#FF6600';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(6, 6, 4, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
    ctx.fillStyle = '#FFCC00';
    ctx.fillRect(9, 5, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_frost_nova', '#88CCFF', (ctx, s) => {
    ctx.strokeStyle = '#88CCFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 2, 2);
    // Ice crystals
    ctx.fillStyle = '#AADDFF';
    ctx.fillRect(6, 1, 1, 2);
    ctx.fillRect(6, 9, 1, 2);
    ctx.fillRect(1, 6, 2, 1);
    ctx.fillRect(9, 6, 2, 1);
  });
  generateWeaponIcon(scene, 'icon_death_aura', '#9944CC', (ctx, s) => {
    ctx.strokeStyle = '#9944CC';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#6622AA';
    ctx.beginPath();
    ctx.arc(6, 6, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // ─── Weapon icons (14 weapons) ──────────────────────────────────
  generateWeaponIcon(scene, 'icon_hunters_bow', '#228B22', (ctx, s) => {
    // Bow curve
    ctx.strokeStyle = '#228B22'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(4, 6, 5, -Math.PI * 0.6, Math.PI * 0.6); ctx.stroke();
    // Arrow
    ctx.fillStyle = '#DDDDDD'; ctx.fillRect(4, 5, 7, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(10, 5, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_sacred_shield', '#FFD700', (ctx, s) => {
    ctx.beginPath();
    ctx.moveTo(6, 11); ctx.lineTo(1, 7); ctx.lineTo(1, 2);
    ctx.lineTo(6, 1); ctx.lineTo(11, 2); ctx.lineTo(11, 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 3, 2, 5); ctx.fillRect(3, 5, 6, 2);
  });
  generateWeaponIcon(scene, 'icon_fire_rod', '#FF4400', (ctx, s) => {
    // Rod shaft
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 4, 2, 8);
    // Flame tip
    ctx.fillStyle = '#FF6600'; ctx.fillRect(4, 1, 4, 4);
    ctx.fillStyle = '#FFAA00'; ctx.fillRect(5, 2, 2, 2);
    ctx.fillStyle = '#FFDD44'; ctx.fillRect(5, 0, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_dark_claymore', '#8B0000', (ctx, s) => {
    // Blade
    ctx.fillStyle = '#AAAAAA'; ctx.fillRect(5, 0, 2, 8);
    // Guard
    ctx.fillStyle = '#8B0000'; ctx.fillRect(3, 7, 6, 2);
    // Handle
    ctx.fillStyle = '#440000'; ctx.fillRect(5, 9, 2, 3);
    // Dark glow
    ctx.fillStyle = '#FF0000'; ctx.fillRect(5, 0, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_war_harp', '#DAA520', (ctx, s) => {
    ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(6, 5, 4, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.fillRect(2, 5, 2, 6); ctx.fillRect(8, 5, 2, 6);
    ctx.fillStyle = '#FFDD88';
    ctx.fillRect(4, 6, 1, 4); ctx.fillRect(6, 6, 1, 4); ctx.fillRect(8, 6, 1, 4);
  });
  generateWeaponIcon(scene, 'icon_katana', '#B22222', (ctx, s) => {
    ctx.fillStyle = '#DDDDDD'; ctx.fillRect(5, 0, 2, 7);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 0, 1, 2);
    ctx.fillStyle = '#B22222'; ctx.fillRect(3, 7, 6, 2);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 9, 2, 3);
  });
  generateWeaponIcon(scene, 'icon_battle_axe', '#DC143C', (ctx, s) => {
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 4, 2, 8);
    ctx.fillStyle = '#DC143C'; ctx.fillRect(1, 0, 10, 4);
    ctx.fillRect(0, 1, 12, 2);
  });
  generateWeaponIcon(scene, 'icon_war_lance', '#4169E1', (ctx, s) => {
    ctx.fillRect(5, 0, 2, 10);
    ctx.fillStyle = '#88AAFF';
    ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(3, 3); ctx.lineTo(9, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4169E1'; ctx.fillRect(4, 10, 4, 2);
  });
  generateWeaponIcon(scene, 'icon_flask_throw', '#32CD32', (ctx, s) => {
    ctx.fillRect(4, 0, 4, 2);
    ctx.fillRect(3, 2, 6, 8);
    ctx.fillStyle = '#66FF66'; ctx.fillRect(4, 4, 4, 5);
    ctx.fillStyle = '#AAFFAA'; ctx.fillRect(5, 5, 2, 2);
  });
  generateWeaponIcon(scene, 'icon_holy_rod', '#FFFFFF', (ctx, s) => {
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 4, 2, 8);
    ctx.fillStyle = '#FFFFCC';
    ctx.beginPath(); ctx.arc(6, 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(6, 3, 1.5, 0, Math.PI * 2); ctx.fill();
  });
  generateWeaponIcon(scene, 'icon_ether_rod', '#AA66FF', (ctx, s) => {
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 4, 2, 8);
    ctx.fillStyle = '#AA66FF';
    ctx.beginPath(); ctx.arc(6, 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#DD99FF';
    ctx.beginPath(); ctx.arc(6, 3, 1.5, 0, Math.PI * 2); ctx.fill();
  });
  generateWeaponIcon(scene, 'icon_iron_fists', '#FF8C00', (ctx, s) => {
    ctx.fillStyle = '#FFAA33'; ctx.fillRect(2, 3, 8, 5);
    ctx.fillStyle = '#FFCC44';
    ctx.fillRect(2, 2, 2, 2); ctx.fillRect(5, 2, 2, 2); ctx.fillRect(8, 2, 2, 2);
    ctx.fillStyle = '#CC7700';
    ctx.fillRect(4, 4, 1, 3); ctx.fillRect(7, 4, 1, 3);
    ctx.fillStyle = '#FF8C00'; ctx.fillRect(3, 8, 6, 3);
  });
  generateWeaponIcon(scene, 'icon_chrono_rod', '#9370DB', (ctx, s) => {
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 5, 2, 7);
    ctx.strokeStyle = '#9370DB'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(6, 4, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#9370DB';
    ctx.fillRect(5, 2, 2, 3); ctx.fillRect(5, 3, 3, 2);
  });
  generateWeaponIcon(scene, 'icon_earth_rod', '#8B4513', (ctx, s) => {
    ctx.fillStyle = '#5A3A1A'; ctx.fillRect(5, 4, 2, 8);
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(9, 4); ctx.lineTo(6, 5); ctx.lineTo(3, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#DEB887'; ctx.fillRect(5, 2, 2, 2);
  });

  // ─── Stat icons (12) ──────────────────────────────────────────────
  generateWeaponIcon(scene, 'stat_power', '#FF4444', (ctx, s) => {
    // Sword
    ctx.fillRect(5, 0, 2, 8);
    ctx.fillRect(3, 3, 6, 2);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 8, 2, 4);
  });
  generateWeaponIcon(scene, 'stat_speed', '#FFFF44', (ctx, s) => {
    // Lightning bolt
    ctx.beginPath();
    ctx.moveTo(7, 0); ctx.lineTo(3, 5); ctx.lineTo(6, 5);
    ctx.lineTo(4, 12); ctx.lineTo(10, 5); ctx.lineTo(7, 5);
    ctx.lineTo(9, 0); ctx.closePath(); ctx.fill();
  });
  generateWeaponIcon(scene, 'stat_armor', '#8888CC', (ctx, s) => {
    // Shield
    ctx.beginPath();
    ctx.moveTo(6, 11); ctx.lineTo(1, 7); ctx.lineTo(1, 2);
    ctx.lineTo(6, 1); ctx.lineTo(11, 2); ctx.lineTo(11, 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9999DD'; ctx.fillRect(5, 3, 2, 2);
  });
  generateWeaponIcon(scene, 'stat_hp', '#FF4466', (ctx, s) => {
    // Heart
    ctx.beginPath();
    ctx.moveTo(6, 10); ctx.lineTo(1, 5); ctx.lineTo(1, 3);
    ctx.lineTo(3, 1); ctx.lineTo(6, 4);
    ctx.lineTo(9, 1); ctx.lineTo(11, 3); ctx.lineTo(11, 5);
    ctx.closePath(); ctx.fill();
  });
  generateWeaponIcon(scene, 'stat_regen', '#44FF88', (ctx, s) => {
    // Green cross
    ctx.fillRect(4, 1, 4, 10);
    ctx.fillRect(1, 4, 10, 4);
  });
  generateWeaponIcon(scene, 'stat_move', '#44DDFF', (ctx, s) => {
    // Boot
    ctx.fillRect(3, 2, 4, 7);
    ctx.fillRect(3, 8, 7, 2);
    ctx.fillRect(7, 7, 3, 1);
    ctx.fillStyle = '#88EEFF';
    ctx.fillRect(1, 1, 2, 1); ctx.fillRect(0, 2, 3, 1); ctx.fillRect(1, 3, 2, 1);
  });
  generateWeaponIcon(scene, 'stat_magnet', '#FF44FF', (ctx, s) => {
    // U-magnet
    ctx.fillRect(2, 1, 3, 6);
    ctx.fillRect(7, 1, 3, 6);
    ctx.fillRect(2, 7, 8, 3);
    ctx.clearRect(5, 1, 2, 6);
    ctx.clearRect(4, 3, 4, 4);
    ctx.fillStyle = '#CC33CC';
    ctx.fillRect(2, 1, 3, 2); ctx.fillRect(7, 1, 3, 2);
  });
  generateWeaponIcon(scene, 'stat_crit', '#FFAA00', (ctx, s) => {
    // Star
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(7, 4); ctx.lineTo(12, 5);
    ctx.lineTo(8, 7); ctx.lineTo(9, 12);
    ctx.lineTo(6, 9); ctx.lineTo(3, 12);
    ctx.lineTo(4, 7); ctx.lineTo(0, 5);
    ctx.lineTo(5, 4); ctx.closePath(); ctx.fill();
  });
  generateWeaponIcon(scene, 'stat_gem', '#44FF44', (ctx, s) => {
    // Diamond gem
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(10, 4); ctx.lineTo(6, 11); ctx.lineTo(2, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#88FF88'; ctx.fillRect(5, 3, 2, 3);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 3, 1, 1);
  });
  generateWeaponIcon(scene, 'stat_xp', '#FFDD44', (ctx, s) => {
    // Book
    ctx.fillRect(2, 2, 8, 8);
    ctx.fillStyle = '#CCAA22'; ctx.fillRect(2, 2, 1, 8);
    ctx.fillStyle = '#FFFFCC'; ctx.fillRect(4, 3, 5, 6);
    ctx.fillStyle = '#CCAA44';
    ctx.fillRect(5, 4, 3, 1); ctx.fillRect(5, 6, 3, 1); ctx.fillRect(5, 8, 2, 1);
  });
  generateWeaponIcon(scene, 'stat_range', '#88CCFF', (ctx, s) => {
    // Expanding circles
    ctx.strokeStyle = '#88CCFF'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillRect(5, 5, 2, 2);
  });
  generateWeaponIcon(scene, 'stat_damage', '#FF6644', (ctx, s) => {
    // Explosion burst
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(7, 4); ctx.lineTo(11, 3);
    ctx.lineTo(8, 6); ctx.lineTo(12, 9); ctx.lineTo(8, 8);
    ctx.lineTo(6, 12); ctx.lineTo(4, 8); ctx.lineTo(0, 9);
    ctx.lineTo(4, 6); ctx.lineTo(1, 3); ctx.lineTo(5, 4);
    ctx.closePath(); ctx.fill();
  });

  // ─── Family icons (6) ─────────────────────────────────────────────
  generateWeaponIcon(scene, 'family_projectile', '#88CCFF', (ctx, s) => {
    // Arrow flying right
    ctx.fillRect(1, 5, 8, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(11, 6); ctx.lineTo(8, 3); ctx.lineTo(8, 9);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6699CC'; ctx.fillRect(1, 4, 2, 1); ctx.fillRect(1, 7, 2, 1);
  });
  generateWeaponIcon(scene, 'family_magic', '#AA44FF', (ctx, s) => {
    // Arcane circle
    ctx.strokeStyle = '#AA44FF'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#DD88FF';
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillRect(5, 1, 2, 1); ctx.fillRect(5, 10, 2, 1);
    ctx.fillRect(1, 5, 1, 2); ctx.fillRect(10, 5, 1, 2);
  });
  generateWeaponIcon(scene, 'family_melee', '#FF8844', (ctx, s) => {
    // Crossed swords
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(1, 1, 2, 8); ctx.fillRect(9, 1, 2, 8);
    ctx.fillStyle = '#FF8844';
    ctx.fillRect(0, 8, 4, 2); ctx.fillRect(8, 8, 4, 2);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(1, 10, 2, 2); ctx.fillRect(9, 10, 2, 2);
  });
  generateWeaponIcon(scene, 'family_aura', '#44DDFF', (ctx, s) => {
    // Radiating rings
    ctx.strokeStyle = '#44DDFF'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, 6, 1, 0, Math.PI * 2); ctx.stroke();
  });
  generateWeaponIcon(scene, 'family_support', '#44FF88', (ctx, s) => {
    // Healing cross with sparkle
    ctx.fillRect(4, 1, 4, 10);
    ctx.fillRect(1, 4, 10, 4);
    ctx.fillStyle = '#88FFAA'; ctx.fillRect(5, 5, 2, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 2, 1, 1); ctx.fillRect(2, 5, 1, 1);
  });
  generateWeaponIcon(scene, 'family_summoning', '#FF69B4', (ctx, s) => {
    // Summoning circle
    ctx.strokeStyle = '#FF69B4'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    // Inner triangle
    ctx.beginPath();
    ctx.moveTo(6, 1); ctx.lineTo(10, 9); ctx.lineTo(2, 9); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = '#FFAADD'; ctx.fillRect(5, 5, 2, 2);
  });

  // ─── Special icons (3) ────────────────────────────────────────────
  generateWeaponIcon(scene, 'icon_awakening', '#FFAA00', (ctx, s) => {
    // Flame burst / awakening fire
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(3, 4, 6, 6);
    ctx.fillRect(4, 2, 4, 3);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(4, 3, 4, 5);
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(5, 4, 2, 3);
    ctx.fillRect(5, 1, 2, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 0, 2, 2);
    // Side flames
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(1, 5, 2, 3); ctx.fillRect(9, 5, 2, 3);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(0, 6, 2, 1); ctx.fillRect(10, 6, 2, 1);
  });
  generateWeaponIcon(scene, 'icon_malus', '#CC4444', (ctx, s) => {
    // Skull
    ctx.fillRect(3, 2, 6, 6);
    ctx.fillRect(4, 1, 4, 1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 3, 2, 2); ctx.fillRect(7, 3, 2, 2);
    ctx.fillStyle = '#CC4444';
    ctx.fillRect(5, 6, 2, 1);
    // Jaw
    ctx.fillStyle = '#AA3333'; ctx.fillRect(4, 8, 4, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 8, 1, 1); ctx.fillRect(6, 8, 1, 1); ctx.fillRect(8, 8, 1, 1);
  });
  generateWeaponIcon(scene, 'stat_synergy', '#FFAA44', (ctx, s) => {
    // Interlinked rings
    ctx.strokeStyle = '#FFAA44'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(4, 6, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(8, 6, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#FFDD88'; ctx.fillRect(5, 5, 2, 2);
  });

  // Job icons (14x14)
  generateJobIconTextures(scene);

  // Skill icons (12x12 placeholders based on job color)
  generateSkillIconTextures(scene);

  // Ground tile texture
  generateGroundTile(scene);

  // Chest textures (per rarity)
  generateChestTexture(scene, 'chest_common', '#888888', '#666666');
  generateChestTexture(scene, 'chest_rare', '#4488FF', '#2255BB');
  generateChestTexture(scene, 'chest_epic', '#AA44FF', '#7722BB');
  generateChestTexture(scene, 'chest_legendary', '#FFAA00', '#CC7700');
}

function generateWeaponIcon(
  scene: Phaser.Scene,
  key: string,
  color: string,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
): void {
  const s = 12;
  const canvas = scene.textures.createCanvas(key, s * SPRITE_SCALE, s * SPRITE_SCALE)!;
  const ctx = canvas.context;
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);
  ctx.fillStyle = color;
  draw(ctx, s);
  canvas.refresh();
}

function generateGroundTile(scene: Phaser.Scene): void {
  const T = 64;
  const canvas = scene.textures.createCanvas('ground_tile', T * SPRITE_SCALE, T * SPRITE_SCALE)!;
  const ctx = canvas.context;
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

  // Dark ground base
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, T, T);

  // Noise
  const rng = mulberry32(42);
  for (let py = 0; py < T; py += 2) {
    for (let px = 0; px < T; px += 2) {
      const r = rng();
      if (r < 0.15) {
        ctx.fillStyle = '#151525';
        ctx.fillRect(px, py, 2, 2);
      } else if (r < 0.25) {
        ctx.fillStyle = '#1f1f35';
        ctx.fillRect(px, py, 2, 2);
      }
    }
  }

  // Subtle grid lines
  ctx.fillStyle = '#161628';
  for (let i = 0; i < T; i += 16) {
    ctx.fillRect(i, 0, 1, T);
    ctx.fillRect(0, i, T, 1);
  }

  canvas.refresh();
}

function generateChestTexture(scene: Phaser.Scene, key: string, highlight: string, body: string): void {
  const s = 14;
  const canvas = scene.textures.createCanvas(key, s * SPRITE_SCALE, s * SPRITE_SCALE)!;
  const ctx = canvas.context;
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

  // Chest body
  ctx.fillStyle = body;
  ctx.fillRect(1, 4, s - 2, s - 5);
  // Chest lid
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 2, s, 4);
  // Lock
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(s / 2 - 1, 5, 3, 3);
  // Keyhole
  ctx.fillStyle = '#000000';
  ctx.fillRect(s / 2, 6, 1, 1);
  // Rim
  ctx.fillStyle = highlight;
  ctx.fillRect(0, s - 2, s, 2);

  canvas.refresh();
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateJobIcon(
  scene: Phaser.Scene, key: string, color: string,
  draw: (ctx: CanvasRenderingContext2D) => void,
): void {
  const s = 14;
  const canvas = scene.textures.createCanvas(key, s * SPRITE_SCALE, s * SPRITE_SCALE)!;
  const ctx = canvas.context;
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);
  ctx.fillStyle = color;
  draw(ctx);
  canvas.refresh();
}

function generateJobIconTextures(scene: Phaser.Scene): void {
  generateJobIcon(scene, 'job_paladin', '#FFD700', (ctx) => {
    // Shield
    ctx.beginPath();
    ctx.moveTo(7, 12); ctx.lineTo(2, 8); ctx.lineTo(2, 3); ctx.lineTo(7, 1); ctx.lineTo(12, 3); ctx.lineTo(12, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(6, 4, 2, 5); ctx.fillRect(4, 6, 6, 2);
  });
  generateJobIcon(scene, 'job_dark_knight', '#8B0000', (ctx) => {
    // Dark sword
    ctx.fillRect(6, 0, 2, 10);
    ctx.fillRect(3, 3, 8, 2);
    ctx.fillStyle = '#FF0000'; ctx.fillRect(6, 0, 2, 2);
    ctx.fillStyle = '#440000'; ctx.fillRect(5, 10, 4, 3);
  });
  generateJobIcon(scene, 'job_dragoon', '#4169E1', (ctx) => {
    // Lance
    ctx.fillRect(6, 0, 2, 12);
    ctx.fillStyle = '#88AAFF'; ctx.fillRect(5, 0, 4, 3);
    ctx.fillStyle = '#2244AA'; ctx.fillRect(5, 10, 4, 2);
    // Wings
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(1, 4, 4, 2); ctx.fillRect(9, 4, 4, 2);
  });
  generateJobIcon(scene, 'job_ninja', '#9400D3', (ctx) => {
    // Shuriken star
    ctx.beginPath();
    ctx.moveTo(7, 0); ctx.lineTo(8, 6); ctx.lineTo(14, 7); ctx.lineTo(8, 8);
    ctx.lineTo(7, 14); ctx.lineTo(6, 8); ctx.lineTo(0, 7); ctx.lineTo(6, 6);
    ctx.closePath(); ctx.fill();
  });
  generateJobIcon(scene, 'job_monk', '#FF8C00', (ctx) => {
    // Fist
    ctx.fillRect(3, 3, 8, 6);
    ctx.fillRect(4, 2, 6, 1); ctx.fillRect(4, 9, 6, 2);
    ctx.fillStyle = '#CC6600'; ctx.fillRect(5, 4, 2, 4);
    ctx.fillStyle = '#FFAA44'; ctx.fillRect(3, 3, 2, 2);
  });
  generateJobIcon(scene, 'job_berserker', '#DC143C', (ctx) => {
    // Axe
    ctx.fillStyle = '#8B4513'; ctx.fillRect(6, 4, 2, 10);
    ctx.fillStyle = '#DC143C'; ctx.fillRect(2, 0, 10, 5); ctx.fillRect(1, 1, 12, 3);
  });
  generateJobIcon(scene, 'job_ranger', '#228B22', (ctx) => {
    // Bow
    ctx.strokeStyle = '#228B22'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(5, 7, 5, -Math.PI * 0.6, Math.PI * 0.6); ctx.stroke();
    // Arrow
    ctx.fillStyle = '#DDDDDD'; ctx.fillRect(5, 6, 8, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(12, 6, 2, 2);
  });
  generateJobIcon(scene, 'job_bard', '#DAA520', (ctx) => {
    // Harp
    ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(7, 5, 4, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.fillRect(3, 5, 2, 7); ctx.fillRect(9, 5, 2, 7);
    // Strings
    ctx.fillStyle = '#FFDD88'; ctx.fillRect(5, 6, 1, 5); ctx.fillRect(7, 6, 1, 5);
  });
  generateJobIcon(scene, 'job_black_mage', '#191970', (ctx) => {
    // Pointy hat
    ctx.fillRect(3, 6, 8, 6);
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(3, 6); ctx.lineTo(11, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFDD44'; ctx.fillRect(5, 8, 1, 1); ctx.fillRect(8, 8, 1, 1);
    ctx.fillStyle = '#4444AA'; ctx.fillRect(4, 5, 6, 1);
  });
  generateJobIcon(scene, 'job_white_mage', '#FFFFFF', (ctx) => {
    // Luminous cross
    ctx.fillRect(6, 1, 2, 12);
    ctx.fillRect(2, 5, 10, 2);
    ctx.fillStyle = '#FFFF88'; ctx.fillRect(6, 5, 2, 2);
  });
  generateJobIcon(scene, 'job_summoner', '#FF69B4', (ctx) => {
    // Crystal
    ctx.beginPath();
    ctx.moveTo(7, 0); ctx.lineTo(12, 7); ctx.lineTo(7, 14); ctx.lineTo(2, 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFAADD'; ctx.fillRect(6, 5, 2, 4);
  });
  generateJobIcon(scene, 'job_time_mage', '#9370DB', (ctx) => {
    // Clock
    ctx.strokeStyle = '#9370DB'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(7, 7, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#9370DB';
    ctx.fillRect(6, 3, 2, 5); ctx.fillRect(6, 6, 4, 2);
  });
  generateJobIcon(scene, 'job_alchemist', '#32CD32', (ctx) => {
    // Potion flask
    ctx.fillRect(5, 0, 4, 3);
    ctx.fillRect(3, 3, 8, 9);
    ctx.fillRect(2, 5, 10, 7);
    ctx.fillStyle = '#66FF66'; ctx.fillRect(4, 6, 6, 5);
    ctx.fillStyle = '#AAFFAA'; ctx.fillRect(5, 7, 2, 2);
  });
  generateJobIcon(scene, 'job_geomancer', '#8B4513', (ctx) => {
    // Crystal/rock
    ctx.fillRect(3, 4, 8, 8);
    ctx.fillStyle = '#A0522D'; ctx.fillRect(5, 2, 4, 2);
    ctx.fillStyle = '#CD853F'; ctx.fillRect(4, 5, 3, 4);
    ctx.fillStyle = '#DEB887'; ctx.fillRect(5, 6, 2, 2);
  });
  generateJobIcon(scene, 'job_samurai', '#B22222', (ctx) => {
    // Katana
    ctx.fillStyle = '#DDDDDD'; ctx.fillRect(3, 0, 2, 9);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(3, 0, 2, 2);
    ctx.fillStyle = '#B22222'; ctx.fillRect(2, 9, 4, 2);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(3, 11, 2, 3);
  });
}

function generateSkillIconTextures(scene: Phaser.Scene): void {
  // ── Paladin skills ──────────────────────────────────────────────────
  // Holy Shield: golden shield with cross
  generateWeaponIcon(scene, 'skill_holy_shield', '#FFD700', (ctx) => {
    ctx.beginPath();
    ctx.moveTo(6, 11); ctx.lineTo(1, 7); ctx.lineTo(1, 2);
    ctx.lineTo(6, 1); ctx.lineTo(11, 2); ctx.lineTo(11, 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 3, 2, 6); ctx.fillRect(3, 5, 6, 2);
  });
  // Divine Guard: layered shield with glow
  generateWeaponIcon(scene, 'skill_divine_guard', '#FFD700', (ctx) => {
    ctx.beginPath();
    ctx.moveTo(6, 11); ctx.lineTo(1, 7); ctx.lineTo(1, 2);
    ctx.lineTo(6, 1); ctx.lineTo(11, 2); ctx.lineTo(11, 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.moveTo(6, 9); ctx.lineTo(3, 6); ctx.lineTo(3, 3);
    ctx.lineTo(6, 2); ctx.lineTo(9, 3); ctx.lineTo(9, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 4, 2, 2);
  });
  // Consecrate: radiant sun/halo
  generateWeaponIcon(scene, 'skill_consecrate', '#FFD700', (ctx) => {
    ctx.beginPath();
    ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.fill();
    // Rays
    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(5, 0, 2, 2); ctx.fillRect(5, 10, 2, 2);
    ctx.fillRect(0, 5, 2, 2); ctx.fillRect(10, 5, 2, 2);
    // Diagonal rays
    ctx.fillRect(1, 1, 2, 2); ctx.fillRect(9, 1, 2, 2);
    ctx.fillRect(1, 9, 2, 2); ctx.fillRect(9, 9, 2, 2);
  });

  // ── Dark Knight skills ──────────────────────────────────────────────
  // Abyssal Drain: dark orb with swirl
  generateWeaponIcon(scene, 'skill_abyssal_drain', '#8B0000', (ctx) => {
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(4, 5, 1, 2); ctx.fillRect(7, 5, 1, 2);
    ctx.strokeStyle = '#FF4444'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI); ctx.stroke();
  });
  // Dark Force: dark sword with aura
  generateWeaponIcon(scene, 'skill_dark_force', '#8B0000', (ctx) => {
    ctx.fillRect(5, 0, 2, 8);
    ctx.fillRect(3, 2, 6, 2);
    ctx.fillStyle = '#440000'; ctx.fillRect(5, 8, 2, 4);
    ctx.fillStyle = '#FF0000'; ctx.fillRect(5, 0, 2, 2);
    // Aura glow
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.fillRect(3, 0, 1, 8); ctx.fillRect(8, 0, 1, 8);
  });
  // Darkness: dark explosion
  generateWeaponIcon(scene, 'skill_darkness', '#8B0000', (ctx) => {
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#220000';
    ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI * 2); ctx.fill();
    // Dark sparks outward
    ctx.fillStyle = '#FF2200';
    ctx.fillRect(1, 5, 2, 1); ctx.fillRect(9, 6, 2, 1);
    ctx.fillRect(5, 1, 1, 2); ctx.fillRect(6, 9, 1, 2);
  });

  // ── Dragoon skills ──────────────────────────────────────────────────
  // Jump: upward arrow/lance
  generateWeaponIcon(scene, 'skill_jump', '#4169E1', (ctx) => {
    // Upward arrow
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(10, 5); ctx.lineTo(8, 5);
    ctx.lineTo(8, 11); ctx.lineTo(4, 11); ctx.lineTo(4, 5);
    ctx.lineTo(2, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#88BBFF'; ctx.fillRect(5, 1, 2, 3);
  });
  // Lance Mastery: lance with sparkle
  generateWeaponIcon(scene, 'skill_lance_mastery', '#4169E1', (ctx) => {
    ctx.fillRect(5, 0, 2, 10);
    ctx.fillStyle = '#88AAFF';
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(4, 3); ctx.lineTo(8, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4169E1'; ctx.fillRect(4, 10, 4, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 1, 1, 1);
  });
  // Dragon Dive: diving lance with flames
  generateWeaponIcon(scene, 'skill_dragon_dive', '#4169E1', (ctx) => {
    // Downward lance
    ctx.fillRect(5, 0, 2, 8);
    ctx.fillStyle = '#88AAFF';
    ctx.beginPath();
    ctx.moveTo(6, 10); ctx.lineTo(3, 6); ctx.lineTo(9, 6); ctx.closePath(); ctx.fill();
    // Flames on impact
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(2, 9, 3, 2); ctx.fillRect(7, 9, 3, 2);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(3, 8, 2, 2); ctx.fillRect(7, 8, 2, 2);
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(4, 10, 1, 1); ctx.fillRect(7, 10, 1, 1);
  });

  // ── Ninja skills ────────────────────────────────────────────────────
  // Katon: fire cone jutsu
  generateWeaponIcon(scene, 'skill_katon', '#FF4400', (ctx) => {
    // Fire cone shape expanding right
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.moveTo(2, 5); ctx.lineTo(11, 1); ctx.lineTo(11, 11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath();
    ctx.moveTo(3, 5); ctx.lineTo(10, 2); ctx.lineTo(10, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFDD44';
    ctx.beginPath();
    ctx.moveTo(4, 5); ctx.lineTo(8, 3); ctx.lineTo(8, 9); ctx.closePath(); ctx.fill();
    // Core
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 5, 2, 2);
  });
  // Raiton: chain lightning jutsu
  generateWeaponIcon(scene, 'skill_raiton', '#FFFF44', (ctx) => {
    // Lightning bolt
    ctx.fillStyle = '#FFFF44';
    ctx.beginPath();
    ctx.moveTo(7, 0); ctx.lineTo(3, 5); ctx.lineTo(6, 5);
    ctx.lineTo(4, 12); ctx.lineTo(10, 5); ctx.lineTo(7, 5);
    ctx.lineTo(9, 0); ctx.closePath(); ctx.fill();
    // Chain sparks
    ctx.fillStyle = '#88BBFF';
    ctx.fillRect(0, 3, 2, 1); ctx.fillRect(10, 7, 2, 1);
    ctx.fillRect(1, 8, 1, 1); ctx.fillRect(11, 2, 1, 1);
    // Core
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 4, 2, 2);
  });
  // Doton: earth zone jutsu
  generateWeaponIcon(scene, 'skill_doton', '#8B4513', (ctx) => {
    // Ground zone circle
    ctx.fillStyle = '#AA6633';
    ctx.beginPath(); ctx.arc(6, 7, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#664422';
    ctx.beginPath(); ctx.arc(6, 7, 3, 0, Math.PI * 2); ctx.fill();
    // Rock spikes
    ctx.fillStyle = '#CC8844';
    ctx.fillRect(3, 3, 2, 3); ctx.fillRect(8, 4, 2, 2);
    ctx.fillRect(5, 2, 2, 2);
    // Slow swirl
    ctx.fillStyle = '#9400D3';
    ctx.fillRect(5, 6, 2, 1); ctx.fillRect(7, 7, 1, 1);
  });

  // ── Monk skills ─────────────────────────────────────────────────────
  // Iron Fist: big clenched fist in orange/yellow punching forward
  generateWeaponIcon(scene, 'skill_iron_fist', '#FF8C00', (ctx) => {
    // Fist body
    ctx.fillStyle = '#FFAA33';
    ctx.fillRect(2, 3, 8, 5);
    // Knuckles (top row)
    ctx.fillStyle = '#FFCC44';
    ctx.fillRect(2, 2, 2, 2); ctx.fillRect(4, 2, 2, 2);
    ctx.fillRect(6, 2, 2, 2); ctx.fillRect(8, 2, 2, 2);
    // Thumb
    ctx.fillStyle = '#FF9922';
    ctx.fillRect(1, 5, 2, 3);
    // Finger lines
    ctx.fillStyle = '#CC7700';
    ctx.fillRect(4, 4, 1, 4); ctx.fillRect(6, 4, 1, 4); ctx.fillRect(8, 4, 1, 4);
    // Wrist
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(3, 8, 6, 3);
    // Impact lines
    ctx.fillStyle = '#FFFF88';
    ctx.fillRect(0, 3, 1, 1); ctx.fillRect(0, 6, 1, 1); ctx.fillRect(11, 4, 1, 1);
  });
  // Chi Burst: swirling energy ball
  generateWeaponIcon(scene, 'skill_chi_burst', '#FF8C00', (ctx) => {
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFCC44';
    ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI * 2); ctx.fill();
    // Swirl lines
    ctx.strokeStyle = '#FFEE88'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 1.2); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 5, 2, 2);
  });
  // Hadouken: energy ball projectile
  generateWeaponIcon(scene, 'skill_hadouken', '#FF8C00', (ctx) => {
    // Energy ball
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath(); ctx.arc(7, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFDD44';
    ctx.beginPath(); ctx.arc(7, 6, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(7, 6, 1, 0, Math.PI * 2); ctx.fill();
    // Trail
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(0, 5, 3, 2);
    ctx.fillStyle = '#FFAA44';
    ctx.fillRect(1, 4, 2, 1); ctx.fillRect(1, 7, 2, 1);
  });

  // ── Berserker skills ────────────────────────────────────────────────
  // War Cry: AoE stun shockwave
  generateWeaponIcon(scene, 'skill_war_cry', '#DC143C', (ctx) => {
    // Shockwave rings
    ctx.strokeStyle = '#FF4444'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#FF8888';
    ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.stroke();
    // Center face
    ctx.fillStyle = '#DC143C';
    ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI * 2); ctx.fill();
    // Open mouth (yelling)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 2, 1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(5, 6, 2, 2);
    // Sound waves
    ctx.fillStyle = '#FFAAAA';
    ctx.fillRect(0, 5, 1, 2); ctx.fillRect(11, 5, 1, 2);
  });
  // Frenzy: dual axes spinning
  generateWeaponIcon(scene, 'skill_frenzy', '#DC143C', (ctx) => {
    // Axe 1
    ctx.fillRect(2, 0, 4, 3); ctx.fillRect(1, 1, 5, 1);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(3, 3, 2, 5);
    // Axe 2
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(7, 4, 4, 3); ctx.fillRect(6, 5, 5, 1);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(8, 7, 2, 5);
  });
  // Rampage: charging dash
  generateWeaponIcon(scene, 'skill_rampage', '#DC143C', (ctx) => {
    // Charging figure silhouette
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(7, 3, 3, 5);
    ctx.fillRect(8, 2, 2, 1);
    // Legs in running pose
    ctx.fillRect(7, 8, 2, 3);
    ctx.fillRect(9, 8, 2, 2);
    // Speed lines behind
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(0, 3, 4, 1); ctx.fillRect(1, 5, 5, 1); ctx.fillRect(0, 7, 4, 1);
    // Impact ahead
    ctx.fillStyle = '#FFAA44';
    ctx.fillRect(11, 4, 1, 3);
  });

  // ── Ranger skills ───────────────────────────────────────────────────
  // Multi Shot: three arrows fanning
  generateWeaponIcon(scene, 'skill_multi_shot', '#228B22', (ctx) => {
    ctx.strokeStyle = '#228B22'; ctx.lineWidth = 1;
    // Center arrow
    ctx.fillRect(2, 5, 8, 2); ctx.fillRect(10, 5, 2, 2);
    // Top arrow
    ctx.fillStyle = '#44AA44';
    ctx.fillRect(3, 2, 6, 1); ctx.fillRect(9, 1, 2, 2);
    // Bottom arrow
    ctx.fillRect(3, 9, 6, 1); ctx.fillRect(9, 9, 2, 2);
    // Arrow tips
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(10, 5, 2, 1); ctx.fillRect(9, 1, 1, 1); ctx.fillRect(9, 9, 1, 1);
  });
  // Rain of Arrows: arrows falling from sky
  generateWeaponIcon(scene, 'skill_rain_of_arrows', '#228B22', (ctx) => {
    // Multiple arrows falling
    ctx.fillStyle = '#228B22';
    ctx.fillRect(2, 0, 1, 4); ctx.fillRect(5, 1, 1, 4);
    ctx.fillRect(8, 0, 1, 4); ctx.fillRect(10, 2, 1, 3);
    // Arrow tips
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(2, 4, 1, 2); ctx.fillRect(5, 5, 1, 2);
    ctx.fillRect(8, 4, 1, 2); ctx.fillRect(10, 5, 1, 2);
    // Impact zone
    ctx.fillStyle = '#886644';
    ctx.fillRect(0, 9, 12, 3);
    ctx.fillStyle = '#664422';
    ctx.fillRect(1, 10, 10, 1);
  });
  // Barrage: rain of arrows
  generateWeaponIcon(scene, 'skill_barrage', '#228B22', (ctx) => {
    ctx.fillStyle = '#228B22';
    // Multiple arrow shafts falling diagonally
    ctx.fillRect(1, 1, 1, 5); ctx.fillRect(4, 0, 1, 5);
    ctx.fillRect(7, 2, 1, 5); ctx.fillRect(10, 1, 1, 5);
    // Arrow tips (downward)
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(1, 6, 1, 2); ctx.fillRect(4, 5, 1, 2);
    ctx.fillRect(7, 7, 1, 2); ctx.fillRect(10, 6, 1, 2);
    // Ground impact
    ctx.fillStyle = '#886644';
    ctx.fillRect(0, 10, 12, 2);
  });

  // ── Bard skills ─────────────────────────────────────────────────────
  // War Song: sword with music notes
  generateWeaponIcon(scene, 'skill_war_song', '#DAA520', (ctx) => {
    ctx.fillRect(5, 1, 2, 7);
    ctx.fillRect(3, 3, 6, 2);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 8, 2, 3);
    // Music notes
    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(0, 2, 2, 2); ctx.fillRect(10, 1, 2, 2);
    ctx.fillRect(1, 1, 1, 1); ctx.fillRect(11, 0, 1, 1);
  });
  // Crescendo: giant music note projectile
  generateWeaponIcon(scene, 'skill_crescendo', '#DAA520', (ctx) => {
    // Giant note head
    ctx.fillStyle = '#DAA520';
    ctx.beginPath(); ctx.arc(4, 8, 3, 0, Math.PI * 2); ctx.fill();
    // Note stem
    ctx.fillRect(7, 1, 2, 8);
    // Note flag
    ctx.fillStyle = '#FFDD88';
    ctx.fillRect(9, 1, 2, 3);
    ctx.fillRect(10, 3, 1, 2);
    // Sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 7, 2, 2);
    // Sound wave
    ctx.fillStyle = '#FFDD88';
    ctx.fillRect(0, 5, 1, 1); ctx.fillRect(11, 4, 1, 1);
  });
  // Requiem: skull with music notes
  generateWeaponIcon(scene, 'skill_requiem', '#DAA520', (ctx) => {
    // Skull
    ctx.fillRect(3, 3, 6, 5);
    ctx.fillRect(4, 2, 4, 1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 4, 2, 2); ctx.fillRect(7, 4, 2, 2);
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(5, 7, 2, 1);
    // Music notes
    ctx.fillStyle = '#FFDD88';
    ctx.fillRect(0, 1, 2, 2); ctx.fillRect(10, 0, 2, 2);
    ctx.fillRect(1, 0, 1, 2); ctx.fillRect(11, 0, 1, 1);
    // Death aura
    ctx.fillStyle = 'rgba(218,165,32,0.3)';
    ctx.fillRect(2, 9, 8, 2);
  });

  // ── Black Mage skills ───────────────────────────────────────────────
  // Fire: flame shape
  generateWeaponIcon(scene, 'skill_fire', '#FF4400', (ctx) => {
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(4, 6, 4, 4);
    ctx.fillRect(3, 4, 6, 3);
    ctx.fillRect(4, 2, 4, 3);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(5, 3, 2, 4);
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(5, 4, 2, 2);
    // Flame tip
    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(5, 1, 2, 2);
    ctx.fillRect(6, 0, 1, 1);
  });
  // Blizzard: ice shard
  generateWeaponIcon(scene, 'skill_blizzard', '#4488FF', (ctx) => {
    ctx.fillStyle = '#88CCFF';
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(10, 6); ctx.lineTo(6, 12); ctx.lineTo(2, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#AADDFF';
    ctx.fillRect(5, 3, 2, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 4, 1, 2);
    // Small ice shards
    ctx.fillStyle = '#CCDDFF';
    ctx.fillRect(0, 5, 2, 1); ctx.fillRect(10, 6, 2, 1);
  });
  // Thunder: lightning bolt
  generateWeaponIcon(scene, 'skill_thunder', '#FFFF44', (ctx) => {
    ctx.fillStyle = '#FFFF44';
    ctx.beginPath();
    ctx.moveTo(7, 0); ctx.lineTo(3, 5); ctx.lineTo(6, 5);
    ctx.lineTo(4, 12); ctx.lineTo(10, 5); ctx.lineTo(7, 5);
    ctx.lineTo(9, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 4, 2, 2);
  });

  // ── White Mage skills ───────────────────────────────────────────────
  // Regen: green plus with sparkle
  generateWeaponIcon(scene, 'skill_regen_wm', '#44FF88', (ctx) => {
    ctx.fillStyle = '#44FF88';
    ctx.fillRect(4, 1, 4, 10);
    ctx.fillRect(1, 4, 10, 4);
    ctx.fillStyle = '#88FFAA';
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 2, 2);
  });
  // Protect: shield with sparkle aura
  generateWeaponIcon(scene, 'skill_protect', '#FFFFFF', (ctx) => {
    ctx.fillStyle = '#AACCFF';
    ctx.beginPath();
    ctx.moveTo(6, 11); ctx.lineTo(1, 7); ctx.lineTo(1, 2);
    ctx.lineTo(6, 1); ctx.lineTo(11, 2); ctx.lineTo(11, 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#DDEEFF';
    ctx.beginPath();
    ctx.moveTo(6, 9); ctx.lineTo(3, 6); ctx.lineTo(3, 3);
    ctx.lineTo(6, 2); ctx.lineTo(9, 3); ctx.lineTo(9, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 4, 2, 3);
  });
  // Holy: radiant star burst
  generateWeaponIcon(scene, 'skill_holy', '#FFFFFF', (ctx) => {
    ctx.fillStyle = '#FFFFCC';
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(7, 4); ctx.lineTo(11, 3);
    ctx.lineTo(8, 6); ctx.lineTo(12, 9); ctx.lineTo(8, 8);
    ctx.lineTo(6, 12); ctx.lineTo(4, 8); ctx.lineTo(0, 9);
    ctx.lineTo(4, 6); ctx.lineTo(1, 3); ctx.lineTo(5, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI * 2); ctx.fill();
  });

  // ── Summoner skills ─────────────────────────────────────────────────
  // Ifrit: small flame creature
  generateWeaponIcon(scene, 'skill_ifrit', '#FF4400', (ctx) => {
    // Body (flame-shaped)
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(3, 6, 6, 4);
    ctx.fillRect(4, 4, 4, 3);
    // Head flame
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(4, 2, 4, 3);
    ctx.fillRect(5, 1, 2, 2);
    // Flame tip flicker
    ctx.fillStyle = '#FFCC00';
    ctx.fillRect(5, 0, 2, 2);
    ctx.fillRect(6, 0, 1, 1);
    // Inner fire
    ctx.fillStyle = '#FFAA33';
    ctx.fillRect(5, 4, 2, 3);
    // Eyes
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(4, 5, 1, 1); ctx.fillRect(7, 5, 1, 1);
    // Flame arms
    ctx.fillStyle = '#FF5500';
    ctx.fillRect(2, 5, 1, 3); ctx.fillRect(9, 5, 1, 3);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(1, 6, 1, 1); ctx.fillRect(10, 6, 1, 1);
  });
  // Shiva: ice crystal / snowflake
  generateWeaponIcon(scene, 'skill_shiva', '#88CCFF', (ctx) => {
    // Central diamond
    ctx.fillStyle = '#AADDFF';
    ctx.beginPath();
    ctx.moveTo(6, 2); ctx.lineTo(9, 6); ctx.lineTo(6, 10); ctx.lineTo(3, 6);
    ctx.closePath(); ctx.fill();
    // Crystal facets
    ctx.fillStyle = '#CCDDFF';
    ctx.fillRect(5, 3, 2, 2);
    // Ice spikes outward (snowflake arms)
    ctx.fillStyle = '#88CCFF';
    ctx.fillRect(5, 0, 2, 2); ctx.fillRect(5, 10, 2, 2);
    ctx.fillRect(0, 5, 2, 2); ctx.fillRect(10, 5, 2, 2);
    // Diagonal spikes
    ctx.fillRect(1, 1, 2, 1); ctx.fillRect(1, 2, 1, 1);
    ctx.fillRect(9, 1, 2, 1); ctx.fillRect(10, 2, 1, 1);
    ctx.fillRect(1, 10, 2, 1); ctx.fillRect(1, 9, 1, 1);
    ctx.fillRect(9, 10, 2, 1); ctx.fillRect(10, 9, 1, 1);
    // Center sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 2, 2);
  });
  // Bahamut: dragon head/wing silhouette
  generateWeaponIcon(scene, 'skill_bahamut', '#FF4488', (ctx) => {
    // Dragon head
    ctx.fillStyle = '#CC2266';
    ctx.fillRect(4, 3, 4, 4);
    ctx.fillRect(3, 4, 6, 3);
    // Horns
    ctx.fillRect(3, 1, 1, 3); ctx.fillRect(8, 1, 1, 3);
    ctx.fillRect(2, 0, 1, 2); ctx.fillRect(9, 0, 1, 2);
    // Jaw/snout
    ctx.fillRect(5, 7, 3, 2);
    ctx.fillStyle = '#FF4488'; ctx.fillRect(5, 8, 2, 1);
    // Eyes
    ctx.fillStyle = '#FFDD00';
    ctx.fillRect(4, 4, 1, 1); ctx.fillRect(7, 4, 1, 1);
    // Wings spread
    ctx.fillStyle = '#AA1155';
    ctx.fillRect(0, 4, 3, 2); ctx.fillRect(9, 4, 3, 2);
    ctx.fillRect(0, 5, 2, 2); ctx.fillRect(10, 5, 2, 2);
    // Breath glow
    ctx.fillStyle = '#FF8866';
    ctx.fillRect(5, 9, 2, 2); ctx.fillRect(6, 10, 1, 2);
  });

  // Ramuh: old man with lightning bolt
  generateWeaponIcon(scene, 'skill_ramuh', '#FFDD44', (ctx) => {
    // Head
    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(4, 1, 4, 4);
    // Beard
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(4, 5, 4, 3);
    ctx.fillRect(5, 8, 2, 1);
    // Lightning bolt
    ctx.fillStyle = '#FFDD00';
    ctx.fillRect(9, 0, 2, 3); ctx.fillRect(8, 2, 2, 2);
    ctx.fillRect(9, 4, 2, 3); ctx.fillRect(10, 6, 1, 3);
    // Glow
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 1, 1, 1); ctx.fillRect(9, 5, 1, 1);
  });
  // Titan: rock fist
  generateWeaponIcon(scene, 'skill_titan', '#AA7744', (ctx) => {
    // Fist
    ctx.fillStyle = '#8B6633';
    ctx.fillRect(2, 3, 8, 6);
    ctx.fillRect(3, 2, 6, 2);
    // Knuckles
    ctx.fillStyle = '#AA8844';
    ctx.fillRect(2, 3, 2, 2); ctx.fillRect(4, 3, 2, 2);
    ctx.fillRect(6, 3, 2, 2); ctx.fillRect(8, 3, 2, 2);
    // Cracks
    ctx.fillStyle = '#665522';
    ctx.fillRect(5, 5, 1, 3); ctx.fillRect(7, 4, 1, 2);
    // Ground debris
    ctx.fillStyle = '#AA7744';
    ctx.fillRect(1, 10, 10, 2);
  });
  // Carbuncle: small fox creature in emerald
  generateWeaponIcon(scene, 'skill_carbuncle', '#44DD88', (ctx) => {
    // Body
    ctx.fillStyle = '#33BB66';
    ctx.fillRect(3, 5, 6, 4);
    // Head
    ctx.fillRect(4, 3, 4, 3);
    // Ears
    ctx.fillStyle = '#44DD88';
    ctx.fillRect(4, 1, 2, 3); ctx.fillRect(6, 1, 2, 3);
    // Gem on forehead
    ctx.fillStyle = '#00FF88';
    ctx.fillRect(5, 3, 2, 1);
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4, 4, 1, 1); ctx.fillRect(7, 4, 1, 1);
    // Tail
    ctx.fillStyle = '#33BB66';
    ctx.fillRect(1, 6, 2, 1); ctx.fillRect(0, 5, 2, 1);
    // Sparkles
    ctx.fillStyle = '#88FFBB';
    ctx.fillRect(10, 2, 1, 1); ctx.fillRect(1, 3, 1, 1);
  });
  // Leviathan: sea serpent wave
  generateWeaponIcon(scene, 'skill_leviathan', '#4488FF', (ctx) => {
    // Serpent body wave
    ctx.fillStyle = '#3366CC';
    ctx.fillRect(0, 5, 3, 3); ctx.fillRect(2, 3, 3, 3);
    ctx.fillRect(4, 5, 3, 3); ctx.fillRect(6, 3, 3, 3);
    ctx.fillRect(8, 5, 3, 3);
    // Head
    ctx.fillStyle = '#4488FF';
    ctx.fillRect(9, 3, 3, 3);
    // Eye
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 4, 1, 1);
    // Water splash
    ctx.fillStyle = '#88CCFF';
    ctx.fillRect(0, 8, 2, 1); ctx.fillRect(3, 9, 2, 1);
    ctx.fillRect(7, 8, 2, 1); ctx.fillRect(10, 9, 1, 1);
  });
  // Odin: dark knight with sword
  generateWeaponIcon(scene, 'skill_odin', '#8844AA', (ctx) => {
    // Horse/rider silhouette
    ctx.fillStyle = '#6622AA';
    ctx.fillRect(3, 3, 6, 5);
    ctx.fillRect(4, 2, 4, 2);
    // Helmet horns
    ctx.fillStyle = '#8844AA';
    ctx.fillRect(3, 0, 1, 3); ctx.fillRect(8, 0, 1, 3);
    // Sword (zantetsuken)
    ctx.fillStyle = '#CCCCFF';
    ctx.fillRect(10, 1, 1, 8);
    ctx.fillRect(9, 2, 1, 1); ctx.fillRect(11, 2, 1, 1);
    // Sword glow
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 3, 1, 1);
    // Dark cape
    ctx.fillStyle = '#441188';
    ctx.fillRect(2, 5, 2, 4); ctx.fillRect(1, 7, 1, 3);
  });
  // Alexander: castle fortress in gold
  generateWeaponIcon(scene, 'skill_alexander', '#FFD700', (ctx) => {
    // Castle body
    ctx.fillStyle = '#CCAA44';
    ctx.fillRect(2, 4, 8, 6);
    // Towers
    ctx.fillStyle = '#DDBB55';
    ctx.fillRect(2, 1, 3, 4); ctx.fillRect(7, 1, 3, 4);
    // Tower tops
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(3, 0, 1, 2); ctx.fillRect(8, 0, 1, 2);
    // Gate
    ctx.fillStyle = '#665522';
    ctx.fillRect(4, 7, 4, 3);
    // Holy light
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillStyle = '#FFFFAA';
    ctx.fillRect(5, 5, 2, 2);
  });
  // Diabolos: dark bat wings
  generateWeaponIcon(scene, 'skill_diabolos', '#8844CC', (ctx) => {
    // Wings
    ctx.fillStyle = '#6622AA';
    ctx.fillRect(0, 3, 4, 4); ctx.fillRect(8, 3, 4, 4);
    ctx.fillRect(1, 2, 3, 2); ctx.fillRect(8, 2, 3, 2);
    // Wing tips
    ctx.fillStyle = '#5511AA';
    ctx.fillRect(0, 2, 1, 2); ctx.fillRect(11, 2, 1, 2);
    // Body
    ctx.fillStyle = '#7733BB';
    ctx.fillRect(4, 3, 4, 5);
    // Head
    ctx.fillRect(5, 1, 2, 3);
    // Eyes
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(5, 2, 1, 1); ctx.fillRect(6, 2, 1, 1);
    // Dark sphere
    ctx.fillStyle = '#440088';
    ctx.fillRect(5, 9, 2, 2);
    ctx.fillStyle = '#6600CC';
    ctx.fillRect(4, 10, 4, 1);
  });
  // Knights of the Round: circle of swords
  generateWeaponIcon(scene, 'skill_knights_of_the_round', '#FF1144', (ctx) => {
    // Circle border
    ctx.strokeStyle = '#CC0033'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    // Swords arranged in circle (simplified as lines radiating from center)
    ctx.fillStyle = '#CCCCFF';
    ctx.fillRect(5, 0, 2, 3); // top
    ctx.fillRect(5, 9, 2, 3); // bottom
    ctx.fillRect(0, 5, 3, 2); // left
    ctx.fillRect(9, 5, 3, 2); // right
    // Diagonal swords
    ctx.fillRect(1, 1, 2, 2); ctx.fillRect(9, 1, 2, 2);
    ctx.fillRect(1, 9, 2, 2); ctx.fillRect(9, 9, 2, 2);
    // Center crown
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(5, 5, 2, 2);
    // Red glow
    ctx.fillStyle = '#FF1144';
    ctx.fillRect(4, 4, 1, 1); ctx.fillRect(7, 4, 1, 1);
    ctx.fillRect(4, 7, 1, 1); ctx.fillRect(7, 7, 1, 1);
  });
  // Eden: white/gold ring
  generateWeaponIcon(scene, 'skill_eden', '#FFFFFF', (ctx) => {
    // Outer ring
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    // Inner ring
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.stroke();
    // Center star
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 2, 2);
    // Light rays
    ctx.fillStyle = '#FFFFAA';
    ctx.fillRect(5, 1, 2, 2); ctx.fillRect(5, 9, 2, 2);
    ctx.fillRect(1, 5, 2, 2); ctx.fillRect(9, 5, 2, 2);
  });

  // ── Time Mage skills ────────────────────────────────────────────────
  // Haste: clock with speed lines
  generateWeaponIcon(scene, 'skill_haste', '#9370DB', (ctx) => {
    ctx.strokeStyle = '#9370DB'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillRect(5, 3, 2, 4); ctx.fillRect(5, 5, 4, 2);
    // Speed lines
    ctx.fillStyle = '#BB99FF';
    ctx.fillRect(0, 3, 2, 1); ctx.fillRect(0, 6, 3, 1); ctx.fillRect(0, 9, 2, 1);
  });
  // Slow Field: clock with waves
  generateWeaponIcon(scene, 'skill_slow_field', '#9370DB', (ctx) => {
    ctx.strokeStyle = '#9370DB'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillRect(5, 3, 2, 4); ctx.fillRect(3, 5, 4, 2);
    // Slow waves
    ctx.strokeStyle = '#BB99FF';
    ctx.beginPath(); ctx.arc(6, 6, 5, -0.5, 0.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, 6, 5, 2, 3); ctx.stroke();
  });
  // Meteor: falling meteor rock with fire trail
  generateWeaponIcon(scene, 'skill_meteor', '#9370DB', (ctx) => {
    // Meteor body
    ctx.fillStyle = '#884422';
    ctx.beginPath(); ctx.arc(7, 7, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#AA5533'; ctx.fillRect(6, 6, 2, 2);
    // Fire trail
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(2, 2, 3, 2); ctx.fillRect(1, 1, 2, 2);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(0, 0, 2, 2);
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(0, 0, 1, 1);
    // Impact glow
    ctx.fillStyle = '#FF8844';
    ctx.fillRect(6, 10, 3, 2); ctx.fillRect(8, 9, 2, 1);
  });

  // ── Alchemist skills ────────────────────────────────────────────────
  // Potion Lore: potion bottle
  generateWeaponIcon(scene, 'skill_potion_lore', '#32CD32', (ctx) => {
    ctx.fillRect(5, 0, 3, 3);
    ctx.fillRect(3, 3, 7, 8);
    ctx.fillStyle = '#66FF66'; ctx.fillRect(4, 5, 5, 5);
    ctx.fillStyle = '#AAFFAA'; ctx.fillRect(5, 6, 2, 2);
    // Bubbles
    ctx.fillStyle = '#CCFFCC';
    ctx.fillRect(7, 5, 1, 1); ctx.fillRect(5, 8, 1, 1);
  });
  // Transmute: alchemy circle
  generateWeaponIcon(scene, 'skill_transmute', '#32CD32', (ctx) => {
    ctx.strokeStyle = '#32CD32'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    // Inner triangle
    ctx.beginPath();
    ctx.moveTo(6, 1); ctx.lineTo(10, 9); ctx.lineTo(2, 9); ctx.closePath(); ctx.stroke();
    // Center
    ctx.fillStyle = '#66FF66'; ctx.fillRect(5, 5, 2, 2);
  });
  // Elixir: golden potion with sparkle
  generateWeaponIcon(scene, 'skill_elixir', '#32CD32', (ctx) => {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(5, 0, 3, 3);
    ctx.fillRect(3, 3, 7, 8);
    ctx.fillStyle = '#FFEE66'; ctx.fillRect(4, 5, 5, 5);
    ctx.fillStyle = '#FFFFAA'; ctx.fillRect(5, 6, 2, 2);
    // Sparkles
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(7, 4, 1, 1); ctx.fillRect(4, 7, 1, 1); ctx.fillRect(6, 9, 1, 1);
  });

  // ── Geomancer skills ────────────────────────────────────────────────
  // Pitfall: ground trap hole
  generateWeaponIcon(scene, 'skill_pitfall', '#8B4513', (ctx) => {
    // Ground
    ctx.fillRect(0, 4, 12, 3);
    // Pit/hole (dark center)
    ctx.fillStyle = '#221100';
    ctx.fillRect(3, 5, 6, 5);
    ctx.fillRect(4, 4, 4, 1);
    // Broken ground edges
    ctx.fillStyle = '#AA6633';
    ctx.fillRect(2, 4, 2, 2); ctx.fillRect(8, 4, 2, 2);
    ctx.fillRect(3, 6, 1, 1); ctx.fillRect(8, 6, 1, 1);
    // Spikes in pit
    ctx.fillStyle = '#664422';
    ctx.fillRect(4, 8, 1, 2); ctx.fillRect(6, 7, 1, 3); ctx.fillRect(8, 8, 1, 2);
  });
  // Gust: wind swirl
  generateWeaponIcon(scene, 'skill_gust', '#88CC88', (ctx) => {
    ctx.fillStyle = '#88CC88';
    ctx.strokeStyle = '#88CC88'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(6, 4, 3, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(5, 7, 2, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(7, 10, 2, Math.PI, 0); ctx.stroke();
    // Wind dots
    ctx.fillRect(1, 3, 1, 1); ctx.fillRect(10, 5, 1, 1);
    ctx.fillRect(2, 8, 1, 1); ctx.fillRect(9, 9, 1, 1);
  });
  // Quake: cracked ground
  generateWeaponIcon(scene, 'skill_quake', '#8B4513', (ctx) => {
    // Ground
    ctx.fillRect(0, 5, 12, 7);
    // Cracks
    ctx.fillStyle = '#331100';
    ctx.fillRect(5, 4, 2, 8);
    ctx.fillRect(2, 6, 4, 1); ctx.fillRect(7, 7, 4, 1);
    ctx.fillRect(3, 8, 2, 1); ctx.fillRect(8, 5, 2, 1);
    // Rocks flying up
    ctx.fillStyle = '#AA7744';
    ctx.fillRect(2, 1, 3, 2); ctx.fillRect(8, 0, 2, 2);
    ctx.fillRect(4, 3, 2, 1);
    ctx.fillStyle = '#CC9966';
    ctx.fillRect(3, 1, 1, 1); ctx.fillRect(9, 0, 1, 1);
  });

  // ── Samurai skills ──────────────────────────────────────────────────
  // Bushido: katana with cherry blossom
  generateWeaponIcon(scene, 'skill_bushido', '#B22222', (ctx) => {
    // Katana blade
    ctx.fillStyle = '#DDDDDD'; ctx.fillRect(5, 0, 2, 7);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 0, 1, 2);
    // Guard
    ctx.fillStyle = '#B22222'; ctx.fillRect(3, 7, 6, 2);
    // Handle
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 9, 2, 3);
    // Cherry petal
    ctx.fillStyle = '#FF88AA';
    ctx.fillRect(1, 2, 2, 2); ctx.fillRect(9, 4, 2, 2);
  });
  // Blade Storm: rotary slashes around player
  generateWeaponIcon(scene, 'skill_blade_storm', '#B22222', (ctx) => {
    // Spinning slash arcs
    ctx.strokeStyle = '#FF4444'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, 6, 5, Math.PI, Math.PI * 1.7); ctx.stroke();
    // Inner arcs
    ctx.strokeStyle = '#FFAAAA'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 3, Math.PI * 0.5, Math.PI * 1.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, 6, 3, Math.PI * 1.5, Math.PI * 2.2); ctx.stroke();
    // Center
    ctx.fillStyle = '#B22222';
    ctx.fillRect(5, 5, 2, 2);
    // Blade tips
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 7, 1, 1); ctx.fillRect(1, 4, 1, 1);
  });
  // Zantetsuken: ultimate cleave slash
  generateWeaponIcon(scene, 'skill_zantetsuken', '#B22222', (ctx) => {
    // Big diagonal slash
    ctx.strokeStyle = '#FF2222'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, 12); ctx.stroke();
    ctx.strokeStyle = '#FFAAAA'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(12, 11); ctx.stroke();
    // Blade sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillRect(2, 1, 1, 1); ctx.fillRect(9, 10, 1, 1);
    // Kanji-like mark
    ctx.fillStyle = '#B22222';
    ctx.fillRect(8, 2, 3, 1); ctx.fillRect(9, 1, 1, 3);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MISSING BASE SKILL ICONS
  // ═══════════════════════════════════════════════════════════════════════

  // Sacred Orbit (Paladin): shields orbiting player
  generateWeaponIcon(scene, 'skill_sacred_orbit', '#FFD700', (ctx) => {
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    // Orbiting shields
    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(5, 0, 2, 2); ctx.fillRect(10, 5, 2, 2);
    ctx.fillRect(5, 10, 2, 2); ctx.fillRect(0, 5, 2, 2);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 5, 2, 2);
  });
  // Dual Strike (Ninja): crossed blades
  generateWeaponIcon(scene, 'skill_dual_strike', '#9400D3', (ctx) => {
    ctx.fillStyle = '#CCCCCC';
    // Blade 1 diagonal
    ctx.fillRect(2, 1, 2, 8);
    // Blade 2 diagonal
    ctx.fillRect(8, 1, 2, 8);
    // Cross point
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 4, 2, 2);
    // Handles
    ctx.fillStyle = '#9400D3';
    ctx.fillRect(1, 9, 3, 2); ctx.fillRect(8, 9, 3, 2);
    // Slash lines
    ctx.fillStyle = '#FF88FF';
    ctx.fillRect(4, 2, 1, 1); ctx.fillRect(7, 2, 1, 1);
  });
  // Shadow Step (Ninja): dash afterimage
  generateWeaponIcon(scene, 'skill_shadow_step', '#9400D3', (ctx) => {
    // Ghost figure (faded)
    ctx.fillStyle = 'rgba(148,0,211,0.3)';
    ctx.fillRect(1, 3, 3, 5); ctx.fillRect(2, 2, 2, 1);
    // Main figure
    ctx.fillStyle = '#9400D3';
    ctx.fillRect(7, 3, 3, 5); ctx.fillRect(8, 2, 2, 1);
    // Speed lines
    ctx.fillStyle = '#BB66FF';
    ctx.fillRect(4, 4, 2, 1); ctx.fillRect(5, 6, 2, 1);
    // Dash arrow
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(11, 5, 1, 2);
  });
  // Smoke Bomb (Ninja): cloud of smoke
  generateWeaponIcon(scene, 'skill_smoke_bomb', '#9400D3', (ctx) => {
    ctx.fillStyle = '#886699';
    ctx.beginPath(); ctx.arc(6, 7, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#AA88BB';
    ctx.beginPath(); ctx.arc(4, 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#CCAADD';
    ctx.beginPath(); ctx.arc(6, 5, 2, 0, Math.PI * 2); ctx.fill();
    // Shuriken in center
    ctx.fillStyle = '#9400D3'; ctx.fillRect(5, 5, 2, 2);
  });
  // Swift Song (Bard): music notes with wind
  generateWeaponIcon(scene, 'skill_swift_song', '#DAA520', (ctx) => {
    // Note 1
    ctx.fillStyle = '#DAA520';
    ctx.beginPath(); ctx.arc(3, 8, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(5, 2, 2, 7);
    ctx.fillRect(7, 2, 2, 2);
    // Speed lines
    ctx.fillStyle = '#FFDD88';
    ctx.fillRect(0, 3, 2, 1); ctx.fillRect(0, 6, 3, 1); ctx.fillRect(0, 9, 2, 1);
    // Wind swirl
    ctx.fillStyle = '#88EEFF';
    ctx.fillRect(9, 4, 2, 1); ctx.fillRect(10, 6, 2, 1);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MASTERY SKILL ICONS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Paladin Mastery ──
  // Hallowed Ground: holy zone with radiance
  generateWeaponIcon(scene, 'skill_hallowed_ground', '#FFD700', (ctx) => {
    ctx.fillStyle = '#FFEE88';
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 3, 2, 6); ctx.fillRect(3, 5, 6, 2);
    ctx.fillRect(5, 5, 2, 2);
  });
  // Clemency: healing hand
  generateWeaponIcon(scene, 'skill_clemency', '#FFD700', (ctx) => {
    ctx.fillStyle = '#FFFFCC';
    ctx.fillRect(3, 2, 6, 7);
    ctx.fillStyle = '#44FF88';
    ctx.fillRect(5, 3, 2, 5); ctx.fillRect(3, 5, 6, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 5, 2, 2);
    // Sparkles
    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(1, 1, 1, 1); ctx.fillRect(10, 2, 1, 1); ctx.fillRect(2, 10, 1, 1);
  });

  // ── Dark Knight Mastery ──
  // Soul Eater: dark maw consuming
  generateWeaponIcon(scene, 'skill_soul_eater', '#8B0000', (ctx) => {
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#440000';
    ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(4, 5, 1, 2); ctx.fillRect(7, 5, 1, 2);
    // Drain swirl
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(1, 2, 2, 1); ctx.fillRect(9, 9, 2, 1);
  });
  // Living Dead: skull with resurrection
  generateWeaponIcon(scene, 'skill_living_dead', '#8B0000', (ctx) => {
    ctx.fillRect(3, 2, 6, 5);
    ctx.fillRect(4, 1, 4, 1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 3, 2, 2); ctx.fillRect(7, 3, 2, 2);
    ctx.fillStyle = '#8B0000'; ctx.fillRect(5, 6, 2, 1);
    // Glow of undeath
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(3, 8, 6, 2);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(5, 9, 2, 2);
  });

  // ── Dragoon Mastery ──
  // Stardiver: diving lance with star
  generateWeaponIcon(scene, 'skill_stardiver', '#4169E1', (ctx) => {
    ctx.fillRect(5, 3, 2, 7);
    ctx.fillStyle = '#88AAFF';
    ctx.beginPath(); ctx.moveTo(6, 11); ctx.lineTo(3, 7); ctx.lineTo(9, 7); ctx.closePath(); ctx.fill();
    // Star burst on impact
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(5, 0, 2, 2); ctx.fillRect(2, 1, 2, 1); ctx.fillRect(8, 1, 2, 1);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 0, 2, 1);
  });
  // Nastrond: dragon breath cone
  generateWeaponIcon(scene, 'skill_nastrond', '#4169E1', (ctx) => {
    // Dragon head
    ctx.fillStyle = '#4169E1'; ctx.fillRect(1, 4, 3, 4);
    // Breath cone
    ctx.fillStyle = '#FF4400';
    ctx.beginPath(); ctx.moveTo(4, 5); ctx.lineTo(11, 1); ctx.lineTo(11, 11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(10, 3); ctx.lineTo(10, 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFDD44';
    ctx.beginPath(); ctx.moveTo(6, 5); ctx.lineTo(9, 4); ctx.lineTo(9, 8); ctx.closePath(); ctx.fill();
  });

  // ── Monk Mastery ──
  // Forbidden Chakra: mega energy fist
  generateWeaponIcon(scene, 'skill_forbidden_chakra', '#FF8C00', (ctx) => {
    ctx.fillStyle = '#FFAA33'; ctx.fillRect(3, 3, 6, 5);
    ctx.fillStyle = '#FFCC44';
    ctx.fillRect(3, 2, 2, 2); ctx.fillRect(5, 2, 2, 2); ctx.fillRect(7, 2, 2, 2);
    // Massive energy glow
    ctx.fillStyle = '#44BBFF';
    ctx.beginPath(); ctx.arc(5, 5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#88DDFF';
    ctx.beginPath(); ctx.arc(5, 5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(4, 4, 2, 2);
  });
  // Phantom Rush: speed afterimages
  generateWeaponIcon(scene, 'skill_phantom_rush', '#FF8C00', (ctx) => {
    // Ghost figures (fading)
    ctx.fillStyle = 'rgba(255,140,0,0.2)'; ctx.fillRect(0, 4, 2, 4);
    ctx.fillStyle = 'rgba(255,140,0,0.4)'; ctx.fillRect(3, 4, 2, 4);
    ctx.fillStyle = 'rgba(255,140,0,0.7)'; ctx.fillRect(6, 4, 2, 4);
    ctx.fillStyle = '#FF8C00'; ctx.fillRect(9, 3, 3, 5); ctx.fillRect(10, 2, 2, 1);
    // Speed lines
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(0, 3, 4, 1); ctx.fillRect(1, 8, 5, 1);
  });

  // ── Berserker Mastery ──
  // Inner Beast: beast head with healing
  generateWeaponIcon(scene, 'skill_inner_beast', '#DC143C', (ctx) => {
    ctx.fillRect(3, 3, 6, 5);
    ctx.fillRect(2, 4, 8, 3);
    // Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4, 7, 1, 2); ctx.fillRect(7, 7, 1, 2);
    // Eyes
    ctx.fillStyle = '#FFDD00'; ctx.fillRect(4, 4, 1, 1); ctx.fillRect(7, 4, 1, 1);
    // Heal glow
    ctx.fillStyle = '#44FF88';
    ctx.fillRect(0, 9, 3, 2); ctx.fillRect(9, 9, 3, 2);
  });
  // Fell Cleave: massive downward slash
  generateWeaponIcon(scene, 'skill_fell_cleave', '#DC143C', (ctx) => {
    // Axe head wide
    ctx.fillRect(0, 1, 12, 4); ctx.fillRect(1, 0, 10, 1);
    // Handle
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 5, 2, 7);
    // Impact lines
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(0, 5, 2, 1); ctx.fillRect(10, 5, 2, 1);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 0, 2, 1);
  });

  // ── Ranger Mastery ──
  // Sidewinder: homing snake arrow
  generateWeaponIcon(scene, 'skill_sidewinder', '#228B22', (ctx) => {
    // Curved arrow path
    ctx.strokeStyle = '#228B22'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(6, 6, 4, -Math.PI * 0.3, Math.PI * 0.8); ctx.stroke();
    // Arrow tip
    ctx.fillStyle = '#CCCCCC'; ctx.fillRect(9, 7, 2, 2);
    // Poison drip
    ctx.fillStyle = '#88FF44';
    ctx.fillRect(3, 9, 1, 2); ctx.fillRect(5, 10, 1, 1);
    // Target reticle
    ctx.fillStyle = '#FF4444'; ctx.fillRect(10, 3, 2, 1); ctx.fillRect(11, 2, 1, 3);
  });
  // Empyreal Arrow: radiant piercing arrow
  generateWeaponIcon(scene, 'skill_empyreal_arrow', '#228B22', (ctx) => {
    // Arrow shaft
    ctx.fillRect(1, 5, 9, 2);
    // Radiant tip
    ctx.fillStyle = '#FFDD44';
    ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(9, 3); ctx.lineTo(9, 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(10, 5, 2, 2);
    // Pierce through marks
    ctx.fillStyle = '#44AAFF';
    ctx.fillRect(0, 4, 1, 1); ctx.fillRect(0, 7, 1, 1);
  });

  // ── Bard Mastery ──
  // Finale: explosive music crescendo
  generateWeaponIcon(scene, 'skill_finale', '#DAA520', (ctx) => {
    // Explosion burst
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(7, 4); ctx.lineTo(11, 3);
    ctx.lineTo(8, 6); ctx.lineTo(12, 9); ctx.lineTo(8, 8);
    ctx.lineTo(6, 12); ctx.lineTo(4, 8); ctx.lineTo(0, 9);
    ctx.lineTo(4, 6); ctx.lineTo(1, 3); ctx.lineTo(5, 4);
    ctx.closePath(); ctx.fill();
    // Music notes in center
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 5, 2, 2);
    ctx.fillStyle = '#FFEE88'; ctx.fillRect(4, 4, 1, 1); ctx.fillRect(7, 7, 1, 1);
  });

  // ── Black Mage Mastery ──
  // Flare: massive fire explosion
  generateWeaponIcon(scene, 'skill_flare', '#FF4400', (ctx) => {
    ctx.fillStyle = '#FF2200';
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF6600';
    ctx.beginPath(); ctx.arc(6, 6, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(6, 6, 1, 0, Math.PI * 2); ctx.fill();
  });
  // Freeze: ice prison
  generateWeaponIcon(scene, 'skill_freeze', '#4488FF', (ctx) => {
    ctx.fillStyle = '#88CCFF';
    ctx.fillRect(2, 2, 8, 8);
    ctx.fillStyle = '#AADDFF'; ctx.fillRect(3, 3, 6, 6);
    ctx.fillStyle = '#DDEEFF'; ctx.fillRect(4, 4, 4, 4);
    // Ice cracks
    ctx.fillStyle = '#4488FF';
    ctx.fillRect(5, 2, 2, 8); ctx.fillRect(2, 5, 8, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 5, 2, 2);
  });

  // ── White Mage Mastery ──
  // Benediction: divine full heal
  generateWeaponIcon(scene, 'skill_benediction', '#FFFFFF', (ctx) => {
    ctx.fillStyle = '#FFFFCC';
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#44FF88';
    ctx.fillRect(4, 1, 4, 10); ctx.fillRect(1, 4, 10, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillRect(5, 2, 2, 1); ctx.fillRect(2, 5, 1, 2);
    ctx.fillRect(9, 5, 1, 2); ctx.fillRect(5, 9, 2, 1);
  });
  // Asylum: healing dome
  generateWeaponIcon(scene, 'skill_asylum', '#FFFFFF', (ctx) => {
    // Dome
    ctx.strokeStyle = '#44FF88'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(6, 8, 5, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = 'rgba(68,255,136,0.3)';
    ctx.beginPath(); ctx.arc(6, 8, 5, Math.PI, 0); ctx.fill();
    // Cross inside
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 4, 2, 5); ctx.fillRect(3, 6, 6, 2);
    // Ground
    ctx.fillStyle = '#44FF88'; ctx.fillRect(1, 8, 10, 1);
  });

  // ── Summoner Mastery ──
  // Phoenix: fire bird
  generateWeaponIcon(scene, 'skill_phoenix', '#FF6600', (ctx) => {
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(4, 4, 4, 4);
    // Wings
    ctx.fillRect(0, 3, 4, 3); ctx.fillRect(8, 3, 4, 3);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(5, 3, 2, 2);
    // Head crest
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(5, 1, 2, 3); ctx.fillRect(4, 0, 4, 1);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 0, 2, 1);
    // Tail
    ctx.fillStyle = '#FF2200'; ctx.fillRect(5, 8, 2, 3);
  });
  // Dreadwyrm: dark dragon
  generateWeaponIcon(scene, 'skill_dreadwyrm', '#660088', (ctx) => {
    ctx.fillRect(4, 3, 4, 4);
    ctx.fillRect(3, 4, 6, 3);
    // Horns
    ctx.fillRect(3, 1, 1, 3); ctx.fillRect(8, 1, 1, 3);
    // Eyes
    ctx.fillStyle = '#FF4488'; ctx.fillRect(4, 4, 1, 1); ctx.fillRect(7, 4, 1, 1);
    // Wings
    ctx.fillStyle = '#660088';
    ctx.fillRect(0, 4, 3, 2); ctx.fillRect(9, 4, 3, 2);
    // Dark energy
    ctx.fillStyle = '#AA44FF';
    ctx.fillRect(5, 8, 2, 3); ctx.fillRect(4, 9, 4, 1);
  });

  // ── Time Mage Mastery ──
  // Time Stop: frozen clock
  generateWeaponIcon(scene, 'skill_time_stop', '#9370DB', (ctx) => {
    ctx.strokeStyle = '#9370DB'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
    // Clock hands frozen
    ctx.fillStyle = '#BB99FF';
    ctx.fillRect(5, 3, 2, 4); ctx.fillRect(5, 5, 4, 2);
    // Stop symbol (X)
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(3, 3, 1, 1); ctx.fillRect(8, 8, 1, 1);
    ctx.fillRect(8, 3, 1, 1); ctx.fillRect(3, 8, 1, 1);
  });
  // Comet: falling space rocks
  generateWeaponIcon(scene, 'skill_comet', '#9370DB', (ctx) => {
    // Main comet
    ctx.fillStyle = '#884422';
    ctx.beginPath(); ctx.arc(8, 8, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#AA5533'; ctx.fillRect(7, 7, 2, 2);
    // Trail
    ctx.fillStyle = '#BB99FF';
    ctx.fillRect(2, 2, 4, 2); ctx.fillRect(0, 0, 3, 2);
    ctx.fillStyle = '#DDBBFF'; ctx.fillRect(4, 4, 2, 2);
    // Small comet
    ctx.fillStyle = '#664422';
    ctx.fillRect(2, 6, 2, 2);
    ctx.fillStyle = '#BB99FF'; ctx.fillRect(0, 5, 2, 1);
  });

  // ── Alchemist Mastery ──
  // Philosopher Stone: golden crystal
  generateWeaponIcon(scene, 'skill_philosopher_stone', '#FFD700', (ctx) => {
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(10, 6); ctx.lineTo(6, 12); ctx.lineTo(2, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFEE88'; ctx.fillRect(5, 3, 2, 6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 4, 1, 2);
    // Sparkles
    ctx.fillStyle = '#FFFF88';
    ctx.fillRect(0, 3, 1, 1); ctx.fillRect(11, 5, 1, 1);
  });
  // Mega Potion: big golden potion
  generateWeaponIcon(scene, 'skill_mega_potion', '#32CD32', (ctx) => {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(4, 0, 4, 3);
    ctx.fillRect(2, 3, 8, 8);
    ctx.fillStyle = '#FFEE66'; ctx.fillRect(3, 5, 6, 5);
    ctx.fillStyle = '#FFFFAA'; ctx.fillRect(4, 6, 3, 2);
    // Glow
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(4, 6, 1, 1);
    // Sparkles
    ctx.fillStyle = '#FFFF88'; ctx.fillRect(1, 4, 1, 1); ctx.fillRect(10, 3, 1, 1);
  });

  // ── Geomancer Mastery ──
  // Eruption: fire geyser
  generateWeaponIcon(scene, 'skill_eruption', '#8B4513', (ctx) => {
    // Ground
    ctx.fillRect(0, 8, 12, 4);
    // Geyser
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(4, 2, 4, 7);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(5, 1, 2, 5);
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(5, 0, 2, 3);
    // Side flames
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(2, 6, 2, 3); ctx.fillRect(8, 6, 2, 3);
  });
  // Landslide: rock wave
  generateWeaponIcon(scene, 'skill_landslide', '#8B4513', (ctx) => {
    // Rocks sliding
    ctx.fillRect(1, 5, 3, 3); ctx.fillRect(5, 4, 3, 4);
    ctx.fillRect(8, 3, 3, 4);
    ctx.fillStyle = '#AA7744';
    ctx.fillRect(2, 5, 2, 2); ctx.fillRect(6, 4, 2, 2); ctx.fillRect(9, 3, 2, 2);
    // Impact lines
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(0, 8, 12, 1);
    // Stun stars
    ctx.fillStyle = '#FFDD44';
    ctx.fillRect(3, 1, 1, 1); ctx.fillRect(7, 0, 1, 1); ctx.fillRect(10, 1, 1, 1);
  });

  // ── Samurai Mastery ──
  // Midare Setsugekka: triple slash with petals
  generateWeaponIcon(scene, 'skill_midare_setsugekka', '#B22222', (ctx) => {
    // Three diagonal slashes
    ctx.strokeStyle = '#FF4444'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(10, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(11, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(8, 11); ctx.stroke();
    // Cherry petals
    ctx.fillStyle = '#FF88AA';
    ctx.fillRect(1, 1, 2, 2); ctx.fillRect(9, 2, 2, 1); ctx.fillRect(3, 9, 1, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 4, 2, 2);
  });
  // Hissatsu: finishing strike
  generateWeaponIcon(scene, 'skill_hissatsu', '#B22222', (ctx) => {
    // Blade
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, 0, 2, 8);
    ctx.fillStyle = '#DDDDDD'; ctx.fillRect(6, 0, 1, 6);
    // Guard
    ctx.fillStyle = '#FFD700'; ctx.fillRect(3, 7, 6, 2);
    // Handle
    ctx.fillStyle = '#8B4513'; ctx.fillRect(5, 9, 2, 3);
    // Critical glow
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(3, 0, 2, 1); ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(2, 1, 1, 1); ctx.fillRect(9, 1, 1, 1);
  });
}

export function generateEnvironmentTextures(scene: Phaser.Scene): void {
  // ─── Gravestone (12x14) ─────────────────────────────────────────
  {
    const w = 12, h = 14;
    const canvas = scene.textures.createCanvas('deco_gravestone', w * SPRITE_SCALE, h * SPRITE_SCALE)!;
    const ctx = canvas.context;
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

    // Stone body
    ctx.fillStyle = '#777788';
    ctx.fillRect(2, 4, 8, 10);
    // Rounded top
    ctx.fillStyle = '#777788';
    ctx.fillRect(3, 2, 6, 2);
    ctx.fillRect(4, 1, 4, 1);
    ctx.fillRect(5, 0, 2, 1);
    // Stone shading (darker right side)
    ctx.fillStyle = '#666677';
    ctx.fillRect(7, 4, 3, 10);
    ctx.fillRect(7, 2, 2, 2);
    // Cross engraving
    ctx.fillStyle = '#555566';
    ctx.fillRect(5, 3, 2, 7);
    ctx.fillRect(4, 5, 4, 1);
    // Ground base
    ctx.fillStyle = '#443322';
    ctx.fillRect(1, 12, 10, 2);
    ctx.fillStyle = '#332211';
    ctx.fillRect(0, 13, 12, 1);

    canvas.refresh();
  }

  // ─── Dead tree (16x20) ─────────────────────────────────────────
  {
    const w = 16, h = 20;
    const canvas = scene.textures.createCanvas('deco_dead_tree', w * SPRITE_SCALE, h * SPRITE_SCALE)!;
    const ctx = canvas.context;
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

    // Trunk
    ctx.fillStyle = '#3D2B1F';
    ctx.fillRect(7, 6, 3, 14);
    // Trunk bark texture
    ctx.fillStyle = '#2E1F14';
    ctx.fillRect(7, 8, 1, 2);
    ctx.fillRect(9, 11, 1, 2);
    ctx.fillRect(7, 14, 1, 2);
    // Trunk base (wider)
    ctx.fillStyle = '#3D2B1F';
    ctx.fillRect(6, 17, 5, 3);
    // Roots
    ctx.fillStyle = '#2E1F14';
    ctx.fillRect(5, 19, 2, 1);
    ctx.fillRect(10, 19, 2, 1);

    // Main branches
    ctx.fillStyle = '#3D2B1F';
    // Left branch
    ctx.fillRect(5, 6, 2, 1);
    ctx.fillRect(3, 5, 3, 1);
    ctx.fillRect(2, 4, 2, 1);
    ctx.fillRect(1, 3, 2, 1);
    // Left branch twig
    ctx.fillRect(3, 3, 1, 2);
    ctx.fillRect(2, 2, 1, 1);
    // Right branch
    ctx.fillRect(10, 6, 2, 1);
    ctx.fillRect(11, 5, 3, 1);
    ctx.fillRect(13, 4, 2, 1);
    // Right branch twig up
    ctx.fillRect(12, 3, 1, 2);
    ctx.fillRect(13, 2, 1, 1);
    // Upper left small branch
    ctx.fillRect(6, 4, 2, 1);
    ctx.fillRect(5, 3, 1, 1);
    ctx.fillRect(4, 2, 1, 1);
    // Upper right small branch
    ctx.fillRect(10, 4, 2, 1);
    ctx.fillRect(11, 3, 1, 1);
    // Top
    ctx.fillRect(7, 4, 3, 2);
    ctx.fillRect(8, 2, 1, 2);
    ctx.fillRect(8, 1, 1, 1);

    canvas.refresh();
  }

  // ─── Bones (10x6) ──────────────────────────────────────────────
  {
    const w = 10, h = 6;
    const canvas = scene.textures.createCanvas('deco_bones', w * SPRITE_SCALE, h * SPRITE_SCALE)!;
    const ctx = canvas.context;
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

    // Bone 1 (horizontal)
    ctx.fillStyle = '#EEEEDD';
    ctx.fillRect(1, 1, 4, 1);
    // Bone 1 knobs
    ctx.fillRect(0, 0, 2, 2);
    ctx.fillRect(4, 0, 2, 2);

    // Bone 2 (diagonal)
    ctx.fillStyle = '#DDDDCC';
    ctx.fillRect(5, 3, 3, 1);
    // Bone 2 knobs
    ctx.fillRect(4, 2, 2, 2);
    ctx.fillRect(7, 2, 2, 2);

    // Small bone fragment
    ctx.fillStyle = '#CCCCBB';
    ctx.fillRect(2, 4, 2, 1);
    ctx.fillRect(1, 4, 1, 1);
    ctx.fillRect(4, 4, 1, 1);

    // Tiny rib piece
    ctx.fillStyle = '#DDDDCC';
    ctx.fillRect(7, 0, 2, 1);

    canvas.refresh();
  }

  // ─── Skull pile (12x10) ────────────────────────────────────────
  {
    const w = 12, h = 10;
    const canvas = scene.textures.createCanvas('deco_skull_pile', w * SPRITE_SCALE, h * SPRITE_SCALE)!;
    const ctx = canvas.context;
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

    // Bottom skulls
    // Skull 1 (left)
    ctx.fillStyle = '#DDDDCC';
    ctx.fillRect(0, 6, 4, 3);
    ctx.fillRect(1, 5, 2, 1);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(1, 7, 1, 1);
    ctx.fillRect(3, 7, 1, 1);
    ctx.fillRect(1, 8, 2, 1);

    // Skull 2 (center)
    ctx.fillStyle = '#DDDDCC';
    ctx.fillRect(4, 6, 4, 3);
    ctx.fillRect(5, 5, 2, 1);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(5, 7, 1, 1);
    ctx.fillRect(7, 7, 1, 1);
    ctx.fillRect(5, 8, 2, 1);

    // Skull 3 (right)
    ctx.fillStyle = '#CCCCBB';
    ctx.fillRect(8, 6, 4, 3);
    ctx.fillRect(9, 5, 2, 1);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(9, 7, 1, 1);
    ctx.fillRect(11, 7, 1, 1);
    ctx.fillRect(9, 8, 2, 1);

    // Top skulls (sitting on bottom row)
    // Skull 4 (top left)
    ctx.fillStyle = '#DDDDCC';
    ctx.fillRect(2, 2, 4, 3);
    ctx.fillRect(3, 1, 2, 1);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(3, 3, 1, 1);
    ctx.fillRect(5, 3, 1, 1);
    ctx.fillRect(3, 4, 2, 1);

    // Skull 5 (top right)
    ctx.fillStyle = '#CCCCBB';
    ctx.fillRect(6, 2, 4, 3);
    ctx.fillRect(7, 1, 2, 1);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(7, 3, 1, 1);
    ctx.fillRect(9, 3, 1, 1);
    ctx.fillRect(7, 4, 2, 1);

    // Bottom base
    ctx.fillStyle = '#332211';
    ctx.fillRect(0, 9, 12, 1);

    canvas.refresh();
  }

  // ─── Blood puddle (14x8) ───────────────────────────────────────
  {
    const w = 14, h = 8;
    const canvas = scene.textures.createCanvas('deco_blood_puddle', w * SPRITE_SCALE, h * SPRITE_SCALE)!;
    const ctx = canvas.context;
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

    // Main puddle shape (dark red ellipse)
    ctx.fillStyle = '#5A0A0A';
    ctx.beginPath();
    ctx.ellipse(7, 4, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner darker pool
    ctx.fillStyle = '#3D0505';
    ctx.beginPath();
    ctx.ellipse(7, 4, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlights / reflections
    ctx.fillStyle = '#7A1515';
    ctx.fillRect(4, 3, 2, 1);
    ctx.fillRect(8, 2, 1, 1);

    // Splatter spots
    ctx.fillStyle = '#5A0A0A';
    ctx.fillRect(1, 2, 1, 1);
    ctx.fillRect(12, 3, 1, 1);
    ctx.fillRect(2, 6, 1, 1);
    ctx.fillRect(11, 1, 1, 1);
    ctx.fillRect(0, 4, 1, 1);
    ctx.fillRect(13, 5, 1, 1);

    canvas.refresh();
  }

  // ─── Cobweb (12x12) ────────────────────────────────────────────
  {
    const w = 12, h = 12;
    const canvas = scene.textures.createCanvas('deco_cobweb', w * SPRITE_SCALE, h * SPRITE_SCALE)!;
    const ctx = canvas.context;
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

    ctx.strokeStyle = 'rgba(220, 220, 220, 0.6)';
    ctx.lineWidth = 1;

    // Radial threads from top-left corner
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(11, 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(9, 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(3, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 11);
    ctx.stroke();

    // Connecting arcs between radial threads
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';

    // Inner arc
    ctx.beginPath();
    ctx.moveTo(4, 1);
    ctx.lineTo(3, 2);
    ctx.lineTo(2, 3);
    ctx.lineTo(1, 4);
    ctx.stroke();

    // Middle arc
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.lineTo(6, 4);
    ctx.lineTo(4, 6);
    ctx.lineTo(2, 7);
    ctx.stroke();

    // Outer arc
    ctx.beginPath();
    ctx.moveTo(11, 2);
    ctx.lineTo(9, 5);
    ctx.lineTo(6, 8);
    ctx.lineTo(3, 10);
    ctx.lineTo(1, 11);
    ctx.stroke();

    // Small dew drops
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(5, 3, 1, 1);
    ctx.fillRect(3, 6, 1, 1);
    ctx.fillRect(8, 3, 1, 1);

    canvas.refresh();
  }

  // ─── Torch (6x12, 2-frame spritesheet) ─────────────────────────
  {
    const frameW = 6, frameH = 12;
    const frames = 2;
    const canvas = scene.textures.createCanvas('deco_torch', frameW * frames * SPRITE_SCALE, frameH * SPRITE_SCALE)!;
    const ctx = canvas.context;
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

    for (let f = 0; f < frames; f++) {
      const ox = f * frameW;

      // Wall mount bracket
      ctx.fillStyle = '#555555';
      ctx.fillRect(ox + 2, frameH - 3, 2, 3);
      ctx.fillRect(ox + 1, frameH - 2, 4, 1);

      // Torch handle (dark wood)
      ctx.fillStyle = '#4A3322';
      ctx.fillRect(ox + 2, 4, 2, 6);
      // Handle wrap
      ctx.fillStyle = '#332211';
      ctx.fillRect(ox + 2, 6, 2, 1);
      ctx.fillRect(ox + 2, 8, 2, 1);

      // Torch top (wider)
      ctx.fillStyle = '#5A4433';
      ctx.fillRect(ox + 1, 3, 4, 2);

      // Flame (varies by frame for flicker)
      if (f === 0) {
        // Flame frame 0: taller, narrower
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(ox + 2, 1, 2, 3);
        ctx.fillStyle = '#FFAA00';
        ctx.fillRect(ox + 2, 1, 2, 2);
        ctx.fillStyle = '#FFDD44';
        ctx.fillRect(ox + 2, 1, 2, 1);
        // Flame tip
        ctx.fillStyle = '#FFDD44';
        ctx.fillRect(ox + 3, 0, 1, 1);
      } else {
        // Flame frame 1: shorter, wider, leaning
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(ox + 1, 1, 3, 3);
        ctx.fillStyle = '#FFAA00';
        ctx.fillRect(ox + 1, 1, 3, 2);
        ctx.fillStyle = '#FFDD44';
        ctx.fillRect(ox + 2, 1, 2, 1);
        // Flame tip (offset)
        ctx.fillStyle = '#FFDD44';
        ctx.fillRect(ox + 2, 0, 1, 1);
      }

      // Ember glow beneath flame
      ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
      ctx.fillRect(ox + 1, 4, 4, 1);
    }

    canvas.refresh();

    // Register individual frames for spritesheet animation
    const texture = scene.textures.get('deco_torch');
    for (let f = 0; f < frames; f++) {
      texture.add(f, 0, f * frameW * SPRITE_SCALE, 0, frameW * SPRITE_SCALE, frameH * SPRITE_SCALE);
    }
  }
}
