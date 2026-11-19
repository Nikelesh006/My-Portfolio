import * as THREE from 'three';

/**
 * Generates an ultra-sharp 2048px canvas texture for an exhibit panel
 */
export function createPanelTexture(category) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background - Museum crisp warm white studio gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 2048, 1280);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2048, 1280);

  // Subtle interior architectural framing border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 8;
  ctx.strokeRect(64, 64, 1920, 1152);

  // Category Color Accent Bar
  ctx.fillStyle = category.color || '#3b82f6';
  ctx.fillRect(128, 128, 24, 112);

  // Section Index & Tag
  ctx.fillStyle = '#64748b';
  ctx.font = '600 48px "JetBrains Mono", monospace';
  ctx.fillText('EXHIBIT // ' + category.id.toUpperCase(), 184, 180);

  // Category Title
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 136px "Manrope", sans-serif';
  ctx.fillText(category.title, 184, 340);

  // Short Subtitle / Description
  ctx.fillStyle = '#475569';
  ctx.font = '500 52px "Manrope", sans-serif';
  const desc = category.description || '';
  ctx.fillText(desc.slice(0, 75), 184, 440);

  // Divider Line
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(184, 520);
  ctx.lineTo(1864, 520);
  ctx.stroke();

  // Skills Tag Pills Grid
  const tags = category.tags || [];
  let startX = 184;
  let startY = 640;

  tags.forEach((tag) => {
    ctx.font = '700 56px "JetBrains Mono", monospace';
    const textWidth = ctx.measureText(tag).width;
    const pillWidth = textWidth + 96;
    const pillHeight = 128;

    // Check line wrapping
    if (startX + pillWidth > 1864) {
      startX = 184;
      startY += 168;
    }

    // Pill background
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(startX, startY, pillWidth, pillHeight, 28);
    ctx.fill();

    // Small colored indicator dot inside pill
    ctx.fillStyle = category.color || '#3b82f6';
    ctx.beginPath();
    ctx.arc(startX + 48, startY + pillHeight / 2, 14, 0, Math.PI * 2);
    ctx.fill();

    // Pill text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tag, startX + 88, startY + 86);

    startX += pillWidth + 40;
  });

  // Bottom action cue
  ctx.fillStyle = '#64748b';
  ctx.font = '600 44px "JetBrains Mono", monospace';
  ctx.fillText('✦ CLICK TO INSPECT SKILLS BREAKDOWN', 184, 1120);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Generates an ultra-sharp 2048px canvas texture for the rotating centerpiece on the plinth
 */
export function createNameTexture(name = 'NIKELESHWARAN') {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Dark sleek gallery plinth tablet surface
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 2048, 640);

  // Metallic brushed border
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 12;
  ctx.strokeRect(32, 32, 1984, 576);

  // Subtle corner notches
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(32, 32, 48, 12);
  ctx.fillRect(32, 32, 12, 48);
  ctx.fillRect(1968, 32, 48, 12);
  ctx.fillRect(2004, 32, 12, 48);
  ctx.fillRect(32, 596, 48, 12);
  ctx.fillRect(32, 560, 12, 48);
  ctx.fillRect(1968, 596, 48, 12);
  ctx.fillRect(2004, 560, 12, 48);

  // Label above name
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PORTFOLIO EXHIBIT // CREATOR', 1024, 140);

  // 3D Name Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 168px "Manrope", sans-serif';
  ctx.fillText(name, 1024, 360);

  // Subtitle below
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 44px monospace';
  ctx.fillText('FULL STACK ARCHITECT & DEVELOPER', 1024, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
