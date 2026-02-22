import { SPRITE_SCALE } from '../constants';

export function generateProjectileTextures(scene: Phaser.Scene): void {
  // ─── Hunter's Bow: Arrow 8x4 ──────────────────────────────────
  createSimpleTexture(scene, 'arrow', 8, 4, (ctx) => {
    // Shaft with wood grain
    ctx.fillStyle = '#7A4A1E';
    ctx.fillRect(0, 1, 6, 2);
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(1, 1, 4, 1);
    // Shaft highlight (top edge catch light)
    ctx.fillStyle = '#9D6B3A';
    ctx.fillRect(2, 1, 3, 1);
    // Arrowhead (steel with bevel)
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(6, 0, 2, 4);
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(6, 1, 2, 2);
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(7, 1, 1, 1);
    // Dark edge on arrowhead bottom
    ctx.fillStyle = '#888888';
    ctx.fillRect(6, 3, 2, 1);
    // Fletching with detail
    ctx.fillStyle = '#CC4444';
    ctx.fillRect(0, 0, 2, 1);
    ctx.fillRect(0, 3, 2, 1);
    // Fletching highlight
    ctx.fillStyle = '#DD6666';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillRect(0, 3, 1, 1);
  });

  // ─── Fire Rod: Fireball 8x8 ───────────────────────────────────
  createSimpleTexture(scene, 'fireball', 8, 8, (ctx) => {
    // Faint outer glow
    ctx.fillStyle = 'rgba(255, 68, 0, 0.15)';
    ctx.beginPath();
    ctx.arc(4, 4, 3.8, 0, Math.PI * 2);
    ctx.fill();
    // Outer flame
    ctx.fillStyle = '#FF4400';
    ctx.beginPath();
    ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright core
    ctx.fillStyle = '#FF8800';
    ctx.beginPath();
    ctx.arc(4, 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = '#FFAA22';
    ctx.beginPath();
    ctx.arc(4, 4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Hot center
    ctx.fillStyle = '#FFCC44';
    ctx.fillRect(3, 3, 2, 2);
    // White-hot center pixel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 3, 1, 1);
    // Flame lick details (top)
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(3, 0, 1, 1);
    ctx.fillRect(5, 1, 1, 1);
    // Shadow on bottom edge
    ctx.fillStyle = '#992200';
    ctx.fillRect(3, 7, 2, 1);
  });

  // ─── Sacred Shield: Crusader shield 12x14 ─────────────────────
  // Used as the orbiting shield texture (also kept as 'shield_shard' for compat)
  createSimpleTexture(scene, 'shield_shard', 12, 14, (ctx) => {
    // Shield body - golden/white crusader shield shape
    // Outer border (dark gold)
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(1, 0, 10, 1);   // top edge
    ctx.fillRect(0, 1, 12, 1);   // second row full width
    ctx.fillRect(0, 2, 12, 10);  // main body
    ctx.fillRect(1, 12, 10, 1);  // taper row
    ctx.fillRect(3, 13, 6, 1);   // bottom point row

    // Inner fill (bright gold)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(1, 2, 10, 9);
    ctx.fillRect(2, 11, 8, 1);
    ctx.fillRect(4, 12, 4, 1);

    // Highlight (lighter gold, top-left shine)
    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(2, 2, 4, 3);
    ctx.fillRect(2, 2, 3, 4);

    // Cross emblem (white/silver)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 2, 2, 9);    // vertical bar
    ctx.fillRect(2, 5, 8, 2);    // horizontal bar

    // Cross inner shadow for depth
    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(6, 3, 1, 7);    // right side of vertical
    ctx.fillRect(3, 6, 6, 1);    // bottom side of horizontal

    // Shield rim highlight (top)
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(2, 1, 8, 1);
  });

  // ─── Sacred Shield: weapon_shield (larger, same design) ───────
  createSimpleTexture(scene, 'weapon_shield', 12, 14, (ctx) => {
    // Same crusader shield at native resolution (scaled via setScale in code)
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(1, 0, 10, 1);
    ctx.fillRect(0, 1, 12, 1);
    ctx.fillRect(0, 2, 12, 10);
    ctx.fillRect(1, 12, 10, 1);
    ctx.fillRect(3, 13, 6, 1);

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(1, 2, 10, 9);
    ctx.fillRect(2, 11, 8, 1);
    ctx.fillRect(4, 12, 4, 1);

    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(2, 2, 4, 3);
    ctx.fillRect(2, 2, 3, 4);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 2, 2, 9);
    ctx.fillRect(2, 5, 8, 2);

    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(6, 3, 1, 7);
    ctx.fillRect(3, 6, 6, 1);

    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(2, 1, 8, 1);
  });

  // ─── Sacred Shield: golden impact spark 8x8 ───────────────────
  createSimpleTexture(scene, 'shield_spark', 8, 8, (ctx) => {
    // 4-point star burst
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(3, 0, 2, 8);   // vertical
    ctx.fillRect(0, 3, 8, 2);   // horizontal
    // Diagonal accents
    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(1, 1, 2, 2);
    ctx.fillRect(5, 1, 2, 2);
    ctx.fillRect(1, 5, 2, 2);
    ctx.fillRect(5, 5, 2, 2);
    // Bright center
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 3, 2, 2);
  });

  // ─── Shuriken: Spinning star 12x12 ────────────────────────────
  createSimpleTexture(scene, 'shuriken', 12, 12, (ctx) => {
    // Dark outline shadow
    ctx.fillStyle = '#666666';
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
    // Main body
    ctx.fillStyle = '#CCCCCC';
    ctx.beginPath();
    ctx.moveTo(6, 1);
    ctx.lineTo(7, 5);
    ctx.lineTo(11, 6);
    ctx.lineTo(7, 7);
    ctx.lineTo(6, 11);
    ctx.lineTo(5, 7);
    ctx.lineTo(1, 6);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
    // Bright center hub
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 5, 1, 1);
    // Blade edge highlights
    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(5, 2, 1, 2);
    ctx.fillRect(5, 8, 1, 2);
    ctx.fillRect(2, 5, 2, 1);
    ctx.fillRect(8, 6, 2, 1);
    // Blade shadow detail
    ctx.fillStyle = '#999999';
    ctx.fillRect(6, 3, 1, 1);
    ctx.fillRect(6, 9, 1, 1);
    ctx.fillRect(3, 6, 1, 1);
    ctx.fillRect(9, 5, 1, 1);
  });

  // ─── War Lance: Lance 12x4 ────────────────────────────────────
  createSimpleTexture(scene, 'war_lance', 12, 4, (ctx) => {
    // Shaft with wood grain
    ctx.fillStyle = '#7A4A1E';
    ctx.fillRect(0, 1, 8, 2);
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(1, 1, 6, 1);
    // Shaft highlight
    ctx.fillStyle = '#9D6B3A';
    ctx.fillRect(3, 1, 3, 1);
    // Lance head with bevel
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(8, 0, 3, 4);
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(9, 1, 2, 2);
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(10, 1, 1, 1);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(11, 1, 1, 2);
    // Lance tip dark edge
    ctx.fillStyle = '#999999';
    ctx.fillRect(8, 3, 3, 1);
    // Guard with highlight
    ctx.fillStyle = '#D4A800';
    ctx.fillRect(7, 0, 1, 4);
    ctx.fillStyle = '#FFE844';
    ctx.fillRect(7, 1, 1, 1);
  });

  // ─── Flask: Potion bottle 6x8 with dark outline ───────────────
  createSimpleTexture(scene, 'flask', 6, 8, (ctx) => {
    // Dark outline around body
    ctx.fillStyle = '#1A3A1A';
    ctx.fillRect(0, 3, 1, 5);
    ctx.fillRect(5, 3, 1, 5);
    ctx.fillRect(1, 2, 4, 1);
    ctx.fillRect(1, 7, 4, 1);
    // Bottle body
    ctx.fillStyle = '#44CC44';
    ctx.fillRect(1, 3, 4, 4);
    // Bottle body shadow (right/bottom)
    ctx.fillStyle = '#338833';
    ctx.fillRect(4, 3, 1, 4);
    ctx.fillRect(1, 6, 4, 1);
    // Bottle neck outline
    ctx.fillStyle = '#555555';
    ctx.fillRect(1, 1, 1, 2);
    ctx.fillRect(4, 1, 1, 2);
    // Bottle neck
    ctx.fillStyle = '#888888';
    ctx.fillRect(2, 1, 2, 2);
    // Neck highlight
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(2, 1, 1, 1);
    // Cork with shading
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(2, 0, 2, 1);
    ctx.fillStyle = '#A06830';
    ctx.fillRect(2, 0, 1, 1);
    // Liquid shine
    ctx.fillStyle = '#88FF88';
    ctx.fillRect(2, 4, 2, 2);
    // Specular highlight on glass
    ctx.fillStyle = '#BBFFBB';
    ctx.fillRect(2, 4, 1, 1);
  });

  // ─── Holy Orb: Light sphere 8x8 ───────────────────────────────
  createSimpleTexture(scene, 'holy_orb', 8, 8, (ctx) => {
    // Faint outer glow
    ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
    ctx.beginPath();
    ctx.arc(4, 4, 3.9, 0, Math.PI * 2);
    ctx.fill();
    // Outer gold ring
    ctx.fillStyle = '#D4A800';
    ctx.beginPath();
    ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Main body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = '#FFEE88';
    ctx.beginPath();
    ctx.arc(4, 4, 2, 0, Math.PI * 2);
    ctx.fill();
    // Specular highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 2, 2, 2);
    ctx.fillRect(2, 3, 1, 1);
    // Shadow on bottom
    ctx.fillStyle = '#C89E00';
    ctx.fillRect(3, 6, 2, 1);
  });

  // ─── Ether Orb: Purple homing sphere 8x8 ──────────────────────
  createSimpleTexture(scene, 'ether_orb', 8, 8, (ctx) => {
    // Faint outer glow
    ctx.fillStyle = 'rgba(170, 102, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(4, 4, 3.9, 0, Math.PI * 2);
    ctx.fill();
    // Outer dark purple ring
    ctx.fillStyle = '#7744CC';
    ctx.beginPath();
    ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Main body
    ctx.fillStyle = '#AA66FF';
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = '#CC88FF';
    ctx.beginPath();
    ctx.arc(4, 4, 2, 0, Math.PI * 2);
    ctx.fill();
    // Bright inner core
    ctx.fillStyle = '#DD99FF';
    ctx.beginPath();
    ctx.arc(4, 3, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Specular highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 2, 2, 2);
    ctx.fillRect(2, 3, 1, 1);
    // Bottom shadow
    ctx.fillStyle = '#6633AA';
    ctx.fillRect(3, 6, 2, 1);
  });

  // ─── Nova ring (used by AoE weapons) ──────────────────────────
  createSimpleTexture(scene, 'nova_ring', 16, 16, (ctx) => {
    // Faint outer bloom
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(8, 8, 7.5, 0, Math.PI * 2);
    ctx.stroke();
    // Main ring
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.stroke();
    // Inner softer ring
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(8, 8, 5, 0, Math.PI * 2);
    ctx.stroke();
    // Sparkle accents on cardinal points
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(8, 1, 1, 1);
    ctx.fillRect(8, 14, 1, 1);
    ctx.fillRect(1, 8, 1, 1);
    ctx.fillRect(14, 8, 1, 1);
  });

  // ─── Enemy projectile: green 5px ──────────────────────────────
  createSimpleTexture(scene, 'enemy_bullet', 5, 5, (ctx) => {
    // Outer dark edge
    ctx.fillStyle = '#668811';
    ctx.beginPath();
    ctx.arc(2.5, 2.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Main body
    ctx.fillStyle = '#88CC22';
    ctx.beginPath();
    ctx.arc(2.5, 2.5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright
    ctx.fillStyle = '#AADE44';
    ctx.fillRect(1, 1, 2, 2);
    // Highlight pixel
    ctx.fillStyle = '#CCFF66';
    ctx.fillRect(1, 1, 1, 1);
  });

  // ─── Boss projectile: large purple 8px with extra color layer ─
  createSimpleTexture(scene, 'boss_bullet', 8, 8, (ctx) => {
    // Outer menacing glow
    ctx.fillStyle = 'rgba(170, 68, 204, 0.2)';
    ctx.beginPath();
    ctx.arc(4, 4, 3.9, 0, Math.PI * 2);
    ctx.fill();
    // Dark outer ring
    ctx.fillStyle = '#772299';
    ctx.beginPath();
    ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Main body
    ctx.fillStyle = '#AA44CC';
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Extra color layer: magenta-pink transition ring
    ctx.fillStyle = '#CC66DD';
    ctx.beginPath();
    ctx.arc(4, 4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Bright inner core
    ctx.fillStyle = '#DD88FF';
    ctx.fillRect(2, 2, 4, 4);
    // Hot center with highlight
    ctx.fillStyle = '#EECCFF';
    ctx.fillRect(3, 2, 2, 2);
    // White-hot core pixel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 3, 1, 1);
    // Bottom shadow on sphere
    ctx.fillStyle = '#662288';
    ctx.fillRect(3, 6, 2, 1);
  });

  // ─── Legacy textures (kept for compatibility) ─────────────────
  // Bullet 6x6 (improved from 4x4)
  createSimpleTexture(scene, 'bullet', 6, 6, (ctx) => {
    // Outer dark ring for definition
    ctx.fillStyle = '#C8A020';
    ctx.beginPath();
    ctx.arc(3, 3, 2.8, 0, Math.PI * 2);
    ctx.fill();
    // Main golden body
    ctx.fillStyle = '#FFDD44';
    ctx.beginPath();
    ctx.arc(3, 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Bright highlight (upper-left quadrant)
    ctx.fillStyle = '#FFEE88';
    ctx.fillRect(2, 1, 2, 2);
    // White specular
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, 2, 1, 1);
    // Shadow pixel (bottom)
    ctx.fillStyle = '#CC9922';
    ctx.fillRect(3, 5, 1, 1);
  });

  // ─── Melee weapon sprites ───────────────────────────────────

  // Dark Claymore blade 20x6
  createSimpleTexture(scene, 'weapon_claymore', 20, 6, (ctx) => {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, 3, 6);
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(1, 1, 1, 4);
    ctx.fillStyle = '#4A0000';
    ctx.fillRect(3, 1, 15, 4);
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(4, 1, 14, 1);
    ctx.fillStyle = '#660022';
    ctx.fillRect(4, 4, 14, 1);
    ctx.fillStyle = '#CC2222';
    ctx.fillRect(17, 2, 3, 2);
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(18, 2, 2, 2);
  });

  // Katana blade 18x4
  createSimpleTexture(scene, 'weapon_katana', 18, 4, (ctx) => {
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(0, 1, 3, 2);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(3, 0, 2, 4);
    ctx.fillStyle = '#CCDDEE';
    ctx.fillRect(5, 1, 12, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(6, 1, 11, 1);
    ctx.fillStyle = '#EEFFFF';
    ctx.fillRect(16, 1, 2, 1);
    ctx.fillStyle = '#AACCDD';
    ctx.fillRect(5, 2, 12, 1);
  });

  // Battle Axe double-headed 14x14
  createSimpleTexture(scene, 'weapon_axe', 14, 14, (ctx) => {
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(0, 6, 7, 2);
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(1, 6, 5, 2);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(6, 5, 2, 4);
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(7, 1, 5, 5);
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(8, 2, 4, 3);
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(11, 2, 2, 3);
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(7, 8, 5, 5);
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(8, 9, 4, 3);
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(11, 9, 2, 3);
  });

  // Iron Fist punching fist 12x10 - side view clenched fist punching right
  createSimpleTexture(scene, 'weapon_fist', 12, 10, (ctx) => {
    // Forearm
    ctx.fillStyle = '#DD9955';
    ctx.fillRect(0, 3, 3, 4);
    ctx.fillStyle = '#CC8844';
    ctx.fillRect(0, 4, 2, 2);

    // Fist body (clenched block shape)
    ctx.fillStyle = '#FFBB77';
    ctx.fillRect(3, 1, 5, 8);

    // Curled fingers - 4 rows making a fist front face
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(7, 1, 3, 2); // index
    ctx.fillRect(7, 3, 3, 2); // middle
    ctx.fillRect(7, 5, 3, 2); // ring
    ctx.fillRect(7, 7, 3, 2); // pinky
    // Finger separation lines (dark)
    ctx.fillStyle = '#CC8855';
    ctx.fillRect(7, 3, 3, 1);
    ctx.fillRect(7, 5, 3, 1);
    ctx.fillRect(7, 7, 3, 1);

    // Knuckle ridge (bright white/yellow highlights across top of curled fingers)
    ctx.fillStyle = '#FFEEDD';
    ctx.fillRect(8, 1, 2, 1);
    ctx.fillRect(8, 3, 2, 1);
    ctx.fillRect(8, 5, 2, 1);

    // Thumb curled across front
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(4, 0, 4, 2);
    ctx.fillStyle = '#FFDDAA';
    ctx.fillRect(5, 0, 2, 1);

    // Fist shading (dark edge bottom)
    ctx.fillStyle = '#CC8855';
    ctx.fillRect(3, 8, 5, 1);

    // Impact burst at knuckles
    ctx.fillStyle = '#FFEE44';
    ctx.fillRect(10, 2, 2, 1);
    ctx.fillRect(10, 4, 2, 1);
    ctx.fillRect(10, 6, 2, 1);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(11, 3, 1, 1);
    ctx.fillRect(11, 5, 1, 1);
  });

  // ─── Bahamut dragon silhouette 24x20 ────────────────────────
  createSimpleTexture(scene, 'bahamut_dragon', 24, 20, (ctx) => {
    // Wings spread
    ctx.fillStyle = '#442255';
    ctx.fillRect(1, 6, 8, 2);
    ctx.fillRect(2, 5, 6, 1);
    ctx.fillRect(3, 4, 4, 1);
    ctx.fillRect(15, 6, 8, 2);
    ctx.fillRect(16, 5, 6, 1);
    ctx.fillRect(17, 4, 4, 1);
    // Wing tips
    ctx.fillStyle = '#5533AA';
    ctx.fillRect(0, 6, 2, 1);
    ctx.fillRect(22, 6, 2, 1);
    // Body
    ctx.fillStyle = '#332244';
    ctx.fillRect(9, 6, 6, 8);
    // Head
    ctx.fillStyle = '#443355';
    ctx.fillRect(10, 2, 4, 5);
    ctx.fillRect(11, 1, 2, 2);
    // Eyes
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(10, 4, 1, 1);
    ctx.fillRect(13, 4, 1, 1);
    // Mouth fire
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(11, 7, 2, 1);
    // Tail
    ctx.fillStyle = '#332244';
    ctx.fillRect(11, 14, 2, 3);
    ctx.fillRect(12, 16, 2, 2);
    ctx.fillRect(13, 17, 2, 2);
    // Claws
    ctx.fillStyle = '#CCAA44';
    ctx.fillRect(9, 13, 2, 1);
    ctx.fillRect(13, 13, 2, 1);
    // Horns
    ctx.fillStyle = '#886644';
    ctx.fillRect(9, 2, 1, 2);
    ctx.fillRect(14, 2, 1, 2);
  });
}

function createSimpleTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): void {
  const canvas = scene.textures.createCanvas(key, w * SPRITE_SCALE, h * SPRITE_SCALE)!;
  const ctx = canvas.context;
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);
  draw(ctx);
  canvas.refresh();
}
