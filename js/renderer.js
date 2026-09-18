import { PX_PER_CM, MAX_HYPOTENUSE_CM } from './config.js';

// Espaço reservado ao redor do triângulo para os rótulos desenhados na figura.
const MARGIN_LEFT = 70;
const MARGIN_RIGHT = 80;
const MARGIN_TOP = 70;
const MARGIN_BOTTOM = 70;

function normalize(v) {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

// Posiciona um rótulo na bissetriz interna do ângulo em `vertex`, formado
// pelos segmentos até `other1` e `other2` — sempre dentro do triângulo.
function interiorBisectorPoint(vertex, other1, other2, distance) {
  const d1 = normalize({ x: other1.x - vertex.x, y: other1.y - vertex.y });
  const d2 = normalize({ x: other2.x - vertex.x, y: other2.y - vertex.y });
  const bisector = normalize({ x: d1.x + d2.x, y: d1.y + d2.y });
  return { x: vertex.x + bisector.x * distance, y: vertex.y + bisector.y * distance };
}

// Posiciona um rótulo no ponto médio do segmento (p1, p2), deslocado
// perpendicularmente para o lado oposto ao vértice `awayFrom` do triângulo.
function labelPosition(p1, p2, awayFrom, distance) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;

  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const toAway = { x: awayFrom.x - mid.x, y: awayFrom.y - mid.y };
  if (nx * toAway.x + ny * toAway.y > 0) {
    nx = -nx;
    ny = -ny;
  }

  return { x: mid.x + nx * distance, y: mid.y + ny * distance };
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupResolution();
  }

  setupResolution() {
    // Maior cateto possível: hipotenusa máxima próxima de 5°/85°.
    const maxLeg = MAX_HYPOTENUSE_CM * PX_PER_CM;
    const width = MARGIN_LEFT + maxLeg + MARGIN_RIGHT;
    const height = MARGIN_TOP + maxLeg + MARGIN_BOTTOM;

    this.width = width;
    this.height = height;
    this.origin = { x: MARGIN_LEFT, y: height - MARGIN_BOTTOM };

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
  }

  isNearAngleLabel(point, radius = 22) {
    if (!this.angleLabelPos) return false;
    return Math.hypot(point.x - this.angleLabelPos.x, point.y - this.angleLabelPos.y) < radius;
  }

  isNearHypotenuseLabel(point, radius = 22) {
    if (!this.hypotenuseLabelPos) return false;
    return Math.hypot(point.x - this.hypotenuseLabelPos.x, point.y - this.hypotenuseLabelPos.y) < radius;
  }

  draw(origin, data, angleLocked = false, hypotenuseLocked = false) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const toCm = (px) => (px / PX_PER_CM).toFixed(1);

    // 1. Cateto Adjacente (Base - Azul)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(data.corner.x, data.corner.y);
    ctx.stroke();

    // 2. Cateto Oposto (Altura - Vermelho)
    ctx.strokeStyle = '#f87171';
    ctx.beginPath();
    ctx.moveTo(data.corner.x, data.corner.y);
    ctx.lineTo(data.target.x, data.target.y);
    ctx.stroke();

    // 3. Hipotenusa (Roxo)
    ctx.strokeStyle = '#a855f7';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(data.target.x, data.target.y);
    ctx.stroke();

    // Indicador de ângulo reto
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    const s = 14;
    ctx.strokeRect(data.corner.x - s, data.corner.y - s, s, s);

    // Arco indicador do ângulo θ
    const arcRadius = 30;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, arcRadius, -data.angleRad, 0);
    ctx.stroke();

    // Rótulo do valor do ângulo, na bissetriz do arco (clicável para travar/destravar)
    const bisector = -data.angleRad / 2;
    const labelR = arcRadius + 16;
    const angleLabelX = 10 + origin.x + labelR * Math.cos(bisector);
    const angleLabelY = origin.y + labelR * Math.sin(bisector);
    this.angleLabelPos = { x: angleLabelX, y: angleLabelY };

    ctx.fillStyle = '#facc15';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      angleLocked ? `${data.angleDeg}° 🔒` : `${data.angleDeg}°`,
      angleLabelX,
      angleLabelY
    );

    // Ângulo reto (90°), na bissetriz interna do vértice C
    ctx.fillStyle = '#94a3b8';
    const rightAngleLabel = interiorBisectorPoint(data.corner, origin, data.target, 30);
    ctx.fillText('90°', rightAngleLabel.x, rightAngleLabel.y);

    // Arco indicador do ângulo oposto ao cateto adjacente (vértice B), entre
    // a hipotenusa e o cateto oposto.
    const otherArcRadius = 22;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(data.target.x, data.target.y, otherArcRadius, Math.PI / 2, Math.PI - data.angleRad);
    ctx.stroke();

    // Ângulo complementar (90° - θ), na bissetriz interna do vértice B
    ctx.fillStyle = '#94a3b8';
    const otherAngleLabel = interiorBisectorPoint(data.target, origin, data.corner, otherArcRadius + 16);
    ctx.fillText(`${90 - data.angleDeg}°`, otherAngleLabel.x, otherAngleLabel.y);

    // Rótulos de medida das arestas (cm), posicionados sobre a figura
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Hipotenusa: acima da própria linha (clicável para travar/destravar)
    const hLabel = labelPosition(origin, data.target, data.corner, 26);
    this.hypotenuseLabelPos = hLabel;
    ctx.fillStyle = '#a855f7';
    ctx.fillText(
      hypotenuseLocked ? `${data.hypotenuseCm.toFixed(1)} cm 🔒` : `${data.hypotenuseCm.toFixed(1)} cm`,
      hLabel.x,
      hLabel.y
    );

    // Cateto Adjacente: abaixo da própria linha
    const caLabel = labelPosition(origin, data.corner, data.target, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${toCm(data.ca)} cm`, caLabel.x, caLabel.y);

    // Cateto Oposto: à direita da própria linha
    const coLabel = labelPosition(data.corner, data.target, origin, 36);
    ctx.fillStyle = '#f87171';
    ctx.fillText(`${toCm(data.co)} cm`, coLabel.x, coLabel.y);

    // Ponto arrastável
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(data.target.x, data.target.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}
