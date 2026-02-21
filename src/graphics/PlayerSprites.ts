import { JobId } from '../constants';

interface PlayerPalette {
  armor: string;
  armorLight: string;
  armorDark: string;
  legs: string;
  hair: string;
  skin: string;
  eyeColor?: string;
  headType?: 'normal' | 'pointy_hat' | 'helmet' | 'horned_helmet' | 'hood' | 'bald' | 'mask' | 'wild' | 'topknot' | 'feather_hat' | 'goggles' | 'bandana';
  bodyType?: 'standard' | 'armor' | 'robe' | 'light';
  detail?: string;
}

const DEFAULT_PALETTE: PlayerPalette = {
  armor: '#4466AA',
  armorLight: '#5577BB',
  armorDark: '#335599',
  legs: '#334488',
  hair: '#223366',
  skin: '#DDBB88',
};

const JOB_PALETTES: Record<JobId, PlayerPalette> = {
  [JobId.PALADIN]: {
    armor: '#DAA520', armorLight: '#FFD700', armorDark: '#B8860B',
    legs: '#8B6914', hair: '#F5DEB3', skin: '#DDBB88',
    headType: 'helmet', bodyType: 'armor', detail: '#FFFFFF',
  },
  [JobId.DARK_KNIGHT]: {
    armor: '#2F1F1F', armorLight: '#4A2020', armorDark: '#1A0A0A',
    legs: '#1A0A0A', hair: '#333333', skin: '#BBAA88',
    headType: 'horned_helmet', bodyType: 'armor', eyeColor: '#FF0000', detail: '#660000',
  },
  [JobId.DRAGOON]: {
    armor: '#2244AA', armorLight: '#3366CC', armorDark: '#1A3388',
    legs: '#1A2266', hair: '#4477DD', skin: '#DDBB88',
    headType: 'helmet', bodyType: 'armor', detail: '#3366CC',
  },
  [JobId.NINJA]: {
    armor: '#4B0082', armorLight: '#6A1B9A', armorDark: '#36006E',
    legs: '#2D004F', hair: '#1A1A2E', skin: '#DDBB88',
    headType: 'mask', bodyType: 'light',
  },
  [JobId.MONK]: {
    armor: '#CC6600', armorLight: '#FF8C00', armorDark: '#994C00',
    legs: '#774400', hair: '#DDBB88', skin: '#DDBB88',
    headType: 'bald', bodyType: 'light',
  },
  [JobId.BERSERKER]: {
    armor: '#8B0000', armorLight: '#CC2222', armorDark: '#660000',
    legs: '#553322', hair: '#CC4444', skin: '#CCAA77',
    headType: 'wild', bodyType: 'light',
  },
  [JobId.RANGER]: {
    armor: '#2E6B2E', armorLight: '#3D8B3D', armorDark: '#1E4F1E',
    legs: '#3A2A1A', hair: '#556B2F', skin: '#DDBB88',
    headType: 'hood', bodyType: 'standard',
  },
  [JobId.BARD]: {
    armor: '#8B7355', armorLight: '#DAA520', armorDark: '#6B5335',
    legs: '#554433', hair: '#FFD700', skin: '#EECCAA',
    headType: 'feather_hat', bodyType: 'standard', detail: '#FF4444',
  },
  [JobId.BLACK_MAGE]: {
    armor: '#191970', armorLight: '#2828A0', armorDark: '#0F0F50',
    legs: '#111155', hair: '#191970', skin: '#443355',
    headType: 'pointy_hat', bodyType: 'robe', eyeColor: '#FFFF00',
  },
  [JobId.WHITE_MAGE]: {
    armor: '#DDDDEE', armorLight: '#FFFFFF', armorDark: '#BBBBCC',
    legs: '#AAAABB', hair: '#DDDDEE', skin: '#FFDDCC',
    headType: 'hood', bodyType: 'robe',
  },
  [JobId.SUMMONER]: {
    armor: '#993366', armorLight: '#CC4488', armorDark: '#662244',
    legs: '#551133', hair: '#993366', skin: '#DDBB88',
    headType: 'pointy_hat', bodyType: 'robe', detail: '#FF69B4',
  },
  [JobId.TIME_MAGE]: {
    armor: '#5533AA', armorLight: '#7755CC', armorDark: '#3D2288',
    legs: '#2D1A66', hair: '#5533AA', skin: '#DDBB88',
    headType: 'pointy_hat', bodyType: 'robe',
  },
  [JobId.ALCHEMIST]: {
    armor: '#2D8B2D', armorLight: '#44CC44', armorDark: '#1E6B1E',
    legs: '#3A2A1A', hair: '#88DD88', skin: '#DDCC88',
    headType: 'goggles', bodyType: 'standard', detail: '#FFAA00',
  },
  [JobId.GEOMANCER]: {
    armor: '#6B4423', armorLight: '#8B5A2B', armorDark: '#4A2F14',
    legs: '#3A2010', hair: '#A0522D', skin: '#DDBB88',
    headType: 'bandana', bodyType: 'standard', detail: '#CC4444',
  },
  [JobId.SAMURAI]: {
    armor: '#8B1A1A', armorLight: '#B22222', armorDark: '#660F0F',
    legs: '#440A0A', hair: '#1A1A1A', skin: '#EEDDAA',
    headType: 'topknot', bodyType: 'armor',
  },
};

export function generatePlayerTextures(scene: Phaser.Scene): void {
  // Default texture
  generatePlayerSheet(scene, 'player', DEFAULT_PALETTE);

  // One texture per job
  for (const jobId of Object.values(JobId)) {
    const palette = JOB_PALETTES[jobId];
    if (palette) {
      generatePlayerSheet(scene, 'player_' + jobId, palette);
    }
  }
}

function generatePlayerSheet(scene: Phaser.Scene, key: string, palette: PlayerPalette): void {
  const W = 16;
  const H = 20;
  const frames = 4;
  const directions = 4;
  const canvas = scene.textures.createCanvas(key, W * frames, H * directions)!;
  const ctx = canvas.context;

  for (let dir = 0; dir < directions; dir++) {
    for (let frame = 0; frame < frames; frame++) {
      drawPlayerFrame(ctx, frame * W, dir * H, W, H, dir, frame, palette);
    }
  }

  canvas.refresh();

  const texture = scene.textures.get(key);
  let i = 0;
  for (let row = 0; row < directions; row++) {
    for (let col = 0; col < frames; col++) {
      texture.add(i, 0, col * W, row * H, W, H);
      i++;
    }
  }
}

function drawPlayerFrame(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, _W: number, _H: number,
  dir: number, frame: number,
  palette: PlayerPalette,
): void {
  const bob = (frame === 1 || frame === 3) ? -1 : 0;
  const headType = palette.headType ?? 'normal';
  const bodyType = palette.bodyType ?? 'standard';
  const eyeColor = palette.eyeColor;
  const detail = palette.detail ?? palette.armorLight;

  // 1. Shadow at y+19
  drawShadow(ctx, x, y);

  // 2. Legs (y+13 to y+18)
  if (bodyType !== 'robe') {
    drawLegs(ctx, x, y, bob, frame, palette);
  } else {
    drawRobeLegs(ctx, x, y, bob, frame, palette);
  }

  // 3. Body (y+7 to y+12)
  drawBody(ctx, x, y, bob, dir, palette, bodyType);

  // 4. Arms
  drawArms(ctx, x, y, bob, dir, palette, bodyType);

  // 5. Head/face (y+1 to y+6)
  drawHead(ctx, x, y, bob, dir, palette, headType);

  // 6. Hair/hat
  drawHeadgear(ctx, x, y, bob, dir, palette, headType, detail);

  // 7. Eyes
  drawEyes(ctx, x, y, bob, dir, palette, headType, eyeColor);
}

// --------------------------------------------------
// Shadow - at y+19
// --------------------------------------------------
function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x + 4, y + 18, 8, 2);
}

// --------------------------------------------------
// Legs - y+13 to y+18 (6px tall, much longer)
// --------------------------------------------------
function drawLegs(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, frame: number,
  palette: PlayerPalette,
): void {
  const legOffset = frame === 1 ? 1 : frame === 3 ? -1 : 0;

  // Upper leg (thigh) - darker
  ctx.fillStyle = palette.legs;
  ctx.fillRect(x + 5, y + 13 + bob, 2, 2);
  ctx.fillRect(x + 9, y + 13 + bob, 2, 2);

  // Lower leg (shin) - slightly lighter
  const shinColor = blendColor(palette.legs, '#FFFFFF', 0.08);
  ctx.fillStyle = shinColor;
  ctx.fillRect(x + 5, y + 15 + bob, 2, 2);
  ctx.fillRect(x + 9, y + 15 + bob, 2, 2);

  // Feet / boots
  ctx.fillStyle = palette.legs;
  ctx.fillRect(x + 4, y + 17 + bob, 3, 1);
  ctx.fillRect(x + 9, y + 17 + bob, 3, 1);

  // Walk animation offset
  if (legOffset !== 0) {
    ctx.fillStyle = palette.legs;
    ctx.fillRect(x + 5, y + 13 + bob + legOffset, 2, 2);
    ctx.fillRect(x + 9, y + 13 + bob - legOffset, 2, 2);
    ctx.fillStyle = shinColor;
    ctx.fillRect(x + 5, y + 15 + bob + legOffset, 2, 2);
    ctx.fillRect(x + 9, y + 15 + bob - legOffset, 2, 2);
    ctx.fillStyle = palette.legs;
    ctx.fillRect(x + 4, y + 17 + bob + legOffset, 3, 1);
    ctx.fillRect(x + 9, y + 17 + bob - legOffset, 3, 1);
  }

  // Knee highlight
  ctx.fillStyle = blendColor(palette.legs, '#FFFFFF', 0.15);
  ctx.fillRect(x + 5, y + 14 + bob, 1, 1);
  ctx.fillRect(x + 9, y + 14 + bob, 1, 1);
}

function drawRobeLegs(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, frame: number,
  palette: PlayerPalette,
): void {
  // Tiny feet peeking below robe at y+17..y+18
  const legOffset = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  ctx.fillStyle = palette.legs;
  ctx.fillRect(x + 5, y + 17 + bob, 2, 1);
  ctx.fillRect(x + 9, y + 17 + bob, 2, 1);
  if (legOffset !== 0) {
    ctx.fillRect(x + 5 + legOffset, y + 17 + bob, 2, 1);
    ctx.fillRect(x + 9 - legOffset, y + 17 + bob, 2, 1);
  }
}

// --------------------------------------------------
// Body - y+7 to y+12 (6px tall torso)
// --------------------------------------------------
function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  bodyType: string,
): void {
  switch (bodyType) {
    case 'armor':
      drawArmorBody(ctx, x, y, bob, dir, palette);
      break;
    case 'robe':
      drawRobeBody(ctx, x, y, bob, dir, palette);
      break;
    case 'light':
      drawLightBody(ctx, x, y, bob, dir, palette);
      break;
    default:
      drawStandardBody(ctx, x, y, bob, dir, palette);
      break;
  }
}

function drawStandardBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, _dir: number,
  palette: PlayerPalette,
): void {
  // Main torso: 8px wide
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 4, y + 7 + bob, 8, 6);
  // Highlight top
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + 5, y + 8 + bob, 6, 2);
  // Subtle chest shading
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 5, y + 10 + bob, 6, 1);
  // Dark belt/lower region
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + 4, y + 11 + bob, 8, 2);
  // Belt buckle hint
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + 7, y + 11 + bob, 2, 1);
}

function drawArmorBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, _dir: number,
  palette: PlayerPalette,
): void {
  // Shoulder pads: 10px wide at y+7
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + 3, y + 7 + bob, 10, 2);
  // Shoulder highlight
  ctx.fillStyle = blendColor(palette.armorLight, '#FFFFFF', 0.15);
  ctx.fillRect(x + 3, y + 7 + bob, 10, 1);
  // Main torso plate
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 4, y + 8 + bob, 8, 5);
  // Chest plate highlight
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + 5, y + 9 + bob, 6, 2);
  // Chest center line
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + 7, y + 8 + bob, 2, 3);
  // Dark belt region
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + 4, y + 11 + bob, 8, 2);
  // Belt buckle
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + 7, y + 11 + bob, 2, 1);
  // Armor edge highlight
  ctx.fillStyle = blendColor(palette.armor, '#FFFFFF', 0.1);
  ctx.fillRect(x + 4, y + 8 + bob, 1, 5);
}

function drawRobeBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, _dir: number,
  palette: PlayerPalette,
): void {
  // Robe: from y+7 down to y+17 (long robe covering legs)
  // Upper robe (waist)
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 4, y + 7 + bob, 8, 5);
  // Highlight on upper robe
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + 5, y + 8 + bob, 6, 2);
  // Belt/sash
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + 4, y + 10 + bob, 8, 1);
  // Lower robe widens
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 4, y + 11 + bob, 9, 3);
  // Bottom hem: wider
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + 3, y + 14 + bob, 10, 3);
  // Robe fold detail
  ctx.fillStyle = blendColor(palette.armorDark, '#000000', 0.15);
  ctx.fillRect(x + 5, y + 14 + bob, 1, 3);
  ctx.fillRect(x + 9, y + 14 + bob, 1, 3);
  // Robe hem highlight
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 4, y + 16 + bob, 8, 1);
}

function drawLightBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, _dir: number,
  palette: PlayerPalette,
): void {
  // Slimmer body: 7px wide
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 5, y + 7 + bob, 7, 6);
  // Highlight
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + 6, y + 8 + bob, 5, 2);
  // Mid tone
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 5, y + 10 + bob, 7, 1);
  // Dark bottom
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + 5, y + 11 + bob, 7, 2);

  // Monk: gi neckline
  if (palette.headType === 'bald') {
    ctx.fillStyle = palette.skin;
    ctx.fillRect(x + 7, y + 7 + bob, 3, 1);
  }

  // Berserker: bare upper chest
  if (palette.headType === 'wild') {
    ctx.fillStyle = palette.skin;
    ctx.fillRect(x + 6, y + 7 + bob, 5, 2);
    // Muscle definition
    ctx.fillStyle = blendColor(palette.skin, '#000000', 0.1);
    ctx.fillRect(x + 8, y + 7 + bob, 1, 2);
    // Just a belt/lower garment
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + 5, y + 9 + bob, 7, 4);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 5, y + 11 + bob, 7, 2);
  }
}

// --------------------------------------------------
// Arms - extend from torso (y+8 to y+12)
// --------------------------------------------------
function drawArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  bodyType: string,
): void {
  const isLight = bodyType === 'light';
  const armColor = isLight ? palette.skin : palette.armor;

  if (bodyType === 'armor') {
    drawArmoredArms(ctx, x, y, bob, dir, palette);
  } else if (bodyType === 'robe') {
    drawRobeArms(ctx, x, y, bob, dir, palette);
  } else {
    // Standard or light arms
    ctx.fillStyle = armColor;
    if (dir === 1) {
      ctx.fillRect(x + 3, y + 8 + bob, 2, 5);
    } else if (dir === 2) {
      ctx.fillRect(x + 11, y + 8 + bob, 2, 5);
    } else {
      ctx.fillRect(x + 3, y + 8 + bob, 2, 5);
      ctx.fillRect(x + 11, y + 8 + bob, 2, 5);
    }

    // Hand detail
    if (isLight) {
      ctx.fillStyle = palette.skin;
      if (dir === 1) {
        ctx.fillRect(x + 3, y + 12 + bob, 2, 1);
      } else if (dir === 2) {
        ctx.fillRect(x + 11, y + 12 + bob, 2, 1);
      } else {
        ctx.fillRect(x + 3, y + 12 + bob, 2, 1);
        ctx.fillRect(x + 11, y + 12 + bob, 2, 1);
      }
    }

    // Arm highlight
    const armHL = blendColor(armColor, '#FFFFFF', 0.12);
    ctx.fillStyle = armHL;
    if (dir === 1) {
      ctx.fillRect(x + 3, y + 8 + bob, 1, 1);
    } else if (dir === 2) {
      ctx.fillRect(x + 12, y + 8 + bob, 1, 1);
    } else {
      ctx.fillRect(x + 3, y + 8 + bob, 1, 1);
      ctx.fillRect(x + 12, y + 8 + bob, 1, 1);
    }
  }
}

function drawArmoredArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  if (dir === 1) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + 2, y + 8 + bob, 2, 5);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 2, y + 12 + bob, 2, 1);
    // Gauntlet highlight
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + 2, y + 8 + bob, 1, 1);
  } else if (dir === 2) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + 12, y + 8 + bob, 2, 5);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 12, y + 12 + bob, 2, 1);
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + 13, y + 8 + bob, 1, 1);
  } else {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + 2, y + 8 + bob, 2, 5);
    ctx.fillRect(x + 12, y + 8 + bob, 2, 5);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 2, y + 12 + bob, 2, 1);
    ctx.fillRect(x + 12, y + 12 + bob, 2, 1);
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + 2, y + 8 + bob, 1, 1);
    ctx.fillRect(x + 13, y + 8 + bob, 1, 1);
  }
}

function drawRobeArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  if (dir === 1) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + 2, y + 8 + bob, 3, 5);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 2, y + 12 + bob, 3, 1);
    // Sleeve highlight
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + 2, y + 8 + bob, 1, 2);
  } else if (dir === 2) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + 11, y + 8 + bob, 3, 5);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 11, y + 12 + bob, 3, 1);
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + 13, y + 8 + bob, 1, 2);
  } else {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + 2, y + 8 + bob, 3, 5);
    ctx.fillRect(x + 11, y + 8 + bob, 3, 5);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 2, y + 12 + bob, 3, 1);
    ctx.fillRect(x + 11, y + 12 + bob, 3, 1);
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + 2, y + 8 + bob, 1, 2);
    ctx.fillRect(x + 13, y + 8 + bob, 1, 2);
  }
}

// --------------------------------------------------
// Head (base skin) - y+1 to y+6
// --------------------------------------------------
function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, _dir: number,
  palette: PlayerPalette,
  headType: string,
): void {
  if (headType === 'helmet' || headType === 'horned_helmet') {
    return;
  }

  // Draw base skin-colored head (y+2 to y+6, 6px tall, 6px wide)
  ctx.fillStyle = palette.skin;
  ctx.fillRect(x + 5, y + 2 + bob, 6, 5);

  // Subtle shading on sides of face
  const skinShadow = blendColor(palette.skin, '#000000', 0.08);
  ctx.fillStyle = skinShadow;
  ctx.fillRect(x + 5, y + 4 + bob, 1, 3);
  ctx.fillRect(x + 10, y + 4 + bob, 1, 3);
}

// --------------------------------------------------
// Headgear
// --------------------------------------------------
function drawHeadgear(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  headType: string,
  detail: string,
): void {
  switch (headType) {
    case 'normal':
      drawNormalHair(ctx, x, y, bob, dir, palette);
      break;
    case 'pointy_hat':
      drawPointyHat(ctx, x, y, bob, dir, palette);
      break;
    case 'helmet':
      drawHelmet(ctx, x, y, bob, dir, palette);
      break;
    case 'horned_helmet':
      drawHornedHelmet(ctx, x, y, bob, dir, palette, detail);
      break;
    case 'hood':
      drawHood(ctx, x, y, bob, dir, palette);
      break;
    case 'bald':
      // No hair
      break;
    case 'mask':
      drawMask(ctx, x, y, bob, dir, palette);
      break;
    case 'wild':
      drawWildHair(ctx, x, y, bob, dir, palette);
      break;
    case 'topknot':
      drawTopknot(ctx, x, y, bob, dir, palette);
      break;
    case 'feather_hat':
      drawFeatherHat(ctx, x, y, bob, dir, palette, detail);
      break;
    case 'goggles':
      drawGoggles(ctx, x, y, bob, dir, palette, detail);
      break;
    case 'bandana':
      drawBandana(ctx, x, y, bob, dir, palette, detail);
      break;
  }
}

function drawNormalHair(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;
  if (dir === 0) {
    ctx.fillRect(x + 4, y + 1 + bob, 8, 3);
    // Hair highlight
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.15);
    ctx.fillRect(x + 5, y + 1 + bob, 4, 1);
  } else if (dir === 3) {
    ctx.fillRect(x + 4, y + 1 + bob, 8, 5);
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.1);
    ctx.fillRect(x + 5, y + 1 + bob, 4, 1);
  } else if (dir === 1) {
    ctx.fillRect(x + 5, y + 1 + bob, 7, 3);
    ctx.fillRect(x + 9, y + 3 + bob, 3, 2);
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.15);
    ctx.fillRect(x + 6, y + 1 + bob, 3, 1);
  } else {
    ctx.fillRect(x + 4, y + 1 + bob, 7, 3);
    ctx.fillRect(x + 4, y + 3 + bob, 3, 2);
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.15);
    ctx.fillRect(x + 5, y + 1 + bob, 3, 1);
  }
}

function drawPointyHat(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;

  // Brim at y+3
  ctx.fillRect(x + 4, y + 3 + bob, 8, 1);
  // Mid hat at y+2
  ctx.fillRect(x + 5, y + 2 + bob, 6, 1);
  // Upper at y+1
  ctx.fillRect(x + 6, y + 1 + bob, 4, 1);
  // Tip at y+0
  ctx.fillRect(x + 7, y + 0 + bob, 2, 1);

  if (dir === 3) {
    ctx.fillRect(x + 4, y + 3 + bob, 8, 4);
  }

  if (dir === 1) {
    ctx.fillRect(x + 5, y + 3 + bob, 7, 1);
    ctx.fillRect(x + 6, y + 2 + bob, 5, 1);
    ctx.fillRect(x + 7, y + 1 + bob, 4, 1);
    ctx.fillRect(x + 8, y + 0 + bob, 2, 1);
  } else if (dir === 2) {
    ctx.fillRect(x + 4, y + 3 + bob, 7, 1);
    ctx.fillRect(x + 5, y + 2 + bob, 5, 1);
    ctx.fillRect(x + 5, y + 1 + bob, 4, 1);
    ctx.fillRect(x + 6, y + 0 + bob, 2, 1);
  }

  // Hat band
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + 4, y + 3 + bob, 8, 1);

  // Hat highlight
  ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.12);
  ctx.fillRect(x + 6, y + 1 + bob, 2, 1);
}

function drawHelmet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  // Full helmet covering entire head y+1 to y+6
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + 4, y + 1 + bob, 8, 6);

  // Highlight on top
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + 5, y + 1 + bob, 6, 2);

  // Extra highlight for HD-2D feel
  ctx.fillStyle = blendColor(palette.armorLight, '#FFFFFF', 0.15);
  ctx.fillRect(x + 6, y + 1 + bob, 4, 1);

  // Dark edges
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + 4, y + 1 + bob, 1, 6);
  ctx.fillRect(x + 11, y + 1 + bob, 1, 6);

  // Visor slit at y+4
  if (dir === 0) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + 5, y + 4 + bob, 6, 1);
    if (palette.eyeColor) {
      ctx.fillStyle = palette.eyeColor;
      ctx.fillRect(x + 6, y + 4 + bob, 1, 1);
      ctx.fillRect(x + 9, y + 4 + bob, 1, 1);
    }
  } else if (dir === 1) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + 4, y + 4 + bob, 4, 1);
    if (palette.eyeColor) {
      ctx.fillStyle = palette.eyeColor;
      ctx.fillRect(x + 5, y + 4 + bob, 1, 1);
    }
  } else if (dir === 2) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + 8, y + 4 + bob, 4, 1);
    if (palette.eyeColor) {
      ctx.fillStyle = palette.eyeColor;
      ctx.fillRect(x + 10, y + 4 + bob, 1, 1);
    }
  }
}

function drawHornedHelmet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  detail: string,
): void {
  drawHelmet(ctx, x, y, bob, dir, palette);

  // Horns extending up from top corners
  ctx.fillStyle = detail;
  ctx.fillRect(x + 4, y + 0 + bob, 1, 1);
  ctx.fillRect(x + 11, y + 0 + bob, 1, 1);
  // Horn highlight
  ctx.fillStyle = blendColor(detail, '#FFFFFF', 0.2);
  ctx.fillRect(x + 4, y + 0 + bob, 1, 1);
}

function drawHood(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;

  if (dir === 0) {
    ctx.fillRect(x + 4, y + 1 + bob, 8, 3);
    ctx.fillRect(x + 4, y + 3 + bob, 2, 3);
    ctx.fillRect(x + 10, y + 3 + bob, 2, 3);
    ctx.fillRect(x + 6, y + 0 + bob, 4, 1);
    // Hood shadow inside
    ctx.fillStyle = blendColor(palette.hair, '#000000', 0.2);
    ctx.fillRect(x + 5, y + 2 + bob, 6, 1);
  } else if (dir === 3) {
    ctx.fillRect(x + 4, y + 0 + bob, 8, 6);
    ctx.fillRect(x + 6, y + 0 + bob, 4, 1);
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.1);
    ctx.fillRect(x + 5, y + 0 + bob, 6, 1);
  } else if (dir === 1) {
    ctx.fillRect(x + 5, y + 1 + bob, 7, 3);
    ctx.fillRect(x + 9, y + 3 + bob, 3, 3);
    ctx.fillRect(x + 7, y + 0 + bob, 4, 1);
  } else {
    ctx.fillRect(x + 4, y + 1 + bob, 7, 3);
    ctx.fillRect(x + 4, y + 3 + bob, 3, 3);
    ctx.fillRect(x + 5, y + 0 + bob, 4, 1);
  }
}

function drawMask(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;
  if (dir === 0) {
    ctx.fillRect(x + 4, y + 1 + bob, 8, 2);
  } else if (dir === 3) {
    ctx.fillRect(x + 4, y + 1 + bob, 8, 5);
  } else if (dir === 1) {
    ctx.fillRect(x + 5, y + 1 + bob, 7, 2);
    ctx.fillRect(x + 9, y + 2 + bob, 3, 1);
  } else {
    ctx.fillRect(x + 4, y + 1 + bob, 7, 2);
    ctx.fillRect(x + 4, y + 2 + bob, 3, 1);
  }

  // Mask covering lower face (y+5 to y+6)
  if (dir !== 3) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + 5, y + 5 + bob, 6, 2);
    // Mask detail line
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 5, y + 6 + bob, 6, 1);
  }
}

function drawWildHair(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;

  if (dir === 0) {
    ctx.fillRect(x + 3, y + 0 + bob, 10, 3);
    // Spiky tips
    ctx.fillRect(x + 3, y + 0 + bob, 1, 1);
    ctx.fillRect(x + 6, y + 0 + bob, 1, 1);
    ctx.fillRect(x + 9, y + 0 + bob, 1, 1);
    ctx.fillRect(x + 12, y + 0 + bob, 1, 1);
    // Hair highlight
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.15);
    ctx.fillRect(x + 5, y + 0 + bob, 2, 1);
  } else if (dir === 3) {
    ctx.fillRect(x + 3, y + 0 + bob, 10, 5);
    ctx.fillRect(x + 3, y + 0 + bob, 1, 1);
    ctx.fillRect(x + 12, y + 0 + bob, 1, 1);
  } else if (dir === 1) {
    ctx.fillRect(x + 4, y + 0 + bob, 9, 3);
    ctx.fillRect(x + 9, y + 2 + bob, 4, 2);
    ctx.fillRect(x + 12, y + 0 + bob, 1, 1);
  } else {
    ctx.fillRect(x + 3, y + 0 + bob, 9, 3);
    ctx.fillRect(x + 3, y + 2 + bob, 4, 2);
    ctx.fillRect(x + 3, y + 0 + bob, 1, 1);
  }
}

function drawTopknot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;
  if (dir === 0) {
    ctx.fillRect(x + 4, y + 1 + bob, 8, 2);
  } else if (dir === 3) {
    ctx.fillRect(x + 4, y + 1 + bob, 8, 4);
  } else if (dir === 1) {
    ctx.fillRect(x + 5, y + 1 + bob, 7, 2);
  } else {
    ctx.fillRect(x + 4, y + 1 + bob, 7, 2);
  }

  // Topknot bun
  ctx.fillStyle = palette.hair;
  if (dir === 0 || dir === 3) {
    ctx.fillRect(x + 7, y + 0 + bob, 2, 1);
    ctx.fillRect(x + 7, y - 1 + bob, 2, 1);
    ctx.fillRect(x + 7, y - 2 + bob, 2, 1);
  } else if (dir === 1) {
    ctx.fillRect(x + 8, y + 0 + bob, 2, 1);
    ctx.fillRect(x + 8, y - 1 + bob, 2, 1);
    ctx.fillRect(x + 8, y - 2 + bob, 2, 1);
  } else {
    ctx.fillRect(x + 6, y + 0 + bob, 2, 1);
    ctx.fillRect(x + 6, y - 1 + bob, 2, 1);
    ctx.fillRect(x + 6, y - 2 + bob, 2, 1);
  }
}

function drawFeatherHat(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  detail: string,
): void {
  ctx.fillStyle = palette.hair;

  if (dir === 0) {
    ctx.fillRect(x + 3, y + 2 + bob, 10, 1);
    ctx.fillRect(x + 5, y + 1 + bob, 6, 1);
    ctx.fillRect(x + 6, y + 0 + bob, 4, 1);
  } else if (dir === 3) {
    ctx.fillRect(x + 3, y + 2 + bob, 10, 1);
    ctx.fillRect(x + 5, y + 1 + bob, 6, 1);
    ctx.fillRect(x + 6, y + 0 + bob, 4, 1);
    ctx.fillRect(x + 4, y + 3 + bob, 8, 2);
  } else if (dir === 1) {
    ctx.fillRect(x + 3, y + 2 + bob, 10, 1);
    ctx.fillRect(x + 6, y + 1 + bob, 6, 1);
    ctx.fillRect(x + 7, y + 0 + bob, 4, 1);
  } else {
    ctx.fillRect(x + 3, y + 2 + bob, 10, 1);
    ctx.fillRect(x + 4, y + 1 + bob, 6, 1);
    ctx.fillRect(x + 5, y + 0 + bob, 4, 1);
  }

  // Hat highlight
  ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.12);
  ctx.fillRect(x + 6, y + 0 + bob, 3, 1);

  // Feather accent
  ctx.fillStyle = detail;
  if (dir === 0 || dir === 2) {
    ctx.fillRect(x + 11, y + 0 + bob, 1, 1);
    ctx.fillRect(x + 12, y + 1 + bob, 1, 1);
  } else if (dir === 1) {
    ctx.fillRect(x + 12, y + 0 + bob, 1, 1);
    ctx.fillRect(x + 13, y + 1 + bob, 1, 1);
  } else {
    ctx.fillRect(x + 10, y + 0 + bob, 1, 1);
    ctx.fillRect(x + 11, y + 1 + bob, 1, 1);
  }
}

function drawGoggles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  detail: string,
): void {
  drawNormalHair(ctx, x, y, bob, dir, palette);

  // Goggles on forehead at y+3
  ctx.fillStyle = detail;
  if (dir === 0) {
    ctx.fillRect(x + 5, y + 3 + bob, 2, 1);
    ctx.fillRect(x + 9, y + 3 + bob, 2, 1);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 7, y + 3 + bob, 2, 1);
    // Lens highlight
    ctx.fillStyle = blendColor(detail, '#FFFFFF', 0.3);
    ctx.fillRect(x + 5, y + 3 + bob, 1, 1);
    ctx.fillRect(x + 9, y + 3 + bob, 1, 1);
  } else if (dir === 1) {
    ctx.fillRect(x + 5, y + 3 + bob, 2, 1);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 7, y + 3 + bob, 4, 1);
  } else if (dir === 2) {
    ctx.fillRect(x + 9, y + 3 + bob, 2, 1);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 5, y + 3 + bob, 4, 1);
  }
  if (dir === 3) {
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + 4, y + 3 + bob, 8, 1);
  }
}

function drawBandana(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  detail: string,
): void {
  drawNormalHair(ctx, x, y, bob, dir, palette);

  ctx.fillStyle = detail;
  if (dir === 0) {
    ctx.fillRect(x + 4, y + 3 + bob, 8, 1);
  } else if (dir === 3) {
    ctx.fillRect(x + 4, y + 3 + bob, 8, 1);
    ctx.fillRect(x + 9, y + 4 + bob, 1, 2);
    ctx.fillRect(x + 10, y + 5 + bob, 1, 1);
  } else if (dir === 1) {
    ctx.fillRect(x + 4, y + 3 + bob, 8, 1);
    ctx.fillRect(x + 11, y + 4 + bob, 1, 1);
  } else {
    ctx.fillRect(x + 4, y + 3 + bob, 8, 1);
    ctx.fillRect(x + 4, y + 4 + bob, 1, 1);
  }
}

// --------------------------------------------------
// Eyes - at y+4 to y+5
// --------------------------------------------------
function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  headType: string,
  eyeColor: string | undefined,
): void {
  if (headType === 'helmet' || headType === 'horned_helmet') {
    return;
  }

  if (dir === 3) {
    return;
  }

  const pupilColor = eyeColor ?? '#222244';
  const whiteColor = eyeColor ? eyeColor : '#FFFFFF';

  if (dir === 0) {
    ctx.fillStyle = whiteColor;
    ctx.fillRect(x + 6, y + 4 + bob, 2, 2);
    ctx.fillRect(x + 9, y + 4 + bob, 2, 2);

    if (!eyeColor) {
      ctx.fillStyle = pupilColor;
      ctx.fillRect(x + 7, y + 4 + bob, 1, 2);
      ctx.fillRect(x + 10, y + 4 + bob, 1, 2);
    }
  } else if (dir === 1) {
    ctx.fillStyle = whiteColor;
    ctx.fillRect(x + 5, y + 4 + bob, 2, 2);
    if (!eyeColor) {
      ctx.fillStyle = pupilColor;
      ctx.fillRect(x + 5, y + 4 + bob, 1, 2);
    }
  } else if (dir === 2) {
    ctx.fillStyle = whiteColor;
    ctx.fillRect(x + 9, y + 4 + bob, 2, 2);
    if (!eyeColor) {
      ctx.fillStyle = pupilColor;
      ctx.fillRect(x + 10, y + 4 + bob, 1, 2);
    }
  }
}

// --------------------------------------------------
// Utility: blend two hex colors
// --------------------------------------------------
function blendColor(base: string, target: string, amount: number): string {
  const b = parseInt(base.replace('#', ''), 16);
  const t = parseInt(target.replace('#', ''), 16);
  const br = (b >> 16) & 0xFF, bg = (b >> 8) & 0xFF, bb = b & 0xFF;
  const tr = (t >> 16) & 0xFF, tg = (t >> 8) & 0xFF, tb = t & 0xFF;
  const r = Math.round(br + (tr - br) * amount);
  const g = Math.round(bg + (tg - bg) * amount);
  const bv = Math.round(bb + (tb - bb) * amount);
  return '#' + ((r << 16) | (g << 8) | bv).toString(16).padStart(6, '0');
}
