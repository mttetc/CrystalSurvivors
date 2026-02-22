import { JobId } from '../constants';
import { S } from './spriteUtils';

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
  generatePlayerSheet(scene, 'player', DEFAULT_PALETTE);
  for (const jobId of Object.values(JobId)) {
    const palette = JOB_PALETTES[jobId];
    if (palette) {
      generatePlayerSheet(scene, 'player_' + jobId, palette);
    }
  }
}

function generatePlayerSheet(scene: Phaser.Scene, key: string, palette: PlayerPalette): void {
  const W = S(16);
  const H = S(20);
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
  const bob = (frame === 1 || frame === 3) ? S(-1) : 0;
  const headType = palette.headType ?? 'normal';
  const bodyType = palette.bodyType ?? 'standard';
  const eyeColor = palette.eyeColor;
  const detail = palette.detail ?? palette.armorLight;

  drawShadow(ctx, x, y);

  if (bodyType !== 'robe') {
    drawLegs(ctx, x, y, bob, frame, palette);
  } else {
    drawRobeLegs(ctx, x, y, bob, frame, palette);
  }

  drawBody(ctx, x, y, bob, dir, palette, bodyType);
  drawArms(ctx, x, y, bob, dir, palette, bodyType);
  drawHead(ctx, x, y, bob, dir, palette, headType);
  drawHeadgear(ctx, x, y, bob, dir, palette, headType, detail);
  drawEyes(ctx, x, y, bob, dir, palette, headType, eyeColor);
}

// --------------------------------------------------
// Shadow
// --------------------------------------------------
function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x + S(4), y + S(18), S(8), S(2));
}

// --------------------------------------------------
// Legs
// --------------------------------------------------
function drawLegs(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, frame: number,
  palette: PlayerPalette,
): void {
  const legOffset = frame === 1 ? S(1) : frame === 3 ? S(-1) : 0;

  // Upper leg (thigh)
  ctx.fillStyle = palette.legs;
  ctx.fillRect(x + S(5), y + S(13) + bob, S(2), S(2));
  ctx.fillRect(x + S(9), y + S(13) + bob, S(2), S(2));

  // Lower leg (shin)
  const shinColor = blendColor(palette.legs, '#FFFFFF', 0.08);
  ctx.fillStyle = shinColor;
  ctx.fillRect(x + S(5), y + S(15) + bob, S(2), S(2));
  ctx.fillRect(x + S(9), y + S(15) + bob, S(2), S(2));

  // Feet / boots
  ctx.fillStyle = palette.legs;
  ctx.fillRect(x + S(4), y + S(17) + bob, S(3), S(1));
  ctx.fillRect(x + S(9), y + S(17) + bob, S(3), S(1));

  // Walk animation
  if (legOffset !== 0) {
    ctx.fillStyle = palette.legs;
    ctx.fillRect(x + S(5), y + S(13) + bob + legOffset, S(2), S(2));
    ctx.fillRect(x + S(9), y + S(13) + bob - legOffset, S(2), S(2));
    ctx.fillStyle = shinColor;
    ctx.fillRect(x + S(5), y + S(15) + bob + legOffset, S(2), S(2));
    ctx.fillRect(x + S(9), y + S(15) + bob - legOffset, S(2), S(2));
    ctx.fillStyle = palette.legs;
    ctx.fillRect(x + S(4), y + S(17) + bob + legOffset, S(3), S(1));
    ctx.fillRect(x + S(9), y + S(17) + bob - legOffset, S(3), S(1));
  }

  // Knee highlight
  ctx.fillStyle = blendColor(palette.legs, '#FFFFFF', 0.15);
  ctx.fillRect(x + S(5), y + S(14) + bob, S(1), S(1));
  ctx.fillRect(x + S(9), y + S(14) + bob, S(1), S(1));

  // Extra detail at 2x: boot cuff
  ctx.fillStyle = blendColor(palette.legs, '#FFFFFF', 0.1);
  ctx.fillRect(x + S(4), y + S(16.5) + bob, S(3), S(0.5));
  ctx.fillRect(x + S(9), y + S(16.5) + bob, S(3), S(0.5));
}

function drawRobeLegs(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, frame: number,
  palette: PlayerPalette,
): void {
  const legOffset = frame === 1 ? S(1) : frame === 3 ? S(-1) : 0;
  ctx.fillStyle = palette.legs;
  ctx.fillRect(x + S(5), y + S(17) + bob, S(2), S(1));
  ctx.fillRect(x + S(9), y + S(17) + bob, S(2), S(1));
  if (legOffset !== 0) {
    ctx.fillRect(x + S(5) + legOffset, y + S(17) + bob, S(2), S(1));
    ctx.fillRect(x + S(9) - legOffset, y + S(17) + bob, S(2), S(1));
  }
}

// --------------------------------------------------
// Body
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
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(4), y + S(7) + bob, S(8), S(6));
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + S(5), y + S(8) + bob, S(6), S(2));
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(5), y + S(10) + bob, S(6), S(1));
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(4), y + S(11) + bob, S(8), S(2));
  // Belt buckle
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + S(7), y + S(11) + bob, S(2), S(1));
  // Subtle chest seam detail
  ctx.fillStyle = blendColor(palette.armor, '#000000', 0.06);
  ctx.fillRect(x + S(7.5), y + S(8) + bob, S(1), S(3));
}

function drawArmorBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, _dir: number,
  palette: PlayerPalette,
): void {
  // Shoulder pads
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + S(3), y + S(7) + bob, S(10), S(2));
  ctx.fillStyle = blendColor(palette.armorLight, '#FFFFFF', 0.15);
  ctx.fillRect(x + S(3), y + S(7) + bob, S(10), S(1));
  // Main torso plate
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(4), y + S(8) + bob, S(8), S(5));
  // Chest plate highlight
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + S(5), y + S(9) + bob, S(6), S(2));
  // Chest center line
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(7), y + S(8) + bob, S(2), S(3));
  // Belt region
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(4), y + S(11) + bob, S(8), S(2));
  // Belt buckle
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + S(7), y + S(11) + bob, S(2), S(1));
  // Armor edge highlight
  ctx.fillStyle = blendColor(palette.armor, '#FFFFFF', 0.1);
  ctx.fillRect(x + S(4), y + S(8) + bob, S(1), S(5));
  // Rivet detail on shoulders
  ctx.fillStyle = blendColor(palette.armorLight, '#FFFFFF', 0.25);
  ctx.fillRect(x + S(4), y + S(7.5) + bob, S(1), S(1));
  ctx.fillRect(x + S(11), y + S(7.5) + bob, S(1), S(1));
}

function drawRobeBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, _dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(4), y + S(7) + bob, S(8), S(5));
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + S(5), y + S(8) + bob, S(6), S(2));
  // Sash/belt
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(4), y + S(10) + bob, S(8), S(1));
  // Lower robe widens
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(4), y + S(11) + bob, S(9), S(3));
  // Bottom hem wider
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(3), y + S(14) + bob, S(10), S(3));
  // Robe fold detail
  ctx.fillStyle = blendColor(palette.armorDark, '#000000', 0.15);
  ctx.fillRect(x + S(5), y + S(14) + bob, S(1), S(3));
  ctx.fillRect(x + S(9), y + S(14) + bob, S(1), S(3));
  // Robe hem highlight
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(4), y + S(16) + bob, S(8), S(1));
  // Center embroidery line
  ctx.fillStyle = blendColor(palette.armorLight, '#FFFFFF', 0.08);
  ctx.fillRect(x + S(7.5), y + S(11) + bob, S(1), S(5));
}

function drawLightBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, _dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(5), y + S(7) + bob, S(7), S(6));
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + S(6), y + S(8) + bob, S(5), S(2));
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(5), y + S(10) + bob, S(7), S(1));
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(5), y + S(11) + bob, S(7), S(2));

  // Monk: gi neckline
  if (palette.headType === 'bald') {
    ctx.fillStyle = palette.skin;
    ctx.fillRect(x + S(7), y + S(7) + bob, S(3), S(1));
  }

  // Berserker: bare upper chest
  if (palette.headType === 'wild') {
    ctx.fillStyle = palette.skin;
    ctx.fillRect(x + S(6), y + S(7) + bob, S(5), S(2));
    // Muscle definition
    ctx.fillStyle = blendColor(palette.skin, '#000000', 0.1);
    ctx.fillRect(x + S(8), y + S(7) + bob, S(1), S(2));
    // Scar detail
    ctx.fillStyle = blendColor(palette.skin, '#AA4444', 0.3);
    ctx.fillRect(x + S(7), y + S(7.5) + bob, S(2), S(0.5));
    // Lower garment
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + S(5), y + S(9) + bob, S(7), S(4));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(5), y + S(11) + bob, S(7), S(2));
  }
}

// --------------------------------------------------
// Arms
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
    ctx.fillStyle = armColor;
    if (dir === 1) {
      ctx.fillRect(x + S(3), y + S(8) + bob, S(2), S(5));
    } else if (dir === 2) {
      ctx.fillRect(x + S(11), y + S(8) + bob, S(2), S(5));
    } else {
      ctx.fillRect(x + S(3), y + S(8) + bob, S(2), S(5));
      ctx.fillRect(x + S(11), y + S(8) + bob, S(2), S(5));
    }

    if (isLight) {
      ctx.fillStyle = palette.skin;
      if (dir === 1) {
        ctx.fillRect(x + S(3), y + S(12) + bob, S(2), S(1));
      } else if (dir === 2) {
        ctx.fillRect(x + S(11), y + S(12) + bob, S(2), S(1));
      } else {
        ctx.fillRect(x + S(3), y + S(12) + bob, S(2), S(1));
        ctx.fillRect(x + S(11), y + S(12) + bob, S(2), S(1));
      }
    }

    const armHL = blendColor(armColor, '#FFFFFF', 0.12);
    ctx.fillStyle = armHL;
    if (dir === 1) {
      ctx.fillRect(x + S(3), y + S(8) + bob, S(1), S(1));
    } else if (dir === 2) {
      ctx.fillRect(x + S(12), y + S(8) + bob, S(1), S(1));
    } else {
      ctx.fillRect(x + S(3), y + S(8) + bob, S(1), S(1));
      ctx.fillRect(x + S(12), y + S(8) + bob, S(1), S(1));
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
    ctx.fillRect(x + S(2), y + S(8) + bob, S(2), S(5));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(2), y + S(12) + bob, S(2), S(1));
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + S(2), y + S(8) + bob, S(1), S(1));
  } else if (dir === 2) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + S(12), y + S(8) + bob, S(2), S(5));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(12), y + S(12) + bob, S(2), S(1));
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + S(13), y + S(8) + bob, S(1), S(1));
  } else {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + S(2), y + S(8) + bob, S(2), S(5));
    ctx.fillRect(x + S(12), y + S(8) + bob, S(2), S(5));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(2), y + S(12) + bob, S(2), S(1));
    ctx.fillRect(x + S(12), y + S(12) + bob, S(2), S(1));
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + S(2), y + S(8) + bob, S(1), S(1));
    ctx.fillRect(x + S(13), y + S(8) + bob, S(1), S(1));
  }
}

function drawRobeArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  if (dir === 1) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + S(2), y + S(8) + bob, S(3), S(5));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(2), y + S(12) + bob, S(3), S(1));
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + S(2), y + S(8) + bob, S(1), S(2));
  } else if (dir === 2) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + S(11), y + S(8) + bob, S(3), S(5));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(11), y + S(12) + bob, S(3), S(1));
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + S(13), y + S(8) + bob, S(1), S(2));
  } else {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + S(2), y + S(8) + bob, S(3), S(5));
    ctx.fillRect(x + S(11), y + S(8) + bob, S(3), S(5));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(2), y + S(12) + bob, S(3), S(1));
    ctx.fillRect(x + S(11), y + S(12) + bob, S(3), S(1));
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(x + S(2), y + S(8) + bob, S(1), S(2));
    ctx.fillRect(x + S(13), y + S(8) + bob, S(1), S(2));
  }
}

// --------------------------------------------------
// Head (base skin)
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

  ctx.fillStyle = palette.skin;
  ctx.fillRect(x + S(5), y + S(2) + bob, S(6), S(5));

  // Face shading
  const skinShadow = blendColor(palette.skin, '#000000', 0.08);
  ctx.fillStyle = skinShadow;
  ctx.fillRect(x + S(5), y + S(4) + bob, S(1), S(3));
  ctx.fillRect(x + S(10), y + S(4) + bob, S(1), S(3));

  // Chin shadow
  ctx.fillStyle = blendColor(palette.skin, '#000000', 0.05);
  ctx.fillRect(x + S(6), y + S(6) + bob, S(4), S(1));
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
    ctx.fillRect(x + S(4), y + S(1) + bob, S(8), S(3));
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.15);
    ctx.fillRect(x + S(5), y + S(1) + bob, S(4), S(1));
  } else if (dir === 3) {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(8), S(5));
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.1);
    ctx.fillRect(x + S(5), y + S(1) + bob, S(4), S(1));
  } else if (dir === 1) {
    ctx.fillRect(x + S(5), y + S(1) + bob, S(7), S(3));
    ctx.fillRect(x + S(9), y + S(3) + bob, S(3), S(2));
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.15);
    ctx.fillRect(x + S(6), y + S(1) + bob, S(3), S(1));
  } else {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(7), S(3));
    ctx.fillRect(x + S(4), y + S(3) + bob, S(3), S(2));
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.15);
    ctx.fillRect(x + S(5), y + S(1) + bob, S(3), S(1));
  }
}

function drawPointyHat(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;
  ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(1));
  ctx.fillRect(x + S(5), y + S(2) + bob, S(6), S(1));
  ctx.fillRect(x + S(6), y + S(1) + bob, S(4), S(1));
  ctx.fillRect(x + S(7), y + S(0) + bob, S(2), S(1));

  if (dir === 3) {
    ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(4));
  }

  if (dir === 1) {
    ctx.fillRect(x + S(5), y + S(3) + bob, S(7), S(1));
    ctx.fillRect(x + S(6), y + S(2) + bob, S(5), S(1));
    ctx.fillRect(x + S(7), y + S(1) + bob, S(4), S(1));
    ctx.fillRect(x + S(8), y + S(0) + bob, S(2), S(1));
  } else if (dir === 2) {
    ctx.fillRect(x + S(4), y + S(3) + bob, S(7), S(1));
    ctx.fillRect(x + S(5), y + S(2) + bob, S(5), S(1));
    ctx.fillRect(x + S(5), y + S(1) + bob, S(4), S(1));
    ctx.fillRect(x + S(6), y + S(0) + bob, S(2), S(1));
  }

  // Hat band
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(1));
  // Hat highlight
  ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.12);
  ctx.fillRect(x + S(6), y + S(1) + bob, S(2), S(1));
}

function drawHelmet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.armor;
  ctx.fillRect(x + S(4), y + S(1) + bob, S(8), S(6));

  // Top highlight
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(x + S(5), y + S(1) + bob, S(6), S(2));
  ctx.fillStyle = blendColor(palette.armorLight, '#FFFFFF', 0.15);
  ctx.fillRect(x + S(6), y + S(1) + bob, S(4), S(1));

  // Dark edges
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(4), y + S(1) + bob, S(1), S(6));
  ctx.fillRect(x + S(11), y + S(1) + bob, S(1), S(6));

  // Visor detail - crest line
  ctx.fillStyle = blendColor(palette.armorLight, '#FFFFFF', 0.2);
  ctx.fillRect(x + S(7.5), y + S(1) + bob, S(1), S(2));

  // Visor slit
  if (dir === 0) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + S(5), y + S(4) + bob, S(6), S(1));
    if (palette.eyeColor) {
      ctx.fillStyle = palette.eyeColor;
      ctx.fillRect(x + S(6), y + S(4) + bob, S(1), S(1));
      ctx.fillRect(x + S(9), y + S(4) + bob, S(1), S(1));
    }
  } else if (dir === 1) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + S(4), y + S(4) + bob, S(4), S(1));
    if (palette.eyeColor) {
      ctx.fillStyle = palette.eyeColor;
      ctx.fillRect(x + S(5), y + S(4) + bob, S(1), S(1));
    }
  } else if (dir === 2) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + S(8), y + S(4) + bob, S(4), S(1));
    if (palette.eyeColor) {
      ctx.fillStyle = palette.eyeColor;
      ctx.fillRect(x + S(10), y + S(4) + bob, S(1), S(1));
    }
  }

  // Chin guard
  ctx.fillStyle = palette.armorDark;
  ctx.fillRect(x + S(5), y + S(6) + bob, S(6), S(1));
}

function drawHornedHelmet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  detail: string,
): void {
  drawHelmet(ctx, x, y, bob, dir, palette);

  // Horns
  ctx.fillStyle = detail;
  ctx.fillRect(x + S(4), y + S(0) + bob, S(1), S(1));
  ctx.fillRect(x + S(11), y + S(0) + bob, S(1), S(1));
  // Horn base
  ctx.fillRect(x + S(4), y + S(0.5) + bob, S(2), S(1));
  ctx.fillRect(x + S(10), y + S(0.5) + bob, S(2), S(1));
  // Horn highlight
  ctx.fillStyle = blendColor(detail, '#FFFFFF', 0.2);
  ctx.fillRect(x + S(4), y + S(0) + bob, S(1), S(1));
}

function drawHood(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;

  if (dir === 0) {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(8), S(3));
    ctx.fillRect(x + S(4), y + S(3) + bob, S(2), S(3));
    ctx.fillRect(x + S(10), y + S(3) + bob, S(2), S(3));
    ctx.fillRect(x + S(6), y + S(0) + bob, S(4), S(1));
    ctx.fillStyle = blendColor(palette.hair, '#000000', 0.2);
    ctx.fillRect(x + S(5), y + S(2) + bob, S(6), S(1));
  } else if (dir === 3) {
    ctx.fillRect(x + S(4), y + S(0) + bob, S(8), S(6));
    ctx.fillRect(x + S(6), y + S(0) + bob, S(4), S(1));
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.1);
    ctx.fillRect(x + S(5), y + S(0) + bob, S(6), S(1));
  } else if (dir === 1) {
    ctx.fillRect(x + S(5), y + S(1) + bob, S(7), S(3));
    ctx.fillRect(x + S(9), y + S(3) + bob, S(3), S(3));
    ctx.fillRect(x + S(7), y + S(0) + bob, S(4), S(1));
  } else {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(7), S(3));
    ctx.fillRect(x + S(4), y + S(3) + bob, S(3), S(3));
    ctx.fillRect(x + S(5), y + S(0) + bob, S(4), S(1));
  }
}

function drawMask(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;
  if (dir === 0) {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(8), S(2));
  } else if (dir === 3) {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(8), S(5));
  } else if (dir === 1) {
    ctx.fillRect(x + S(5), y + S(1) + bob, S(7), S(2));
    ctx.fillRect(x + S(9), y + S(2) + bob, S(3), S(1));
  } else {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(7), S(2));
    ctx.fillRect(x + S(4), y + S(2) + bob, S(3), S(1));
  }

  // Mask covering lower face
  if (dir !== 3) {
    ctx.fillStyle = palette.armor;
    ctx.fillRect(x + S(5), y + S(5) + bob, S(6), S(2));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(5), y + S(6) + bob, S(6), S(1));
    // Mask stitch detail
    ctx.fillStyle = blendColor(palette.armor, '#000000', 0.1);
    ctx.fillRect(x + S(7.5), y + S(5) + bob, S(1), S(2));
  }
}

function drawWildHair(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;

  if (dir === 0) {
    ctx.fillRect(x + S(3), y + S(0) + bob, S(10), S(3));
    ctx.fillRect(x + S(3), y + S(0) + bob, S(1), S(1));
    ctx.fillRect(x + S(6), y + S(0) + bob, S(1), S(1));
    ctx.fillRect(x + S(9), y + S(0) + bob, S(1), S(1));
    ctx.fillRect(x + S(12), y + S(0) + bob, S(1), S(1));
    ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.15);
    ctx.fillRect(x + S(5), y + S(0) + bob, S(2), S(1));
  } else if (dir === 3) {
    ctx.fillRect(x + S(3), y + S(0) + bob, S(10), S(5));
    ctx.fillRect(x + S(3), y + S(0) + bob, S(1), S(1));
    ctx.fillRect(x + S(12), y + S(0) + bob, S(1), S(1));
  } else if (dir === 1) {
    ctx.fillRect(x + S(4), y + S(0) + bob, S(9), S(3));
    ctx.fillRect(x + S(9), y + S(2) + bob, S(4), S(2));
    ctx.fillRect(x + S(12), y + S(0) + bob, S(1), S(1));
  } else {
    ctx.fillRect(x + S(3), y + S(0) + bob, S(9), S(3));
    ctx.fillRect(x + S(3), y + S(2) + bob, S(4), S(2));
    ctx.fillRect(x + S(3), y + S(0) + bob, S(1), S(1));
  }
}

function drawTopknot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
): void {
  ctx.fillStyle = palette.hair;
  if (dir === 0) {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(8), S(2));
  } else if (dir === 3) {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(8), S(4));
  } else if (dir === 1) {
    ctx.fillRect(x + S(5), y + S(1) + bob, S(7), S(2));
  } else {
    ctx.fillRect(x + S(4), y + S(1) + bob, S(7), S(2));
  }

  // Topknot bun
  ctx.fillStyle = palette.hair;
  if (dir === 0 || dir === 3) {
    ctx.fillRect(x + S(7), y + S(0) + bob, S(2), S(1));
    ctx.fillRect(x + S(7), y + S(-1) + bob, S(2), S(1));
    ctx.fillRect(x + S(7), y + S(-2) + bob, S(2), S(1));
  } else if (dir === 1) {
    ctx.fillRect(x + S(8), y + S(0) + bob, S(2), S(1));
    ctx.fillRect(x + S(8), y + S(-1) + bob, S(2), S(1));
    ctx.fillRect(x + S(8), y + S(-2) + bob, S(2), S(1));
  } else {
    ctx.fillRect(x + S(6), y + S(0) + bob, S(2), S(1));
    ctx.fillRect(x + S(6), y + S(-1) + bob, S(2), S(1));
    ctx.fillRect(x + S(6), y + S(-2) + bob, S(2), S(1));
  }
  // Topknot tie
  ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.2);
  if (dir === 0 || dir === 3) {
    ctx.fillRect(x + S(7), y + S(0) + bob, S(2), S(0.5));
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
    ctx.fillRect(x + S(3), y + S(2) + bob, S(10), S(1));
    ctx.fillRect(x + S(5), y + S(1) + bob, S(6), S(1));
    ctx.fillRect(x + S(6), y + S(0) + bob, S(4), S(1));
  } else if (dir === 3) {
    ctx.fillRect(x + S(3), y + S(2) + bob, S(10), S(1));
    ctx.fillRect(x + S(5), y + S(1) + bob, S(6), S(1));
    ctx.fillRect(x + S(6), y + S(0) + bob, S(4), S(1));
    ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(2));
  } else if (dir === 1) {
    ctx.fillRect(x + S(3), y + S(2) + bob, S(10), S(1));
    ctx.fillRect(x + S(6), y + S(1) + bob, S(6), S(1));
    ctx.fillRect(x + S(7), y + S(0) + bob, S(4), S(1));
  } else {
    ctx.fillRect(x + S(3), y + S(2) + bob, S(10), S(1));
    ctx.fillRect(x + S(4), y + S(1) + bob, S(6), S(1));
    ctx.fillRect(x + S(5), y + S(0) + bob, S(4), S(1));
  }

  ctx.fillStyle = blendColor(palette.hair, '#FFFFFF', 0.12);
  ctx.fillRect(x + S(6), y + S(0) + bob, S(3), S(1));

  // Feather accent
  ctx.fillStyle = detail;
  if (dir === 0 || dir === 2) {
    ctx.fillRect(x + S(11), y + S(0) + bob, S(1), S(1));
    ctx.fillRect(x + S(12), y + S(1) + bob, S(1), S(1));
  } else if (dir === 1) {
    ctx.fillRect(x + S(12), y + S(0) + bob, S(1), S(1));
    ctx.fillRect(x + S(13), y + S(1) + bob, S(1), S(1));
  } else {
    ctx.fillRect(x + S(10), y + S(0) + bob, S(1), S(1));
    ctx.fillRect(x + S(11), y + S(1) + bob, S(1), S(1));
  }
}

function drawGoggles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bob: number, dir: number,
  palette: PlayerPalette,
  detail: string,
): void {
  drawNormalHair(ctx, x, y, bob, dir, palette);

  ctx.fillStyle = detail;
  if (dir === 0) {
    ctx.fillRect(x + S(5), y + S(3) + bob, S(2), S(1));
    ctx.fillRect(x + S(9), y + S(3) + bob, S(2), S(1));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(7), y + S(3) + bob, S(2), S(1));
    ctx.fillStyle = blendColor(detail, '#FFFFFF', 0.3);
    ctx.fillRect(x + S(5), y + S(3) + bob, S(1), S(1));
    ctx.fillRect(x + S(9), y + S(3) + bob, S(1), S(1));
  } else if (dir === 1) {
    ctx.fillRect(x + S(5), y + S(3) + bob, S(2), S(1));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(7), y + S(3) + bob, S(4), S(1));
  } else if (dir === 2) {
    ctx.fillRect(x + S(9), y + S(3) + bob, S(2), S(1));
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(5), y + S(3) + bob, S(4), S(1));
  }
  if (dir === 3) {
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(1));
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
    ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(1));
  } else if (dir === 3) {
    ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(1));
    ctx.fillRect(x + S(9), y + S(4) + bob, S(1), S(2));
    ctx.fillRect(x + S(10), y + S(5) + bob, S(1), S(1));
  } else if (dir === 1) {
    ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(1));
    ctx.fillRect(x + S(11), y + S(4) + bob, S(1), S(1));
  } else {
    ctx.fillRect(x + S(4), y + S(3) + bob, S(8), S(1));
    ctx.fillRect(x + S(4), y + S(4) + bob, S(1), S(1));
  }
}

// --------------------------------------------------
// Eyes
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
    ctx.fillRect(x + S(6), y + S(4) + bob, S(2), S(2));
    ctx.fillRect(x + S(9), y + S(4) + bob, S(2), S(2));

    if (!eyeColor) {
      ctx.fillStyle = pupilColor;
      ctx.fillRect(x + S(7), y + S(4) + bob, S(1), S(2));
      ctx.fillRect(x + S(10), y + S(4) + bob, S(1), S(2));
    }
  } else if (dir === 1) {
    ctx.fillStyle = whiteColor;
    ctx.fillRect(x + S(5), y + S(4) + bob, S(2), S(2));
    if (!eyeColor) {
      ctx.fillStyle = pupilColor;
      ctx.fillRect(x + S(5), y + S(4) + bob, S(1), S(2));
    }
  } else if (dir === 2) {
    ctx.fillStyle = whiteColor;
    ctx.fillRect(x + S(9), y + S(4) + bob, S(2), S(2));
    if (!eyeColor) {
      ctx.fillStyle = pupilColor;
      ctx.fillRect(x + S(10), y + S(4) + bob, S(1), S(2));
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
