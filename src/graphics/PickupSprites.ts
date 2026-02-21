export function generatePickupTextures(scene: Phaser.Scene): void {
  // XP Gem Small - green 5px diamond with sparkle
  createPickup(scene, 'gem_small', 5, 5, (ctx) => {
    // Dark outline for definition
    ctx.fillStyle = '#227722';
    ctx.beginPath();
    ctx.moveTo(2.5, 0);
    ctx.lineTo(5, 2.5);
    ctx.lineTo(2.5, 5);
    ctx.lineTo(0, 2.5);
    ctx.closePath();
    ctx.fill();
    // Main gem body
    ctx.fillStyle = '#44DD44';
    ctx.beginPath();
    ctx.moveTo(2.5, 0.5);
    ctx.lineTo(4.5, 2.5);
    ctx.lineTo(2.5, 4.5);
    ctx.lineTo(0.5, 2.5);
    ctx.closePath();
    ctx.fill();
    // Upper facet (brighter)
    ctx.fillStyle = '#66EE66';
    ctx.fillRect(2, 1, 1, 1);
    ctx.fillRect(1, 2, 2, 1);
    // Specular highlight
    ctx.fillStyle = '#AAFFAA';
    ctx.fillRect(2, 1, 1, 1);
    // Sparkle pixel (bright white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(1, 1, 1, 1);
    // Bottom shadow facet
    ctx.fillStyle = '#33AA33';
    ctx.fillRect(2, 3, 2, 1);
  });

  // XP Gem Medium - blue 7px diamond with sparkle
  createPickup(scene, 'gem_medium', 7, 7, (ctx) => {
    // Dark outline
    ctx.fillStyle = '#223388';
    ctx.beginPath();
    ctx.moveTo(3.5, 0);
    ctx.lineTo(7, 3.5);
    ctx.lineTo(3.5, 7);
    ctx.lineTo(0, 3.5);
    ctx.closePath();
    ctx.fill();
    // Main gem body
    ctx.fillStyle = '#4488FF';
    ctx.beginPath();
    ctx.moveTo(3.5, 0.5);
    ctx.lineTo(6.5, 3.5);
    ctx.lineTo(3.5, 6.5);
    ctx.lineTo(0.5, 3.5);
    ctx.closePath();
    ctx.fill();
    // Upper facet (lighter)
    ctx.fillStyle = '#66AAFF';
    ctx.fillRect(2, 1, 3, 2);
    // Inner highlight
    ctx.fillStyle = '#88CCFF';
    ctx.fillRect(2, 2, 3, 2);
    // Specular highlight
    ctx.fillStyle = '#BBDDFF';
    ctx.fillRect(3, 1, 1, 1);
    // Sparkle pixel (bright white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, 1, 1, 1);
    // Bottom shadow facet
    ctx.fillStyle = '#3366CC';
    ctx.fillRect(3, 4, 2, 2);
    // Center line facet detail
    ctx.fillStyle = '#5599FF';
    ctx.fillRect(1, 3, 5, 1);
  });

  // XP Gem Large - red 9px diamond with sparkle
  createPickup(scene, 'gem_large', 9, 9, (ctx) => {
    // Dark outline
    ctx.fillStyle = '#882222';
    ctx.beginPath();
    ctx.moveTo(4.5, 0);
    ctx.lineTo(9, 4.5);
    ctx.lineTo(4.5, 9);
    ctx.lineTo(0, 4.5);
    ctx.closePath();
    ctx.fill();
    // Main gem body
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(4.5, 0.7);
    ctx.lineTo(8.3, 4.5);
    ctx.lineTo(4.5, 8.3);
    ctx.lineTo(0.7, 4.5);
    ctx.closePath();
    ctx.fill();
    // Upper facet (brighter)
    ctx.fillStyle = '#FF6666';
    ctx.fillRect(3, 1, 3, 3);
    // Inner highlight zone
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(3, 2, 3, 2);
    // Center horizontal facet line
    ctx.fillStyle = '#EE5555';
    ctx.fillRect(1, 4, 7, 1);
    // Specular highlight
    ctx.fillStyle = '#FFBBBB';
    ctx.fillRect(3, 2, 2, 1);
    // Sparkle pixel (bright white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 1, 1, 1);
    ctx.fillRect(4, 2, 1, 1);
    // Bottom shadow facet
    ctx.fillStyle = '#CC3333';
    ctx.fillRect(3, 5, 3, 3);
    // Deep shadow
    ctx.fillStyle = '#AA2222';
    ctx.fillRect(4, 7, 1, 1);
  });

  // Health heart - red 9x8 with detailed shading
  createPickup(scene, 'health_heart', 9, 8, (ctx) => {
    // Dark outline / shadow layer
    ctx.fillStyle = '#881111';
    ctx.beginPath();
    ctx.arc(3, 3, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, 3, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.2, 3);
    ctx.lineTo(4.5, 8.2);
    ctx.lineTo(9.2, 3);
    ctx.closePath();
    ctx.fill();

    // Main heart body
    ctx.fillStyle = '#EE2222';
    // Left bump
    ctx.beginPath();
    ctx.arc(3, 3, 3, 0, Math.PI * 2);
    ctx.fill();
    // Right bump
    ctx.beginPath();
    ctx.arc(6, 3, 3, 0, Math.PI * 2);
    ctx.fill();
    // Bottom triangle
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(4.5, 8);
    ctx.lineTo(9, 3);
    ctx.closePath();
    ctx.fill();

    // Shadow on bottom-right (gives 3D depth)
    ctx.fillStyle = '#CC1111';
    ctx.fillRect(5, 4, 3, 2);
    ctx.fillRect(4, 6, 2, 1);

    // Midtone transition
    ctx.fillStyle = '#DD2222';
    ctx.fillRect(3, 4, 3, 2);

    // Upper-left highlight (light hitting top)
    ctx.fillStyle = '#FF5555';
    ctx.fillRect(1, 2, 3, 2);
    ctx.fillRect(2, 1, 2, 1);

    // Bright specular highlight
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(2, 1, 2, 2);

    // White specular spot
    ctx.fillStyle = '#FFBBBB';
    ctx.fillRect(2, 1, 1, 1);

    // Hot pixel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, 2, 1, 1);

    // Deep shadow at bottom tip
    ctx.fillStyle = '#991111';
    ctx.fillRect(4, 7, 1, 1);
  });
}

function createPickup(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): void {
  const canvas = scene.textures.createCanvas(key, w, h)!;
  draw(canvas.context);
  canvas.refresh();
}
