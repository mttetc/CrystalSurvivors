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
  const canvas = scene.textures.createCanvas(key, s, s)!;
  const ctx = canvas.context;
  ctx.fillStyle = color;
  draw(ctx, s);
  canvas.refresh();
}

function generateGroundTile(scene: Phaser.Scene): void {
  const T = 64;
  const canvas = scene.textures.createCanvas('ground_tile', T, T)!;
  const ctx = canvas.context;

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
  const canvas = scene.textures.createCanvas(key, s, s)!;
  const ctx = canvas.context;

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
  const canvas = scene.textures.createCanvas(key, s, s)!;
  const ctx = canvas.context;
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
  // Highwind: lance with wind trails
  generateWeaponIcon(scene, 'skill_highwind', '#4169E1', (ctx) => {
    ctx.fillRect(5, 0, 2, 10);
    ctx.fillStyle = '#88AAFF';
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(3, 4); ctx.lineTo(9, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4169E1'; ctx.fillRect(4, 10, 4, 2);
    // Wind trails
    ctx.fillStyle = '#AACCFF';
    ctx.fillRect(0, 5, 3, 1); ctx.fillRect(1, 7, 3, 1); ctx.fillRect(9, 6, 3, 1);
  });

  // ── Ninja skills ────────────────────────────────────────────────────
  // Shadow Step: footprint with shadow
  generateWeaponIcon(scene, 'skill_shadow_step', '#9400D3', (ctx) => {
    // Shadow figure dash
    ctx.fillRect(3, 2, 3, 5);
    ctx.fillRect(4, 1, 2, 1);
    ctx.fillRect(3, 7, 2, 3);
    ctx.fillRect(5, 7, 2, 3);
    // After-image trail
    ctx.fillStyle = 'rgba(148,0,211,0.4)';
    ctx.fillRect(7, 2, 3, 5);
    ctx.fillRect(8, 1, 2, 1);
    ctx.fillStyle = 'rgba(148,0,211,0.2)';
    ctx.fillRect(10, 3, 2, 4);
  });
  // Dual Strike: crossed blades
  generateWeaponIcon(scene, 'skill_dual_strike', '#9400D3', (ctx) => {
    ctx.strokeStyle = '#BB44FF'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(1, 1); ctx.lineTo(11, 11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11, 1); ctx.lineTo(1, 11); ctx.stroke();
    ctx.fillStyle = '#DDAAFF';
    ctx.fillRect(5, 5, 2, 2);
  });
  // Smoke Bomb: grey/purple cloud puff
  generateWeaponIcon(scene, 'skill_smoke_bomb', '#9400D3', (ctx) => {
    // Bomb body at bottom
    ctx.fillStyle = '#444444';
    ctx.beginPath(); ctx.arc(6, 9, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF4400'; ctx.fillRect(5, 6, 2, 1); // fuse spark
    // Smoke cloud puffs
    ctx.fillStyle = '#887799';
    ctx.beginPath(); ctx.arc(4, 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#776688';
    ctx.beginPath(); ctx.arc(8, 4, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#998899';
    ctx.beginPath(); ctx.arc(6, 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#AA99AA';
    ctx.beginPath(); ctx.arc(6, 5, 2, 0, Math.PI * 2); ctx.fill();
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
  // Counter: fist blocking with shield
  generateWeaponIcon(scene, 'skill_counter', '#FF8C00', (ctx) => {
    // Blocking arm
    ctx.fillRect(2, 3, 3, 6);
    ctx.fillStyle = '#FFAA44'; ctx.fillRect(2, 2, 3, 2);
    // Shield/guard effect
    ctx.strokeStyle = '#FFDD00'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(8, 6, 3, -Math.PI * 0.6, Math.PI * 0.6); ctx.stroke();
    // Spark
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(9, 5, 2, 2);
  });

  // ── Berserker skills ────────────────────────────────────────────────
  // Rage: angry face/red aura
  generateWeaponIcon(scene, 'skill_rage', '#DC143C', (ctx) => {
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF4444';
    ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.fill();
    // Angry eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4, 4, 2, 2); ctx.fillRect(7, 4, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 4, 1, 1); ctx.fillRect(8, 4, 1, 1);
    // Angry brow
    ctx.strokeStyle = '#AA0000'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(3, 3); ctx.lineTo(5, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 3); ctx.lineTo(8, 4); ctx.stroke();
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
  // Bloodlust: blood drops with aura
  generateWeaponIcon(scene, 'skill_bloodlust', '#DC143C', (ctx) => {
    // Blood drop shape
    ctx.beginPath();
    ctx.moveTo(6, 1); ctx.lineTo(9, 6);
    ctx.arc(6, 7, 3, 0, Math.PI); ctx.lineTo(3, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FF4444'; ctx.fillRect(5, 4, 2, 2);
    // Drips
    ctx.fillStyle = '#AA0022';
    ctx.fillRect(3, 10, 1, 2); ctx.fillRect(6, 10, 1, 2); ctx.fillRect(9, 10, 1, 2);
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
  // Eagle Eye: eye with crosshair
  generateWeaponIcon(scene, 'skill_eagle_eye', '#228B22', (ctx) => {
    ctx.strokeStyle = '#228B22'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 4, 0, Math.PI * 2); ctx.stroke();
    // Crosshair
    ctx.fillRect(5, 1, 2, 3); ctx.fillRect(5, 8, 2, 3);
    ctx.fillRect(1, 5, 3, 2); ctx.fillRect(8, 5, 3, 2);
    // Eye center
    ctx.fillStyle = '#44FF44';
    ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000'; ctx.fillRect(5, 5, 2, 2);
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
  // Swift Song: boot with music notes
  generateWeaponIcon(scene, 'skill_swift_song', '#DAA520', (ctx) => {
    // Music wave
    ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1, 6); ctx.quadraticCurveTo(3, 2, 6, 6);
    ctx.quadraticCurveTo(9, 10, 11, 6); ctx.stroke();
    // Notes
    ctx.fillRect(2, 2, 2, 2); ctx.fillRect(8, 2, 2, 2);
    ctx.fillRect(3, 1, 1, 2); ctx.fillRect(9, 1, 1, 2);
    // Speed lines
    ctx.fillStyle = '#FFDD88';
    ctx.fillRect(0, 8, 3, 1); ctx.fillRect(1, 10, 4, 1);
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
  // Iai Strike: quick-draw slash line
  generateWeaponIcon(scene, 'skill_iai_strike', '#B22222', (ctx) => {
    // Slash arc
    ctx.strokeStyle = '#FF4444'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(6, 6, 5, -Math.PI * 0.7, Math.PI * 0.3); ctx.stroke();
    // Blade flash
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(9, 2, 2, 1); ctx.fillRect(10, 3, 1, 2);
    // Center focus point
    ctx.fillStyle = '#B22222';
    ctx.fillRect(5, 5, 2, 2);
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
}

export function generateEnvironmentTextures(scene: Phaser.Scene): void {
  // ─── Gravestone (12x14) ─────────────────────────────────────────
  {
    const w = 12, h = 14;
    const canvas = scene.textures.createCanvas('deco_gravestone', w, h)!;
    const ctx = canvas.context;

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
    const canvas = scene.textures.createCanvas('deco_dead_tree', w, h)!;
    const ctx = canvas.context;

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
    const canvas = scene.textures.createCanvas('deco_bones', w, h)!;
    const ctx = canvas.context;

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
    const canvas = scene.textures.createCanvas('deco_skull_pile', w, h)!;
    const ctx = canvas.context;

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
    const canvas = scene.textures.createCanvas('deco_blood_puddle', w, h)!;
    const ctx = canvas.context;

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
    const canvas = scene.textures.createCanvas('deco_cobweb', w, h)!;
    const ctx = canvas.context;

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
    const canvas = scene.textures.createCanvas('deco_torch', frameW * frames, frameH)!;
    const ctx = canvas.context;

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
      texture.add(f, 0, f * frameW, 0, frameW, frameH);
    }
  }
}
