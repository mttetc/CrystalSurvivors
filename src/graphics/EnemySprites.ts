import { EnemyType, SPRITE_SCALE } from '../constants';

export function generateEnemyTextures(scene: Phaser.Scene): void {
  generateEnemyTexture(scene, EnemyType.SHAMBLER, 16, drawShambler);
  generateEnemyTexture(scene, EnemyType.SPRINTER, 16, drawSprinter);
  generateEnemyTexture(scene, EnemyType.BRUTE, 20, drawBrute);
  generateEnemyTexture(scene, EnemyType.SPITTER, 16, drawSpitter);
  generateEnemyTexture(scene, EnemyType.SPLITTER, 18, drawSplitter);
  generateEnemyTexture(scene, EnemyType.SWARMER, 12, drawSwarmer);
  generateEnemyTexture(scene, EnemyType.NECROMANCER, 18, drawNecromancer);
  generateEnemyTexture(scene, EnemyType.PHANTOM, 16, drawPhantom);
  generateEnemyTexture(scene, EnemyType.BOMBER, 14, drawBomber);
  generateEnemyTexture(scene, EnemyType.TANK, 22, drawTank);
  generateEnemyTexture(scene, EnemyType.LEAPER, 16, drawLeaper);
  generateBossTexture(scene, EnemyType.GOREHOUND, 40, drawGorehound);
  generateBossTexture(scene, EnemyType.HIVEMIND, 56, drawHivemind);
}

function generateEnemyTexture(
  scene: Phaser.Scene,
  key: string,
  size: number,
  drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number) => void,
): void {
  const frames = 2;
  const scaledSize = size * SPRITE_SCALE;
  const canvas = scene.textures.createCanvas(key, scaledSize * frames, scaledSize)!;
  const ctx = canvas.context;
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

  for (let f = 0; f < frames; f++) {
    drawFn(ctx, f * size, 0, size, f);
  }

  canvas.refresh();
  const texture = scene.textures.get(key);
  for (let f = 0; f < frames; f++) {
    texture.add(f, 0, f * scaledSize, 0, scaledSize, scaledSize);
  }
}

function generateBossTexture(
  scene: Phaser.Scene,
  key: string,
  size: number,
  drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number) => void,
): void {
  const frames = 2;
  const scaledSize = size * SPRITE_SCALE;
  const canvas = scene.textures.createCanvas(key, scaledSize * frames, scaledSize)!;
  const ctx = canvas.context;
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);

  for (let f = 0; f < frames; f++) {
    drawFn(ctx, f * size, 0, size, f);
  }

  canvas.refresh();
  const texture = scene.textures.get(key);
  for (let f = 0; f < frames; f++) {
    texture.add(f, 0, f * scaledSize, 0, scaledSize, scaledSize);
  }
}

/**
 * Draws a 1px dark outline around all non-transparent pixels in the given region.
 * Coordinates are in logical (unscaled) space - internally scales to actual canvas pixels.
 */
function addOutline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  const sx = x * SPRITE_SCALE, sy = y * SPRITE_SCALE;
  const sw = w * SPRITE_SCALE, sh = h * SPRITE_SCALE;
  const imageData = ctx.getImageData(sx, sy, sw, sh);
  const { data, width, height } = imageData;
  const outlinePixels: [number, number][] = [];
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const alpha = data[idx + 3];
      if (alpha > 0) continue;
      const neighbors = [
        [px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = (ny * width + nx) * 4;
          if (data[nIdx + 3] > 20) {
            outlinePixels.push([px, py]);
            break;
          }
        }
      }
    }
  }
  // Save/restore to draw outline at actual pixel level (bypassing ctx.scale)
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = color;
  for (const [px, py] of outlinePixels) {
    ctx.fillRect(sx + px, sy + py, 1, 1);
  }
  ctx.restore();
}

// ─── Shambler: Skeleton walker (16px) ───────────────────────────────
function drawShambler(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const bob = frame === 1 ? 1 : 0;
  const legSwing = frame === 1 ? 1 : 0;

  // Bony feet
  ctx.fillStyle = '#AAA999';
  ctx.fillRect(x + 4, y + 14, 3, 2);
  ctx.fillRect(x + 9, y + 14, 3, 2);
  // Toe detail
  ctx.fillStyle = '#999888';
  ctx.fillRect(x + 4, y + 15, 1, 1);
  ctx.fillRect(x + 11, y + 15, 1, 1);

  // Skeletal legs (thin bones, longer)
  ctx.fillStyle = '#D8D8C4';
  ctx.fillRect(x + 4 + legSwing, y + 10 + bob, 2, 4);
  ctx.fillRect(x + 10 - legSwing, y + 10 + bob, 2, 4);
  // Knee joints
  ctx.fillStyle = '#AAA999';
  ctx.fillRect(x + 4 + legSwing, y + 11 + bob, 2, 1);
  ctx.fillRect(x + 10 - legSwing, y + 11 + bob, 2, 1);
  // Shin highlight
  ctx.fillStyle = '#E8E8D4';
  ctx.fillRect(x + 4 + legSwing, y + 12 + bob, 1, 1);
  ctx.fillRect(x + 10 - legSwing, y + 12 + bob, 1, 1);
  // Leg shadow
  ctx.fillStyle = '#C0C0AC';
  ctx.fillRect(x + 5 + legSwing, y + 12 + bob, 1, 2);
  ctx.fillRect(x + 11 - legSwing, y + 12 + bob, 1, 2);

  // Pelvis bone
  ctx.fillStyle = '#C8C8B4';
  ctx.fillRect(x + 3, y + 9 + bob, 10, 1);
  ctx.fillStyle = '#D4D4C0';
  ctx.fillRect(x + 6, y + 9 + bob, 4, 1);

  // Rib cage (taller)
  ctx.fillStyle = '#D8D8C4';
  ctx.fillRect(x + 3, y + 4 + bob, 10, 5);
  // Rib gaps (more detail)
  ctx.fillStyle = '#222211';
  ctx.fillRect(x + 4, y + 4 + bob, 8, 1);
  ctx.fillRect(x + 4, y + 6 + bob, 8, 1);
  ctx.fillRect(x + 4, y + 8 + bob, 8, 1);
  // Spine
  ctx.fillStyle = '#BBBB99';
  ctx.fillRect(x + 7, y + 4 + bob, 2, 6);
  // Rib cage highlights
  ctx.fillStyle = '#E4E4D0';
  ctx.fillRect(x + 4, y + 5 + bob, 3, 1);
  ctx.fillRect(x + 9, y + 5 + bob, 3, 1);
  ctx.fillRect(x + 5, y + 7 + bob, 2, 1);
  ctx.fillRect(x + 9, y + 7 + bob, 2, 1);

  // Bony arms (longer)
  ctx.fillStyle = '#D8D8C4';
  ctx.fillRect(x + 2, y + 4 + bob, 1, 2);
  ctx.fillRect(x + 1, y + 6 + bob, 1, 4);
  ctx.fillRect(x + 13, y + 4 + bob, 1, 2);
  ctx.fillRect(x + 14, y + 6 + bob, 1, 4);
  // Bony hand claws
  ctx.fillStyle = '#AAA999';
  ctx.fillRect(x + 0, y + 10 + bob, 2, 1);
  ctx.fillRect(x + 14, y + 10 + bob, 2, 1);
  // Arm highlights
  ctx.fillStyle = '#E4E4D0';
  ctx.fillRect(x + 1, y + 6 + bob, 1, 1);
  ctx.fillRect(x + 14, y + 6 + bob, 1, 1);
  // Elbow joint
  ctx.fillStyle = '#AAA999';
  ctx.fillRect(x + 1, y + 8 + bob, 1, 1);
  ctx.fillRect(x + 14, y + 8 + bob, 1, 1);

  // Neck vertebra
  ctx.fillStyle = '#C8C8B4';
  ctx.fillRect(x + 6, y + 3 + bob, 4, 1);

  // Skull head (bigger)
  ctx.fillStyle = '#E8E8D8';
  ctx.fillRect(x + 4, y + 0 + bob, 8, 3);
  ctx.fillRect(x + 3, y + 1 + bob, 10, 2);
  // Skull top highlight
  ctx.fillStyle = '#F0F0E4';
  ctx.fillRect(x + 5, y + 0 + bob, 6, 1);
  // Skull sides shadow
  ctx.fillStyle = '#D0D0C0';
  ctx.fillRect(x + 3, y + 1 + bob, 1, 2);
  ctx.fillRect(x + 12, y + 1 + bob, 1, 2);
  // Temple detail
  ctx.fillStyle = '#DCDCC8';
  ctx.fillRect(x + 4, y + 2 + bob, 1, 1);
  ctx.fillRect(x + 11, y + 2 + bob, 1, 1);

  // Deep dark eye sockets
  ctx.fillStyle = '#0A0A08';
  ctx.fillRect(x + 5, y + 1 + bob, 2, 2);
  ctx.fillRect(x + 9, y + 1 + bob, 2, 2);

  // Red eye pinpoints
  ctx.fillStyle = '#BB3333';
  ctx.fillRect(x + 5, y + 1 + bob, 1, 1);
  ctx.fillRect(x + 10, y + 1 + bob, 1, 1);
  // Eye glow highlight
  ctx.fillStyle = '#DD5555';
  ctx.fillRect(x + 5, y + 1 + bob, 1, 1);

  // Nasal cavity
  ctx.fillStyle = '#0A0A08';
  ctx.fillRect(x + 7, y + 2 + bob, 2, 1);

  // Lower jaw
  ctx.fillStyle = '#C8C8B4';
  ctx.fillRect(x + 5, y + 3 + bob, 6, 1);
  // Teeth gaps
  ctx.fillStyle = '#0A0A08';
  ctx.fillRect(x + 6, y + 3 + bob, 1, 1);
  ctx.fillRect(x + 8, y + 3 + bob, 1, 1);
  ctx.fillRect(x + 10, y + 3 + bob, 1, 1);

  addOutline(ctx, x, y, s, s, '#0A0A06');
}

// ─── Sprinter: Bat (16px) ───────────────────────────────────────────
function drawSprinter(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const wingFlap = frame === 1 ? -2 : 1;

  // Left wing membrane
  ctx.fillStyle = '#2D1545';
  ctx.fillRect(x + 4, y + 6, 1, 2);
  ctx.fillRect(x + 3, y + 4 + wingFlap, 1, 3);
  ctx.fillRect(x + 2, y + 3 + wingFlap, 1, 4);
  ctx.fillRect(x + 1, y + 3 + wingFlap, 1, 4);
  ctx.fillRect(x + 0, y + 4 + wingFlap, 1, 4);
  // Wing membrane fill
  ctx.fillStyle = '#3D2060';
  ctx.fillRect(x + 1, y + 5 + wingFlap, 4, 3);
  ctx.fillRect(x + 0, y + 5 + wingFlap, 2, 3);
  // Wing finger bones
  ctx.fillStyle = '#4A2870';
  ctx.fillRect(x + 0, y + 4 + wingFlap, 1, 1);
  ctx.fillRect(x + 1, y + 3 + wingFlap, 1, 1);
  ctx.fillRect(x + 2, y + 2 + wingFlap, 1, 1);
  // Wing vein detail
  ctx.fillStyle = '#5A3888';
  ctx.fillRect(x + 1, y + 4 + wingFlap, 1, 1);
  ctx.fillRect(x + 2, y + 5 + wingFlap, 1, 1);
  ctx.fillRect(x + 3, y + 6 + wingFlap, 1, 1);
  // Wing highlight
  ctx.fillStyle = '#4A2878';
  ctx.fillRect(x + 1, y + 5 + wingFlap, 2, 1);

  // Right wing membrane
  ctx.fillStyle = '#2D1545';
  ctx.fillRect(x + 11, y + 6, 1, 2);
  ctx.fillRect(x + 12, y + 4 + wingFlap, 1, 3);
  ctx.fillRect(x + 13, y + 3 + wingFlap, 1, 4);
  ctx.fillRect(x + 14, y + 3 + wingFlap, 1, 4);
  ctx.fillRect(x + 15, y + 4 + wingFlap, 1, 4);
  ctx.fillStyle = '#3D2060';
  ctx.fillRect(x + 11, y + 5 + wingFlap, 4, 3);
  ctx.fillRect(x + 14, y + 5 + wingFlap, 2, 3);
  ctx.fillStyle = '#4A2870';
  ctx.fillRect(x + 15, y + 4 + wingFlap, 1, 1);
  ctx.fillRect(x + 14, y + 3 + wingFlap, 1, 1);
  ctx.fillRect(x + 13, y + 2 + wingFlap, 1, 1);
  ctx.fillStyle = '#5A3888';
  ctx.fillRect(x + 14, y + 4 + wingFlap, 1, 1);
  ctx.fillRect(x + 13, y + 5 + wingFlap, 1, 1);
  ctx.fillRect(x + 12, y + 6 + wingFlap, 1, 1);
  ctx.fillStyle = '#4A2878';
  ctx.fillRect(x + 13, y + 5 + wingFlap, 2, 1);

  // Bat body (larger)
  ctx.fillStyle = '#1E0E30';
  ctx.fillRect(x + 5, y + 5, 6, 6);
  // Belly fur detail
  ctx.fillStyle = '#2D1545';
  ctx.fillRect(x + 6, y + 6, 4, 4);
  // Body highlight
  ctx.fillStyle = '#2A1840';
  ctx.fillRect(x + 6, y + 5, 4, 1);
  // Fur texture
  ctx.fillStyle = '#241240';
  ctx.fillRect(x + 7, y + 8, 1, 2);

  // Pointed ears (taller)
  ctx.fillStyle = '#2D1545';
  ctx.fillRect(x + 5, y + 1, 2, 3);
  ctx.fillRect(x + 9, y + 1, 2, 3);
  // Ear insides
  ctx.fillStyle = '#551133';
  ctx.fillRect(x + 5, y + 2, 1, 2);
  ctx.fillRect(x + 10, y + 2, 1, 2);
  // Ear tip highlights
  ctx.fillStyle = '#3D2060';
  ctx.fillRect(x + 5, y + 1, 1, 1);
  ctx.fillRect(x + 10, y + 1, 1, 1);

  // Head (larger)
  ctx.fillStyle = '#2D1545';
  ctx.fillRect(x + 5, y + 4, 6, 3);
  // Snout
  ctx.fillStyle = '#3D2060';
  ctx.fillRect(x + 6, y + 6, 4, 1);
  // Forehead highlight
  ctx.fillStyle = '#3A2058';
  ctx.fillRect(x + 6, y + 4, 4, 1);
  // Nose
  ctx.fillStyle = '#1E0E30';
  ctx.fillRect(x + 7, y + 6, 2, 1);

  // Bright red glowing eyes
  ctx.fillStyle = '#FF2222';
  ctx.fillRect(x + 6, y + 4, 2, 1);
  ctx.fillRect(x + 9, y + 4, 2, 1);
  // Eye glow highlight
  ctx.fillStyle = '#FF6666';
  ctx.fillRect(x + 6, y + 4, 1, 1);
  ctx.fillRect(x + 10, y + 4, 1, 1);

  // Sharp fangs
  ctx.fillStyle = '#E8E8D8';
  ctx.fillRect(x + 6, y + 7, 1, 1);
  ctx.fillRect(x + 9, y + 7, 1, 1);

  // Clawed feet
  ctx.fillStyle = '#1E0E30';
  ctx.fillRect(x + 5, y + 11, 2, 1);
  ctx.fillRect(x + 9, y + 11, 2, 1);
  // Claw tips
  ctx.fillStyle = '#AAA999';
  ctx.fillRect(x + 5, y + 12, 1, 1);
  ctx.fillRect(x + 10, y + 12, 1, 1);

  addOutline(ctx, x, y, s, s, '#0A0610');
}

// ─── Brute: Armored Revenant (20px) ─────────────────────────────────
function drawBrute(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const bob = frame === 1 ? -1 : 0;

  // Armored boots
  ctx.fillStyle = '#2A2A2A';
  ctx.fillRect(x + 3, y + 16 + bob, 5, 4);
  ctx.fillRect(x + 12, y + 16 + bob, 5, 4);
  // Boot metal trim
  ctx.fillStyle = '#3A3A3A';
  ctx.fillRect(x + 3, y + 16 + bob, 5, 1);
  ctx.fillRect(x + 12, y + 16 + bob, 5, 1);
  // Boot spikes
  ctx.fillStyle = '#555555';
  ctx.fillRect(x + 5, y + 19 + bob, 1, 1);
  ctx.fillRect(x + 14, y + 19 + bob, 1, 1);
  // Boot highlight
  ctx.fillStyle = '#3E3E3E';
  ctx.fillRect(x + 3, y + 16 + bob, 1, 2);
  ctx.fillRect(x + 12, y + 16 + bob, 1, 2);
  // Boot sole
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(x + 3, y + 19 + bob, 5, 1);
  ctx.fillRect(x + 12, y + 19 + bob, 5, 1);

  // Heavy leg armor
  ctx.fillStyle = '#222222';
  ctx.fillRect(x + 4, y + 13 + bob, 4, 3);
  ctx.fillRect(x + 12, y + 13 + bob, 4, 3);
  // Leg armor highlight
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x + 4, y + 13 + bob, 2, 1);
  ctx.fillRect(x + 12, y + 13 + bob, 2, 1);
  // Knee plate
  ctx.fillStyle = '#333333';
  ctx.fillRect(x + 4, y + 14 + bob, 4, 1);
  ctx.fillRect(x + 12, y + 14 + bob, 4, 1);

  // Massive torso armor
  ctx.fillStyle = '#1C1C1C';
  ctx.fillRect(x + 2, y + 6 + bob, 16, 7);
  // Chest plate ridges
  ctx.fillStyle = '#2E2E2E';
  ctx.fillRect(x + 3, y + 6 + bob, 14, 1);
  ctx.fillRect(x + 3, y + 8 + bob, 14, 1);
  ctx.fillRect(x + 3, y + 10 + bob, 14, 1);
  ctx.fillRect(x + 3, y + 12 + bob, 14, 1);
  // Upper plate highlight
  ctx.fillStyle = '#353535';
  ctx.fillRect(x + 4, y + 6 + bob, 12, 1);
  // Central chest emblem (skull motif)
  ctx.fillStyle = '#444444';
  ctx.fillRect(x + 7, y + 7 + bob, 6, 4);
  ctx.fillStyle = '#1C1C1C';
  ctx.fillRect(x + 8, y + 7 + bob, 2, 2);
  ctx.fillRect(x + 11, y + 7 + bob, 2, 2);
  ctx.fillRect(x + 9, y + 10 + bob, 2, 1);
  // Emblem glow
  ctx.fillStyle = '#555555';
  ctx.fillRect(x + 9, y + 8 + bob, 2, 1);
  // Abdomen plating
  ctx.fillStyle = '#1E1E1E';
  ctx.fillRect(x + 3, y + 11 + bob, 14, 2);

  // Massive spiked shoulder pauldrons
  ctx.fillStyle = '#2A2A2E';
  ctx.fillRect(x + 0, y + 5 + bob, 4, 5);
  ctx.fillRect(x + 16, y + 5 + bob, 4, 5);
  // Pauldron spikes
  ctx.fillStyle = '#666666';
  ctx.fillRect(x + 0, y + 4 + bob, 1, 1);
  ctx.fillRect(x + 3, y + 4 + bob, 1, 1);
  ctx.fillRect(x + 16, y + 4 + bob, 1, 1);
  ctx.fillRect(x + 19, y + 4 + bob, 1, 1);
  // Extra center spike
  ctx.fillStyle = '#777777';
  ctx.fillRect(x + 1, y + 3 + bob, 1, 1);
  ctx.fillRect(x + 18, y + 3 + bob, 1, 1);
  // Pauldron edge highlights
  ctx.fillStyle = '#3A3A3E';
  ctx.fillRect(x + 0, y + 5 + bob, 4, 1);
  ctx.fillRect(x + 16, y + 5 + bob, 4, 1);
  // Pauldron rivet
  ctx.fillStyle = '#505050';
  ctx.fillRect(x + 1, y + 7 + bob, 1, 1);
  ctx.fillRect(x + 18, y + 7 + bob, 1, 1);

  // Armored gauntlets
  ctx.fillStyle = '#222222';
  ctx.fillRect(x + 0, y + 10 + bob, 3, 4);
  ctx.fillRect(x + 17, y + 10 + bob, 3, 4);
  // Gauntlet claws
  ctx.fillStyle = '#555555';
  ctx.fillRect(x + 0, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 19, y + 14 + bob, 1, 1);
  // Gauntlet highlight
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x + 0, y + 10 + bob, 1, 2);
  ctx.fillRect(x + 19, y + 10 + bob, 1, 2);

  // Neck guard
  ctx.fillStyle = '#2A2A2A';
  ctx.fillRect(x + 5, y + 4 + bob, 10, 2);
  ctx.fillStyle = '#333333';
  ctx.fillRect(x + 6, y + 4 + bob, 8, 1);

  // Skull helmet
  ctx.fillStyle = '#333333';
  ctx.fillRect(x + 4, y + 0 + bob, 12, 5);
  // Helmet crest
  ctx.fillStyle = '#444444';
  ctx.fillRect(x + 6, y + 0 + bob, 8, 1);
  // Helmet crest highlight
  ctx.fillStyle = '#505050';
  ctx.fillRect(x + 7, y + 0 + bob, 6, 1);
  // Helmet face plate
  ctx.fillStyle = '#222222';
  ctx.fillRect(x + 5, y + 1 + bob, 10, 4);

  // Visor slit
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(x + 6, y + 2 + bob, 8, 2);

  // Blazing red eyes
  ctx.fillStyle = '#DD2222';
  ctx.fillRect(x + 6, y + 2 + bob, 3, 2);
  ctx.fillRect(x + 11, y + 2 + bob, 3, 2);
  // Bright eye cores
  ctx.fillStyle = '#FF5544';
  ctx.fillRect(x + 7, y + 3 + bob, 1, 1);
  ctx.fillRect(x + 12, y + 3 + bob, 1, 1);
  // Eye white-hot center
  ctx.fillStyle = '#FF9988';
  ctx.fillRect(x + 7, y + 3 + bob, 1, 1);

  // Red glow beneath helmet
  ctx.fillStyle = 'rgba(220, 40, 40, 0.25)';
  ctx.fillRect(x + 6, y + 4 + bob, 8, 1);

  // Dark energy crackling
  ctx.fillStyle = 'rgba(100, 20, 20, 0.3)';
  ctx.fillRect(x + 1, y + 4 + bob, 1, 1);
  ctx.fillRect(x + 18, y + 4 + bob, 1, 1);
  ctx.fillRect(x + 2, y + 3 + bob, 1, 1);
  ctx.fillRect(x + 17, y + 3 + bob, 1, 1);

  addOutline(ctx, x, y, s, s, '#080808');
}

// ─── Spitter: Ghost (16px) ──────────────────────────────────────────
function drawSpitter(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const hover = frame === 1 ? -1 : 0;

  // Outer ethereal glow
  ctx.fillStyle = 'rgba(180, 190, 220, 0.08)';
  ctx.beginPath();
  ctx.ellipse(x + s / 2, y + 7 + hover, 8, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wispy trailing tendrils
  ctx.fillStyle = 'rgba(190, 195, 220, 0.15)';
  ctx.fillRect(x + 2, y + 13 + hover, 1, 2);
  ctx.fillRect(x + 5, y + 14 + hover, 1, 2);
  ctx.fillRect(x + 8, y + 13 + hover, 1, 2);
  ctx.fillRect(x + 11, y + 14 + hover, 1, 2);
  ctx.fillRect(x + 13, y + 13 + hover, 1, 2);

  // Ragged bottom edge
  ctx.fillStyle = 'rgba(200, 205, 230, 0.22)';
  ctx.fillRect(x + 2, y + 12 + hover, 3, 1);
  ctx.fillRect(x + 6, y + 12 + hover, 2, 2);
  ctx.fillRect(x + 9, y + 12 + hover, 3, 1);
  ctx.fillRect(x + 4, y + 13 + hover, 2, 1);
  ctx.fillRect(x + 11, y + 13 + hover, 2, 1);

  // Main ghost body
  ctx.fillStyle = 'rgba(210, 215, 240, 0.35)';
  ctx.fillRect(x + 3, y + 3 + hover, 10, 9);
  ctx.fillRect(x + 2, y + 5 + hover, 12, 5);

  // Brighter inner core
  ctx.fillStyle = 'rgba(230, 235, 255, 0.45)';
  ctx.fillRect(x + 4, y + 4 + hover, 8, 7);

  // Head shape
  ctx.fillStyle = 'rgba(240, 242, 255, 0.5)';
  ctx.fillRect(x + 3, y + 2 + hover, 10, 4);
  ctx.fillRect(x + 4, y + 1 + hover, 8, 2);

  // Head top highlight
  ctx.fillStyle = 'rgba(250, 252, 255, 0.55)';
  ctx.fillRect(x + 5, y + 1 + hover, 6, 1);
  // Extra subtle top glow
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(x + 6, y + 0 + hover, 4, 1);

  // Hollow dark eye voids
  ctx.fillStyle = '#080808';
  ctx.fillRect(x + 4, y + 3 + hover, 3, 3);
  ctx.fillRect(x + 9, y + 3 + hover, 3, 3);

  // Ghost green glow in eyes
  ctx.fillStyle = 'rgba(80, 255, 100, 0.5)';
  ctx.fillRect(x + 5, y + 4 + hover, 1, 1);
  ctx.fillRect(x + 10, y + 4 + hover, 1, 1);
  // Brighter eye highlight
  ctx.fillStyle = 'rgba(120, 255, 140, 0.6)';
  ctx.fillRect(x + 5, y + 4 + hover, 1, 1);

  // Wailing mouth
  ctx.fillStyle = '#080808';
  ctx.fillRect(x + 5, y + 8 + hover, 6, 3);
  // Mouth depth glow
  ctx.fillStyle = 'rgba(80, 255, 100, 0.15)';
  ctx.fillRect(x + 7, y + 8 + hover, 2, 2);
  // Mouth edge
  ctx.fillStyle = 'rgba(80, 255, 100, 0.1)';
  ctx.fillRect(x + 5, y + 10 + hover, 6, 1);

  // Wispy arms
  ctx.fillStyle = 'rgba(210, 215, 240, 0.2)';
  ctx.fillRect(x + 1, y + 6 + hover, 2, 2);
  ctx.fillRect(x + 0, y + 8 + hover, 1, 2);
  ctx.fillRect(x + 13, y + 6 + hover, 2, 2);
  ctx.fillRect(x + 15, y + 8 + hover, 1, 2);
  // Arm tip highlights
  ctx.fillStyle = 'rgba(230, 235, 255, 0.25)';
  ctx.fillRect(x + 0, y + 8 + hover, 1, 1);
  ctx.fillRect(x + 15, y + 8 + hover, 1, 1);

  addOutline(ctx, x, y, s, s, 'rgba(20, 20, 40, 0.3)');
}

// ─── Splitter: Pumpkin horror (18px) ────────────────────────────────
function drawSplitter(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const wobble = frame === 1 ? 1 : 0;
  const cx = x + s / 2;

  // Eerie green glow underneath
  ctx.fillStyle = 'rgba(68, 255, 68, 0.1)';
  ctx.beginPath();
  ctx.ellipse(cx, y + s / 2 + wobble, s / 2 + 1, s / 2 + 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main pumpkin body (larger, rounder)
  ctx.fillStyle = '#B85518';
  ctx.fillRect(x + 2, y + 5 + wobble, 14, 10);
  ctx.fillRect(x + 3, y + 4 + wobble, 12, 12);
  ctx.fillRect(x + 5, y + 3 + wobble, 8, 13);

  // Pumpkin ridges
  ctx.fillStyle = '#8B3A0E';
  ctx.fillRect(x + 5, y + 4 + wobble, 1, 12);
  ctx.fillRect(x + 9, y + 3 + wobble, 1, 13);
  ctx.fillRect(x + 13, y + 4 + wobble, 1, 12);

  // Pumpkin highlights between ridges
  ctx.fillStyle = '#CC6622';
  ctx.fillRect(x + 6, y + 5 + wobble, 3, 9);
  ctx.fillRect(x + 10, y + 5 + wobble, 3, 9);
  // Extra bright highlight
  ctx.fillStyle = '#DD7733';
  ctx.fillRect(x + 6, y + 5 + wobble, 3, 3);
  ctx.fillRect(x + 10, y + 5 + wobble, 3, 3);
  // Specular highlight
  ctx.fillStyle = '#EE8844';
  ctx.fillRect(x + 7, y + 5 + wobble, 1, 2);

  // Pumpkin bottom shadow
  ctx.fillStyle = '#8B3A0E';
  ctx.fillRect(x + 3, y + 15 + wobble, 12, 1);

  // Crack running down the middle
  ctx.fillStyle = '#1A0A00';
  ctx.fillRect(cx, y + 3 + wobble, 1, 7);
  ctx.fillRect(cx - 1, y + 5 + wobble, 1, 3);
  ctx.fillRect(cx + 1, y + 8 + wobble, 1, 3);
  // Crack glow
  ctx.fillStyle = 'rgba(68, 255, 68, 0.5)';
  ctx.fillRect(cx, y + 4 + wobble, 1, 4);
  // Crack branching
  ctx.fillStyle = 'rgba(68, 255, 68, 0.3)';
  ctx.fillRect(cx - 1, y + 6 + wobble, 1, 1);
  ctx.fillRect(cx + 1, y + 9 + wobble, 1, 1);

  // Carved evil eyes (larger)
  ctx.fillStyle = '#44FF44';
  ctx.fillRect(x + 3, y + 8 + wobble, 4, 3);
  ctx.fillRect(x + 4, y + 7 + wobble, 3, 1);
  ctx.fillRect(x + 5, y + 6 + wobble, 2, 1);
  ctx.fillRect(x + 11, y + 8 + wobble, 4, 3);
  ctx.fillRect(x + 12, y + 7 + wobble, 3, 1);
  ctx.fillRect(x + 13, y + 6 + wobble, 2, 1);
  // Bright eye centers
  ctx.fillStyle = '#88FF88';
  ctx.fillRect(x + 5, y + 8 + wobble, 2, 2);
  ctx.fillRect(x + 12, y + 8 + wobble, 2, 2);
  // Hot-white eye pixel
  ctx.fillStyle = '#CCFFCC';
  ctx.fillRect(x + 5, y + 8 + wobble, 1, 1);
  ctx.fillRect(x + 12, y + 8 + wobble, 1, 1);

  // Evil jagged mouth (larger)
  ctx.fillStyle = '#44FF44';
  ctx.fillRect(x + 3, y + 12 + wobble, 12, 3);
  // Teeth
  ctx.fillStyle = '#B85518';
  ctx.fillRect(x + 4, y + 12 + wobble, 2, 3);
  ctx.fillRect(x + 7, y + 12 + wobble, 1, 2);
  ctx.fillRect(x + 10, y + 12 + wobble, 2, 3);
  ctx.fillRect(x + 13, y + 12 + wobble, 1, 2);
  // Bright mouth interior
  ctx.fillStyle = '#88FF88';
  ctx.fillRect(x + 6, y + 13 + wobble, 1, 1);
  ctx.fillRect(x + 8, y + 13 + wobble, 2, 1);
  ctx.fillRect(x + 12, y + 13 + wobble, 1, 1);

  // Stem on top
  ctx.fillStyle = '#2A1A0A';
  ctx.fillRect(cx - 1, y + 1 + wobble, 3, 3);
  ctx.fillRect(cx, y + 0 + wobble, 2, 1);
  // Stem highlight
  ctx.fillStyle = '#3A2A1A';
  ctx.fillRect(cx - 1, y + 1 + wobble, 1, 2);
  // Stem dark
  ctx.fillStyle = '#1A0A00';
  ctx.fillRect(cx + 1, y + 2 + wobble, 1, 1);

  // Leaf curl
  ctx.fillStyle = '#1A2A0A';
  ctx.fillRect(cx + 2, y + 1 + wobble, 2, 1);
  ctx.fillRect(cx + 3, y + 2 + wobble, 1, 1);
  ctx.fillStyle = '#2A3A1A';
  ctx.fillRect(cx + 2, y + 1 + wobble, 1, 1);

  addOutline(ctx, x, y, s, s, '#1A0800');
}

// ─── Swarmer: Tiny skull (12px) ─────────────────────────────────────
function drawSwarmer(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const flutter = frame === 1 ? -1 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.fillRect(x + 3, y + 11 + flutter, 6, 1);

  // Skull dome
  ctx.fillStyle = '#E0E0D0';
  ctx.fillRect(x + 3, y + 1 + flutter, 6, 1);
  ctx.fillRect(x + 2, y + 2 + flutter, 8, 2);

  // Main skull body
  ctx.fillStyle = '#D8D8C8';
  ctx.fillRect(x + 2, y + 4 + flutter, 8, 4);

  // Skull top highlight
  ctx.fillStyle = '#ECECE0';
  ctx.fillRect(x + 4, y + 1 + flutter, 4, 1);
  ctx.fillRect(x + 3, y + 2 + flutter, 6, 1);

  // Skull sides
  ctx.fillStyle = '#C0C0B0';
  ctx.fillRect(x + 2, y + 4 + flutter, 1, 4);
  ctx.fillRect(x + 9, y + 4 + flutter, 1, 4);

  // Cheekbones
  ctx.fillStyle = '#D0D0C0';
  ctx.fillRect(x + 3, y + 5 + flutter, 1, 2);
  ctx.fillRect(x + 8, y + 5 + flutter, 1, 2);

  // Eye sockets
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 3, y + 4 + flutter, 3, 2);
  ctx.fillRect(x + 7, y + 4 + flutter, 2, 2);

  // Red glowing eyes
  ctx.fillStyle = '#DD3333';
  ctx.fillRect(x + 3, y + 4 + flutter, 1, 1);
  ctx.fillRect(x + 8, y + 4 + flutter, 1, 1);
  ctx.fillStyle = '#FF5555';
  ctx.fillRect(x + 4, y + 4 + flutter, 1, 1);

  // Nasal cavity
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 5, y + 6 + flutter, 2, 1);

  // Jaw
  ctx.fillStyle = '#C8C8B8';
  ctx.fillRect(x + 3, y + 8 + flutter, 6, 2);
  // Teeth gaps
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 4, y + 8 + flutter, 1, 1);
  ctx.fillRect(x + 6, y + 8 + flutter, 1, 1);
  ctx.fillRect(x + 8, y + 8 + flutter, 1, 1);

  // Jaw hinge
  ctx.fillStyle = '#AAA898';
  ctx.fillRect(x + 2, y + 7 + flutter, 1, 2);
  ctx.fillRect(x + 9, y + 7 + flutter, 1, 2);

  addOutline(ctx, x, y, s, s, '#0A0A06');
}

// ─── Necromancer: Dark robed lich (18px) ────────────────────────────
function drawNecromancer(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const hover = frame === 1 ? -1 : 0;

  // Dark robe base
  ctx.fillStyle = '#100A18';
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 6 + hover);
  ctx.lineTo(x + 0, y + 17);
  ctx.lineTo(x + 14, y + 17);
  ctx.lineTo(x + 10, y + 6 + hover);
  ctx.closePath();
  ctx.fill();

  // Robe tattered bottom
  ctx.fillStyle = '#0A0610';
  ctx.fillRect(x + 0, y + 16, 2, 1);
  ctx.fillRect(x + 4, y + 17, 2, 1);
  ctx.fillRect(x + 8, y + 17, 2, 1);
  ctx.fillRect(x + 12, y + 16, 2, 1);

  // Robe folds
  ctx.fillStyle = '#1A1225';
  ctx.fillRect(x + 2, y + 10 + hover, 1, 6);
  ctx.fillRect(x + 6, y + 8 + hover, 1, 7);
  ctx.fillRect(x + 10, y + 10 + hover, 1, 6);
  // Robe fold highlights
  ctx.fillStyle = '#221830';
  ctx.fillRect(x + 3, y + 10 + hover, 1, 5);
  ctx.fillRect(x + 7, y + 8 + hover, 1, 6);
  ctx.fillRect(x + 9, y + 10 + hover, 1, 5);

  // Robe trim
  ctx.fillStyle = '#2A1A3E';
  ctx.fillRect(x + 1, y + 14, 12, 1);
  ctx.fillStyle = '#3A2A4E';
  ctx.fillRect(x + 2, y + 14, 4, 1);

  // Belt/sash
  ctx.fillStyle = '#2D1545';
  ctx.fillRect(x + 2, y + 9 + hover, 10, 1);
  ctx.fillStyle = '#443366';
  ctx.fillRect(x + 6, y + 9 + hover, 2, 1);

  // Tall pointed hood
  ctx.fillStyle = '#1A1025';
  ctx.fillRect(x + 3, y + 2 + hover, 8, 5);
  ctx.fillRect(x + 4, y + 1 + hover, 6, 1);
  ctx.fillRect(x + 5, y + 0 + hover, 4, 1);
  ctx.fillRect(x + 6, y - 1 + hover, 2, 1);

  // Hood edge highlight
  ctx.fillStyle = '#2A1A3E';
  ctx.fillRect(x + 3, y + 2 + hover, 1, 5);
  ctx.fillRect(x + 10, y + 2 + hover, 1, 5);
  // Hood top highlight
  ctx.fillStyle = '#2A1A3E';
  ctx.fillRect(x + 6, y - 1 + hover, 1, 1);
  // Hood inner shadow
  ctx.fillStyle = '#120A1E';
  ctx.fillRect(x + 4, y + 3 + hover, 6, 3);

  // Deep shadow inside hood
  ctx.fillStyle = '#0A0610';
  ctx.fillRect(x + 5, y + 4 + hover, 4, 3);

  // Glowing green skull eyes
  ctx.fillStyle = '#44FF44';
  ctx.fillRect(x + 5, y + 4 + hover, 2, 2);
  ctx.fillRect(x + 8, y + 4 + hover, 2, 2);
  // Brighter cores
  ctx.fillStyle = '#99FF99';
  ctx.fillRect(x + 5, y + 4 + hover, 1, 1);
  ctx.fillRect(x + 9, y + 5 + hover, 1, 1);
  // White-hot center
  ctx.fillStyle = '#CCFFCC';
  ctx.fillRect(x + 5, y + 4 + hover, 1, 1);

  // Faint mouth glow
  ctx.fillStyle = 'rgba(68, 255, 68, 0.4)';
  ctx.fillRect(x + 6, y + 6 + hover, 2, 1);

  // Staff
  ctx.fillStyle = '#3A2A1A';
  ctx.fillRect(x + 14, y + 2 + hover, 1, 14);
  ctx.fillStyle = '#2A1A0A';
  ctx.fillRect(x + 14, y + 6 + hover, 1, 1);
  ctx.fillRect(x + 14, y + 10 + hover, 1, 1);
  ctx.fillStyle = '#4A3A2A';
  ctx.fillRect(x + 14, y + 3 + hover, 1, 2);

  // Skull on staff
  ctx.fillStyle = '#D8D8C8';
  ctx.fillRect(x + 13, y + 0 + hover, 4, 3);
  ctx.fillStyle = '#E8E8D8';
  ctx.fillRect(x + 13, y + 1 + hover, 3, 1);
  ctx.fillStyle = '#44FF44';
  ctx.fillRect(x + 13, y + 0 + hover, 1, 1);
  ctx.fillRect(x + 16, y + 0 + hover, 1, 1);
  ctx.fillStyle = '#AAA898';
  ctx.fillRect(x + 13, y + 2 + hover, 4, 1);

  // Green energy particles
  ctx.fillStyle = 'rgba(68, 255, 68, 0.5)';
  ctx.fillRect(x + 17, y + 1 + hover, 1, 1);
  ctx.fillRect(x + 12, y + 1 + hover, 1, 1);
  ctx.fillStyle = 'rgba(68, 255, 68, 0.3)';
  ctx.fillRect(x + 16, y + 3 + hover, 1, 1);
  ctx.fillRect(x + 12, y + 4 + hover, 1, 1);
  ctx.fillStyle = 'rgba(120, 255, 120, 0.4)';
  ctx.fillRect(x + 17, y + 0 + hover, 1, 1);

  // Skeletal hand
  ctx.fillStyle = '#C8C8B8';
  ctx.fillRect(x + 13, y + 8 + hover, 1, 1);
  ctx.fillStyle = '#D8D8C8';
  ctx.fillRect(x + 13, y + 7 + hover, 1, 1);

  addOutline(ctx, x, y, s, s, '#080610');
}

// ─── Gorehound boss: Cerberus (40px) ────────────────────────────────
function drawGorehound(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const bob = frame === 1 ? -2 : 0;
  const cx = x + s / 2;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, y + s - 2, 18, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Four skeletal legs ---
  const legPositions = [
    { lx: x + 6, rx: x + 8 },
    { lx: x + 12, rx: x + 14 },
    { lx: x + 24, rx: x + 26 },
    { lx: x + 30, rx: x + 32 },
  ];
  for (let i = 0; i < legPositions.length; i++) {
    const lx = legPositions[i].lx;
    // Upper leg
    ctx.fillStyle = '#C44444';
    ctx.fillRect(lx, y + 27 + bob, 3, 4);
    // Knee
    ctx.fillStyle = '#993333';
    ctx.fillRect(lx, y + 29 + bob, 3, 1);
    // Lower leg
    ctx.fillStyle = '#C44444';
    ctx.fillRect(lx, y + 31 + bob, 3, 3);
    // Leg highlight
    ctx.fillStyle = '#DD5555';
    ctx.fillRect(lx, y + 27 + bob, 1, 2);
    // Paw
    ctx.fillRect(lx - 1, y + 34 + bob, 4, 2);
    // Claws
    ctx.fillStyle = '#E8E8D8';
    ctx.fillRect(lx - 1, y + 36 + bob, 1, 1);
    ctx.fillRect(lx + 2, y + 36 + bob, 1, 1);
    // Paw pad
    ctx.fillStyle = '#993333';
    ctx.fillRect(lx, y + 35 + bob, 2, 1);
  }

  // --- Skeletal ribcage body ---
  ctx.fillStyle = '#1A0A0A';
  ctx.fillRect(x + 5, y + 14 + bob, 30, 13);
  ctx.fillRect(x + 7, y + 13 + bob, 26, 15);

  // Body top highlight
  ctx.fillStyle = '#2A1414';
  ctx.fillRect(x + 7, y + 13 + bob, 26, 2);

  // Spine
  ctx.fillStyle = '#BB4444';
  ctx.fillRect(x + 17, y + 12 + bob, 3, 17);
  // Vertebrae
  ctx.fillStyle = '#993333';
  ctx.fillRect(x + 17, y + 14 + bob, 3, 1);
  ctx.fillRect(x + 17, y + 17 + bob, 3, 1);
  ctx.fillRect(x + 17, y + 20 + bob, 3, 1);
  ctx.fillRect(x + 17, y + 23 + bob, 3, 1);
  // Spine highlight
  ctx.fillStyle = '#DD5555';
  ctx.fillRect(x + 17, y + 12 + bob, 1, 2);

  // Red bone ribs
  ctx.fillStyle = '#C44444';
  ctx.fillRect(x + 7, y + 16 + bob, 10, 1);
  ctx.fillRect(x + 20, y + 16 + bob, 10, 1);
  ctx.fillRect(x + 8, y + 19 + bob, 9, 1);
  ctx.fillRect(x + 20, y + 19 + bob, 9, 1);
  ctx.fillRect(x + 7, y + 22 + bob, 10, 1);
  ctx.fillRect(x + 20, y + 22 + bob, 10, 1);
  ctx.fillRect(x + 8, y + 25 + bob, 9, 1);
  ctx.fillRect(x + 20, y + 25 + bob, 9, 1);
  // Rib highlights
  ctx.fillStyle = '#DD6666';
  ctx.fillRect(x + 9, y + 16 + bob, 3, 1);
  ctx.fillRect(x + 24, y + 16 + bob, 3, 1);
  // Extra rib detail
  ctx.fillStyle = '#AA3333';
  ctx.fillRect(x + 7, y + 17 + bob, 7, 1);
  ctx.fillRect(x + 23, y + 17 + bob, 7, 1);

  // Bony tail
  ctx.fillStyle = '#C44444';
  ctx.fillRect(x + 34, y + 14 + bob, 2, 2);
  ctx.fillRect(x + 35, y + 13 + bob, 2, 2);
  ctx.fillRect(x + 36, y + 12 + bob, 2, 2);
  ctx.fillRect(x + 37, y + 11 + bob, 2, 1);
  ctx.fillRect(x + 38, y + 10 + bob, 1, 1);
  // Tail highlight
  ctx.fillStyle = '#DD5555';
  ctx.fillRect(x + 37, y + 11 + bob, 1, 1);
  // Tail tip
  ctx.fillStyle = '#E8E8D8';
  ctx.fillRect(x + 39, y + 9 + bob, 1, 1);

  // --- Left skull head ---
  ctx.fillStyle = '#D8D8C8';
  ctx.fillRect(x + 1, y + 6 + bob, 10, 8);
  ctx.fillRect(x + 2, y + 5 + bob, 8, 1);
  ctx.fillStyle = '#C0C0B0';
  ctx.fillRect(x + 1, y + 6 + bob, 1, 8);
  ctx.fillRect(x + 10, y + 6 + bob, 1, 8);
  // Skull top highlight
  ctx.fillStyle = '#E8E8DC';
  ctx.fillRect(x + 3, y + 5 + bob, 6, 1);
  // Snout
  ctx.fillStyle = '#CCCCC0';
  ctx.fillRect(x + 1, y + 12 + bob, 9, 3);
  // Jaw
  ctx.fillStyle = '#C8C8B8';
  ctx.fillRect(x + 1, y + 14 + bob, 9, 2);
  // Eye sockets
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 2, y + 7 + bob, 3, 3);
  ctx.fillRect(x + 7, y + 7 + bob, 3, 3);
  // Fire eyes
  ctx.fillStyle = '#FF4422';
  ctx.fillRect(x + 2, y + 7 + bob, 3, 3);
  ctx.fillRect(x + 7, y + 7 + bob, 3, 3);
  ctx.fillStyle = '#FFAA44';
  ctx.fillRect(x + 3, y + 8 + bob, 1, 1);
  ctx.fillRect(x + 8, y + 8 + bob, 1, 1);
  ctx.fillStyle = '#FFCC66';
  ctx.fillRect(x + 3, y + 8 + bob, 1, 1);
  // Fire flicker
  ctx.fillStyle = 'rgba(255, 100, 20, 0.5)';
  ctx.fillRect(x + 3, y + 6 + bob, 1, 1);
  ctx.fillRect(x + 8, y + 6 + bob, 1, 1);
  // Nasal cavity
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 4, y + 12 + bob, 3, 1);
  // Teeth
  ctx.fillStyle = '#E8E8D8';
  ctx.fillRect(x + 2, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 4, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 6, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 8, y + 14 + bob, 1, 1);
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 3, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 5, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 7, y + 14 + bob, 1, 1);

  // --- Center skull head (bigger, higher) ---
  ctx.fillStyle = '#E0E0D0';
  ctx.fillRect(x + 12, y + 2 + bob, 14, 10);
  ctx.fillRect(x + 13, y + 1 + bob, 12, 1);
  ctx.fillRect(x + 15, y + 0 + bob, 8, 1);
  ctx.fillStyle = '#D0D0C0';
  ctx.fillRect(x + 12, y + 2 + bob, 1, 10);
  ctx.fillRect(x + 25, y + 2 + bob, 1, 10);
  // Skull top highlight
  ctx.fillStyle = '#ECECE0';
  ctx.fillRect(x + 16, y + 0 + bob, 6, 1);
  // Snout
  ctx.fillStyle = '#D8D8C8';
  ctx.fillRect(x + 12, y + 10 + bob, 14, 3);
  // Jaw
  ctx.fillStyle = '#CCCCC0';
  ctx.fillRect(x + 12, y + 12 + bob, 14, 2);
  // Eye sockets
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 14, y + 4 + bob, 4, 4);
  ctx.fillRect(x + 20, y + 4 + bob, 4, 4);
  // Fire eyes
  ctx.fillStyle = '#FF4422';
  ctx.fillRect(x + 14, y + 4 + bob, 4, 4);
  ctx.fillRect(x + 20, y + 4 + bob, 4, 4);
  ctx.fillStyle = '#FFCC44';
  ctx.fillRect(x + 15, y + 5 + bob, 2, 2);
  ctx.fillRect(x + 21, y + 5 + bob, 2, 2);
  ctx.fillStyle = '#FFEE88';
  ctx.fillRect(x + 16, y + 5 + bob, 1, 1);
  // Fire flicker
  ctx.fillStyle = 'rgba(255, 120, 20, 0.6)';
  ctx.fillRect(x + 15, y + 3 + bob, 2, 1);
  ctx.fillRect(x + 21, y + 3 + bob, 2, 1);
  // Nasal cavity
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 17, y + 9 + bob, 3, 2);
  // Teeth
  ctx.fillStyle = '#E8E8D8';
  ctx.fillRect(x + 13, y + 12 + bob, 2, 1);
  ctx.fillRect(x + 16, y + 12 + bob, 2, 1);
  ctx.fillRect(x + 19, y + 12 + bob, 2, 1);
  ctx.fillRect(x + 22, y + 12 + bob, 2, 1);
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 15, y + 12 + bob, 1, 1);
  ctx.fillRect(x + 18, y + 12 + bob, 1, 1);
  ctx.fillRect(x + 21, y + 12 + bob, 1, 1);
  // Lower fangs
  ctx.fillStyle = '#E8E8D8';
  ctx.fillRect(x + 14, y + 13 + bob, 1, 1);
  ctx.fillRect(x + 23, y + 13 + bob, 1, 1);

  // --- Right skull head ---
  ctx.fillStyle = '#D8D8C8';
  ctx.fillRect(x + 28, y + 6 + bob, 10, 8);
  ctx.fillRect(x + 29, y + 5 + bob, 8, 1);
  ctx.fillStyle = '#C0C0B0';
  ctx.fillRect(x + 28, y + 6 + bob, 1, 8);
  ctx.fillRect(x + 37, y + 6 + bob, 1, 8);
  ctx.fillStyle = '#E8E8DC';
  ctx.fillRect(x + 30, y + 5 + bob, 6, 1);
  // Snout
  ctx.fillStyle = '#CCCCC0';
  ctx.fillRect(x + 29, y + 12 + bob, 9, 3);
  // Jaw
  ctx.fillStyle = '#C8C8B8';
  ctx.fillRect(x + 29, y + 14 + bob, 9, 2);
  // Eye sockets
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 29, y + 7 + bob, 3, 3);
  ctx.fillRect(x + 34, y + 7 + bob, 3, 3);
  // Fire eyes
  ctx.fillStyle = '#FF4422';
  ctx.fillRect(x + 29, y + 7 + bob, 3, 3);
  ctx.fillRect(x + 34, y + 7 + bob, 3, 3);
  ctx.fillStyle = '#FFAA44';
  ctx.fillRect(x + 30, y + 8 + bob, 1, 1);
  ctx.fillRect(x + 35, y + 8 + bob, 1, 1);
  ctx.fillStyle = '#FFCC66';
  ctx.fillRect(x + 30, y + 8 + bob, 1, 1);
  ctx.fillStyle = 'rgba(255, 100, 20, 0.5)';
  ctx.fillRect(x + 30, y + 6 + bob, 1, 1);
  ctx.fillRect(x + 35, y + 6 + bob, 1, 1);
  // Nasal cavity
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 32, y + 12 + bob, 3, 1);
  // Teeth
  ctx.fillStyle = '#E8E8D8';
  ctx.fillRect(x + 29, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 31, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 33, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 35, y + 14 + bob, 1, 1);
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(x + 30, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 32, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 34, y + 14 + bob, 1, 1);

  // --- Neck connections ---
  ctx.fillStyle = '#993333';
  ctx.fillRect(x + 8, y + 14 + bob, 5, 2);
  ctx.fillRect(x + 17, y + 12 + bob, 3, 2);
  ctx.fillRect(x + 26, y + 14 + bob, 5, 2);
  ctx.fillStyle = '#AA4444';
  ctx.fillRect(x + 9, y + 14 + bob, 3, 1);
  ctx.fillRect(x + 27, y + 14 + bob, 3, 1);

  // Red fire glow auras
  ctx.fillStyle = 'rgba(255, 60, 20, 0.15)';
  ctx.beginPath();
  ctx.ellipse(x + 6, y + 10 + bob, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, y + 6 + bob, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 33, y + 10 + bob, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  addOutline(ctx, x, y, s, s, '#0A0606');
}

// ─── Hivemind boss: Death colossus (56px) ───────────────────────────
function drawHivemind(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const pulse = frame === 1 ? 2 : 0;
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Deep ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx, y + s - 3, 26, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Bone tendrils ---
  const tentacleAngles = [0.6, 1.2, 1.8, 3.6, 4.2, 4.8, 5.6, 0.1, 2.4, 3.0];
  for (let i = 0; i < tentacleAngles.length; i++) {
    const angle = tentacleAngles[i] + (frame * 0.12);
    const segments = 6;
    for (let seg = 0; seg < segments; seg++) {
      const dist = 20 + seg * 5 + pulse;
      const boneX = cx + Math.cos(angle + seg * 0.08) * dist;
      const boneY = cy + 4 + Math.sin(angle + seg * 0.08) * dist;
      ctx.fillStyle = seg % 2 === 0 ? '#D8D8C8' : '#BBBB99';
      ctx.fillRect(boneX - 1, boneY - 1, 3, 3);
      ctx.fillStyle = seg % 2 === 0 ? '#E8E8D8' : '#CCCC99';
      ctx.fillRect(boneX - 1, boneY - 1, 1, 1);
      ctx.fillStyle = '#1A1A12';
      ctx.fillRect(boneX, boneY, 1, 1);
      if (seg === segments - 1) {
        ctx.fillStyle = '#999988';
        ctx.fillRect(boneX - 1, boneY + 1, 1, 1);
        ctx.fillRect(boneX + 1, boneY + 1, 1, 1);
        ctx.fillRect(boneX, boneY + 2, 1, 1);
      }
    }
  }

  // --- Pulsing dark aura rings ---
  ctx.strokeStyle = `rgba(40, 10, 50, ${frame === 1 ? 0.35 : 0.15})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 26 + pulse, 24 + pulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(80, 20, 80, ${frame === 1 ? 0.2 : 0.08})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 30 + pulse, 28 + pulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  // --- Massive dark base body ---
  ctx.fillStyle = '#0E0A12';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 22 + pulse, 21 + pulse, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark purple inner mass
  ctx.fillStyle = '#1A0E28';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 18, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // Darker core
  ctx.fillStyle = '#120A1E';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 12, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirl detail
  ctx.fillStyle = '#1E1230';
  ctx.fillRect(cx - 8, cy + 1, 4, 1);
  ctx.fillRect(cx + 5, cy + 3, 4, 1);
  ctx.fillRect(cx - 5, cy + 7, 3, 1);
  ctx.fillRect(cx + 2, cy - 3, 3, 1);

  // --- Central dominant skull ---
  ctx.fillStyle = '#E0E0D0';
  ctx.fillRect(cx - 10, y + 5, 20, 16);
  ctx.fillRect(cx - 9, y + 4, 18, 1);
  ctx.fillRect(cx - 8, y + 3, 16, 1);
  ctx.fillRect(cx - 7, y + 2, 14, 1);

  // Skull top highlight
  ctx.fillStyle = '#ECECE0';
  ctx.fillRect(cx - 6, y + 2, 12, 1);
  ctx.fillRect(cx - 5, y + 3, 10, 1);

  // Skull bone shading
  ctx.fillStyle = '#D0D0C0';
  ctx.fillRect(cx - 10, y + 5, 1, 16);
  ctx.fillRect(cx + 9, y + 5, 1, 16);

  // Horns / bone crown
  ctx.fillStyle = '#C8C8B8';
  ctx.fillRect(cx - 13, y + 3, 4, 8);
  ctx.fillRect(cx + 9, y + 3, 4, 8);
  ctx.fillStyle = '#BBBB99';
  ctx.fillRect(cx - 14, y + 1, 3, 6);
  ctx.fillRect(cx + 11, y + 1, 3, 6);
  ctx.fillStyle = '#AAA898';
  ctx.fillRect(cx - 15, y + 0, 2, 4);
  ctx.fillRect(cx + 13, y + 0, 2, 4);
  ctx.fillRect(cx - 15, y + 0, 1, 1);
  ctx.fillRect(cx + 14, y + 0, 1, 1);
  // Horn highlights
  ctx.fillStyle = '#D8D8C8';
  ctx.fillRect(cx - 13, y + 3, 1, 3);
  ctx.fillRect(cx + 9, y + 3, 1, 3);
  // Horn ridges
  ctx.fillStyle = '#999988';
  ctx.fillRect(cx - 14, y + 2, 1, 1);
  ctx.fillRect(cx + 13, y + 2, 1, 1);

  // Brow ridge
  ctx.fillStyle = '#C0C0B0';
  ctx.fillRect(cx - 9, y + 8, 18, 1);
  ctx.fillStyle = '#D0D0C0';
  ctx.fillRect(cx - 7, y + 8, 14, 1);

  // Giant eye sockets
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(cx - 8, y + 9, 6, 5);
  ctx.fillRect(cx + 2, y + 9, 6, 5);

  // Crimson eyes
  ctx.fillStyle = '#CC2222';
  ctx.fillRect(cx - 7, y + 10, 4, 3);
  ctx.fillRect(cx + 3, y + 10, 4, 3);
  ctx.fillStyle = '#FF5544';
  ctx.fillRect(cx - 6, y + 10, 2, 2);
  ctx.fillRect(cx + 4, y + 10, 2, 2);
  ctx.fillStyle = '#FF8877';
  ctx.fillRect(cx - 5, y + 11, 1, 1);
  ctx.fillRect(cx + 5, y + 11, 1, 1);
  // Eye glow bleed
  ctx.fillStyle = 'rgba(220, 40, 40, 0.3)';
  ctx.fillRect(cx - 8, y + 9, 6, 5);
  ctx.fillRect(cx + 2, y + 9, 6, 5);

  // Nasal cavity
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(cx - 3, y + 15, 6, 3);
  ctx.fillRect(cx - 2, y + 14, 4, 1);

  // Gaping jaw
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(cx - 7, y + 19, 14, 5);
  // Upper teeth
  ctx.fillStyle = '#E0E0D0';
  ctx.fillRect(cx - 7, y + 19, 2, 2);
  ctx.fillRect(cx - 4, y + 19, 2, 2);
  ctx.fillRect(cx - 1, y + 19, 2, 2);
  ctx.fillRect(cx + 2, y + 19, 2, 2);
  ctx.fillRect(cx + 5, y + 19, 2, 2);
  // Lower teeth
  ctx.fillRect(cx - 6, y + 22, 2, 2);
  ctx.fillRect(cx - 3, y + 22, 2, 2);
  ctx.fillRect(cx + 0, y + 22, 2, 2);
  ctx.fillRect(cx + 3, y + 22, 2, 2);
  // Teeth gaps
  ctx.fillStyle = '#0A0808';
  ctx.fillRect(cx - 5, y + 19, 1, 2);
  ctx.fillRect(cx - 2, y + 19, 1, 2);
  ctx.fillRect(cx + 1, y + 19, 1, 2);
  ctx.fillRect(cx + 4, y + 19, 1, 2);
  // Teeth highlights
  ctx.fillStyle = '#ECECDC';
  ctx.fillRect(cx - 7, y + 19, 1, 1);
  ctx.fillRect(cx + 2, y + 19, 1, 1);

  // --- Smaller skull faces in the mass ---
  const skullPositions: [number, number, number][] = [
    [-17, 6, 1],
    [17, 6, 1],
    [-15, 16, 2],
    [15, 16, 2],
    [-8, 24, 1],
    [8, 24, 1],
    [0, 26, 2],
    [-20, 0, 1],
    [20, 0, 1],
    [-13, 26, 1],
    [13, 26, 1],
    [-18, 22, 1],
    [18, 22, 1],
    [0, 30, 1],
  ];

  for (const [sx, sy, size] of skullPositions) {
    const px = cx + sx;
    const py = cy + sy;

    if (size === 2) {
      ctx.fillStyle = '#C8C8B8';
      ctx.fillRect(px - 3, py - 3, 6, 5);
      ctx.fillStyle = '#D8D8C8';
      ctx.fillRect(px - 2, py - 3, 4, 1);
      ctx.fillStyle = '#0A0808';
      ctx.fillRect(px - 2, py - 1, 2, 2);
      ctx.fillRect(px + 1, py - 1, 2, 2);
      ctx.fillStyle = '#CC2222';
      ctx.fillRect(px - 2, py - 1, 1, 1);
      ctx.fillRect(px + 2, py - 1, 1, 1);
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(px - 1, py - 1, 1, 1);
      ctx.fillStyle = '#0A0808';
      ctx.fillRect(px - 1, py + 1, 3, 1);
    } else {
      ctx.fillStyle = '#BBBB99';
      ctx.fillRect(px - 2, py - 2, 4, 4);
      ctx.fillStyle = '#CCCCAA';
      ctx.fillRect(px - 1, py - 2, 2, 1);
      ctx.fillStyle = '#0A0808';
      ctx.fillRect(px - 1, py - 1, 1, 1);
      ctx.fillRect(px + 1, py - 1, 1, 1);
      ctx.fillStyle = '#CC2222';
      ctx.fillRect(px - 1, py - 1, 1, 1);
      ctx.fillRect(px + 1, py - 1, 1, 1);
      ctx.fillStyle = '#0A0808';
      ctx.fillRect(px, py + 1, 1, 1);
    }
  }

  // --- Eldritch auras ---
  ctx.strokeStyle = `rgba(68, 255, 68, ${frame === 1 ? 0.25 : 0.1})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 24 + pulse, 22 + pulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(204, 34, 34, ${frame === 1 ? 0.2 : 0.08})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 17 + pulse, 15 + pulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Floating dark energy particles
  ctx.fillStyle = `rgba(40, 10, 50, ${frame === 1 ? 0.6 : 0.3})`;
  ctx.fillRect(cx - 22, cy - 10, 2, 2);
  ctx.fillRect(cx + 20, cy - 8, 2, 2);
  ctx.fillRect(cx - 18, cy + 20, 2, 2);
  ctx.fillRect(cx + 16, cy + 22, 2, 2);
  ctx.fillRect(cx - 8, cy - 18, 2, 2);
  ctx.fillRect(cx + 6, cy - 16, 2, 2);
  ctx.fillRect(cx - 24, cy + 4, 2, 2);
  ctx.fillRect(cx + 22, cy + 6, 2, 2);
  // Extra energy sparks
  ctx.fillStyle = `rgba(100, 30, 100, ${frame === 1 ? 0.5 : 0.2})`;
  ctx.fillRect(cx - 12, cy - 16, 1, 1);
  ctx.fillRect(cx + 10, cy - 14, 1, 1);
  ctx.fillRect(cx - 20, cy + 12, 1, 1);
  ctx.fillRect(cx + 18, cy + 14, 1, 1);

  addOutline(ctx, x, y, s, s, '#060410');
}

// ─── Phantom: Ghostly enemy (16px) ──────────────────────────────────
function drawPhantom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const bob = frame === 1 ? 1 : 0;

  // Ghost body (translucent blue, larger)
  ctx.fillStyle = '#8899CC';
  ctx.fillRect(x + 3, y + 2 - bob, 10, 8);
  ctx.fillRect(x + 2, y + 3 - bob, 12, 6);
  // Brighter body core
  ctx.fillStyle = '#AABBEE';
  ctx.fillRect(x + 4, y + 3 - bob, 8, 6);
  // Wavy bottom (3 tails)
  ctx.fillStyle = '#8899CC';
  ctx.fillRect(x + 2, y + 10 - bob, 3, 3);
  ctx.fillRect(x + 6, y + 10 - bob, 3, 3);
  ctx.fillRect(x + 10, y + 10 - bob, 3, 3);
  // Head highlight
  ctx.fillStyle = '#BBCCEE';
  ctx.fillRect(x + 4, y + 2 - bob, 8, 1);
  // Body sheen
  ctx.fillStyle = '#CCDDFF';
  ctx.fillRect(x + 5, y + 3 - bob, 3, 3);
  // Secondary sheen
  ctx.fillStyle = '#BBCCEE';
  ctx.fillRect(x + 9, y + 4 - bob, 2, 2);
  // Eyes (larger)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 4, y + 5 - bob, 2, 2);
  ctx.fillRect(x + 9, y + 5 - bob, 2, 2);
  // Dark pupils
  ctx.fillStyle = '#222244';
  ctx.fillRect(x + 5, y + 6 - bob, 1, 1);
  ctx.fillRect(x + 10, y + 6 - bob, 1, 1);
  // Wispy trail detail
  ctx.fillStyle = 'rgba(170, 187, 238, 0.3)';
  ctx.fillRect(x + 3, y + 13 - bob, 1, 1);
  ctx.fillRect(x + 7, y + 13 - bob, 1, 1);
  ctx.fillRect(x + 11, y + 13 - bob, 1, 1);
  // Extra wisp
  ctx.fillStyle = 'rgba(170, 187, 238, 0.15)';
  ctx.fillRect(x + 2, y + 14 - bob, 1, 1);
  ctx.fillRect(x + 8, y + 14 - bob, 1, 1);
  ctx.fillRect(x + 12, y + 14 - bob, 1, 1);

  addOutline(ctx, x, y, s, s, 'rgba(20, 20, 60, 0.35)');
}

// ─── Bomber: Explosive enemy (14px) ──────────────────────────────────
function drawBomber(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const bob = frame === 1 ? 1 : 0;

  // Round bomb body (larger)
  ctx.fillStyle = '#CC2200';
  ctx.beginPath();
  ctx.arc(x + 7, y + 7 - bob, 6, 0, Math.PI * 2);
  ctx.fill();
  // Brighter body
  ctx.fillStyle = '#FF4400';
  ctx.beginPath();
  ctx.arc(x + 7, y + 7 - bob, 5, 0, Math.PI * 2);
  ctx.fill();
  // Dark inner
  ctx.fillStyle = '#CC2200';
  ctx.beginPath();
  ctx.arc(x + 7, y + 7 - bob, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Body highlight
  ctx.fillStyle = '#FF6622';
  ctx.fillRect(x + 4, y + 4 - bob, 3, 3);
  // Specular highlight
  ctx.fillStyle = '#FF8844';
  ctx.fillRect(x + 4, y + 4 - bob, 2, 2);
  // Extra spec
  ctx.fillStyle = '#FFAA66';
  ctx.fillRect(x + 4, y + 4 - bob, 1, 1);
  // Body shadow (bottom)
  ctx.fillStyle = '#991100';
  ctx.fillRect(x + 4, y + 10 - bob, 6, 2);
  // Fuse
  ctx.fillStyle = '#FFAA00';
  ctx.fillRect(x + 6, y + 0 - bob, 2, 2);
  ctx.fillStyle = '#CC8800';
  ctx.fillRect(x + 7, y + 0 - bob, 1, 1);
  // Fuse rope
  ctx.fillStyle = '#886600';
  ctx.fillRect(x + 6, y + 1 - bob, 1, 1);
  // Spark
  ctx.fillStyle = frame === 0 ? '#FFFFFF' : '#FFDD44';
  ctx.fillRect(x + 5, y - 1 - bob, 3, 1);
  ctx.fillRect(x + 6, y - 2 - bob, 1, 1);
  // Spark glow
  ctx.fillStyle = frame === 0 ? '#FFFFCC' : '#FFEE88';
  ctx.fillRect(x + 4, y - 1 - bob, 1, 1);
  ctx.fillRect(x + 8, y - 1 - bob, 1, 1);
  // Eyes (angry, larger)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 4, y + 5 - bob, 2, 2);
  ctx.fillRect(x + 8, y + 5 - bob, 2, 2);
  // Pupils
  ctx.fillStyle = '#111111';
  ctx.fillRect(x + 5, y + 6 - bob, 1, 1);
  ctx.fillRect(x + 9, y + 6 - bob, 1, 1);
  // Angry eyebrows
  ctx.fillStyle = '#991100';
  ctx.fillRect(x + 4, y + 4 - bob, 2, 1);
  ctx.fillRect(x + 9, y + 4 - bob, 2, 1);
  // Angry mouth
  ctx.fillStyle = '#991100';
  ctx.fillRect(x + 5, y + 8 - bob, 4, 1);

  addOutline(ctx, x, y, s, s, '#330000');
}

// ─── Tank: Heavy shielded enemy (22px) ──────────────────────────────
function drawTank(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const bob = frame === 1 ? 1 : 0;

  // Large body
  ctx.fillStyle = '#777788';
  ctx.fillRect(x + 4, y + 5 - bob, 15, 12);
  ctx.fillRect(x + 6, y + 3 - bob, 11, 2);
  // Body highlight
  ctx.fillStyle = '#888899';
  ctx.fillRect(x + 6, y + 3 - bob, 11, 1);
  ctx.fillRect(x + 5, y + 5 - bob, 13, 1);
  // Body shadow
  ctx.fillStyle = '#666677';
  ctx.fillRect(x + 4, y + 15 - bob, 15, 2);
  // Armor plate lines
  ctx.fillStyle = '#999AAA';
  ctx.fillRect(x + 8, y + 9 - bob, 8, 1);
  ctx.fillRect(x + 8, y + 12 - bob, 8, 1);
  // Center plate
  ctx.fillStyle = '#8888AA';
  ctx.fillRect(x + 9, y + 7 - bob, 6, 2);

  // Shield (front, taller)
  ctx.fillStyle = '#AAAACC';
  ctx.fillRect(x + 2, y + 3 - bob, 4, 16);
  ctx.fillStyle = '#9999BB';
  ctx.fillRect(x + 2, y + 6 - bob, 4, 2);
  ctx.fillRect(x + 2, y + 10 - bob, 4, 2);
  ctx.fillRect(x + 2, y + 14 - bob, 4, 2);
  // Shield highlight
  ctx.fillStyle = '#BBBBDD';
  ctx.fillRect(x + 2, y + 3 - bob, 1, 4);
  // Shield boss (center bump)
  ctx.fillStyle = '#CCCCEE';
  ctx.fillRect(x + 3, y + 9 - bob, 2, 2);
  // Shield rivets
  ctx.fillStyle = '#DDDDFF';
  ctx.fillRect(x + 3, y + 5 - bob, 1, 1);
  ctx.fillRect(x + 3, y + 9 - bob, 1, 1);
  ctx.fillRect(x + 3, y + 13 - bob, 1, 1);
  ctx.fillRect(x + 3, y + 17 - bob, 1, 1);
  // Shield edge shadow
  ctx.fillStyle = '#8888AA';
  ctx.fillRect(x + 5, y + 3 - bob, 1, 16);

  // Eyes (larger)
  ctx.fillStyle = '#FF4444';
  ctx.fillRect(x + 10, y + 5 - bob, 3, 3);
  ctx.fillRect(x + 15, y + 5 - bob, 3, 3);
  // Eye highlights
  ctx.fillStyle = '#FF7766';
  ctx.fillRect(x + 10, y + 5 - bob, 1, 1);
  ctx.fillRect(x + 15, y + 5 - bob, 1, 1);
  // Eye dark outline
  ctx.fillStyle = '#662222';
  ctx.fillRect(x + 10, y + 8 - bob, 3, 1);
  ctx.fillRect(x + 15, y + 8 - bob, 3, 1);

  // Feet (larger)
  ctx.fillStyle = '#555566';
  ctx.fillRect(x + 6, y + 17 - bob, 4, 3 + bob);
  ctx.fillRect(x + 13, y + 17 - bob, 4, 3 + bob);
  // Feet highlight
  ctx.fillStyle = '#666677';
  ctx.fillRect(x + 6, y + 17 - bob, 2, 1);
  ctx.fillRect(x + 13, y + 17 - bob, 2, 1);
  // Foot sole
  ctx.fillStyle = '#444455';
  ctx.fillRect(x + 6, y + 19 - bob, 4, 1);
  ctx.fillRect(x + 13, y + 19 - bob, 4, 1);

  // Armor rivets on body
  ctx.fillStyle = '#CCCCDD';
  ctx.fillRect(x + 7, y + 7 - bob, 1, 1);
  ctx.fillRect(x + 7, y + 11 - bob, 1, 1);
  ctx.fillRect(x + 7, y + 15 - bob, 1, 1);

  // Shoulder pad
  ctx.fillStyle = '#888899';
  ctx.fillRect(x + 17, y + 4 - bob, 3, 4);
  ctx.fillStyle = '#999AAA';
  ctx.fillRect(x + 17, y + 4 - bob, 3, 1);
  // Shoulder spike
  ctx.fillStyle = '#AAAACC';
  ctx.fillRect(x + 18, y + 3 - bob, 1, 1);

  addOutline(ctx, x, y, s, s, '#333344');
}

// ─── Leaper: Agile jumping enemy (16px) ─────────────────────────────
function drawLeaper(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number): void {
  const bob = frame === 1 ? -2 : 0;

  // Body (larger)
  ctx.fillStyle = '#559933';
  ctx.fillRect(x + 3, y + 4 - bob, 10, 6);
  ctx.fillRect(x + 5, y + 3 - bob, 6, 1);
  // Body highlight
  ctx.fillStyle = '#66BB44';
  ctx.fillRect(x + 4, y + 4 - bob, 8, 4);
  // Body bright spot
  ctx.fillStyle = '#77CC55';
  ctx.fillRect(x + 5, y + 4 - bob, 4, 3);
  // Specular
  ctx.fillStyle = '#88DD66';
  ctx.fillRect(x + 5, y + 4 - bob, 2, 1);
  // Body shadow
  ctx.fillStyle = '#448822';
  ctx.fillRect(x + 3, y + 9 - bob, 10, 1);
  // Belly (lighter)
  ctx.fillStyle = '#88CC66';
  ctx.fillRect(x + 5, y + 7 - bob, 5, 2);

  // Head
  ctx.fillStyle = '#77CC55';
  ctx.fillRect(x + 4, y + 1 - bob, 8, 3);
  ctx.fillRect(x + 5, y + 0 - bob, 6, 1);
  // Head highlight
  ctx.fillStyle = '#88DD66';
  ctx.fillRect(x + 6, y + 0 - bob, 4, 1);
  ctx.fillRect(x + 5, y + 1 - bob, 6, 1);

  // Eyes - large, bulgy frog-like
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 4, y + 2 - bob, 3, 2);
  ctx.fillRect(x + 9, y + 2 - bob, 3, 2);
  // Pupils
  ctx.fillStyle = '#111111';
  ctx.fillRect(x + 5, y + 3 - bob, 2, 1);
  ctx.fillRect(x + 10, y + 3 - bob, 2, 1);
  // Eye highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 4, y + 2 - bob, 1, 1);
  ctx.fillRect(x + 9, y + 2 - bob, 1, 1);

  // Mouth
  ctx.fillStyle = '#335511';
  ctx.fillRect(x + 6, y + 4 - bob, 4, 1);

  // Legs (longer, more detailed)
  ctx.fillStyle = '#558833';
  if (frame === 0) {
    // Standing
    ctx.fillRect(x + 3, y + 10 - bob, 3, 4);
    ctx.fillRect(x + 10, y + 10 - bob, 3, 4);
    // Knee joint
    ctx.fillStyle = '#669944';
    ctx.fillRect(x + 3, y + 11 - bob, 1, 1);
    ctx.fillRect(x + 10, y + 11 - bob, 1, 1);
    // Feet
    ctx.fillStyle = '#558833';
    ctx.fillRect(x + 2, y + 14 - bob, 4, 1);
    ctx.fillRect(x + 10, y + 14 - bob, 4, 1);
    // Claws
    ctx.fillStyle = '#CCCCAA';
    ctx.fillRect(x + 2, y + 15 - bob, 1, 1);
    ctx.fillRect(x + 5, y + 15 - bob, 1, 1);
    ctx.fillRect(x + 10, y + 15 - bob, 1, 1);
    ctx.fillRect(x + 13, y + 15 - bob, 1, 1);
  } else {
    // Jumping pose - extended
    ctx.fillStyle = '#558833';
    ctx.fillRect(x + 2, y + 10 - bob, 3, 3);
    ctx.fillRect(x + 11, y + 10 - bob, 3, 3);
    ctx.fillRect(x + 1, y + 13 - bob, 2, 2);
    ctx.fillRect(x + 13, y + 13 - bob, 2, 2);
    // Knee
    ctx.fillStyle = '#669944';
    ctx.fillRect(x + 2, y + 10 - bob, 1, 1);
    ctx.fillRect(x + 13, y + 10 - bob, 1, 1);
    // Feet
    ctx.fillRect(x + 0, y + 14 - bob, 3, 1);
    ctx.fillRect(x + 13, y + 14 - bob, 3, 1);
    // Claws
    ctx.fillStyle = '#CCCCAA';
    ctx.fillRect(x + 0, y + 14 - bob, 1, 1);
    ctx.fillRect(x + 15, y + 14 - bob, 1, 1);
  }

  addOutline(ctx, x, y, s, s, '#223311');
}
