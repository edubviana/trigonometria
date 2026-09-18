import { calculateTriangle } from './math.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('trigCanvas');
const formulas = document.getElementById('formulas');
const renderer = new Renderer(canvas, handleResize);

// Estado inicial: ~45°, 3,5 cm de hipotenusa (convertido para px na escala atual).
const INITIAL_ANGLE_RAD = (45 * Math.PI) / 180;
const INITIAL_HYPOTENUSE_CM = 3.5;
let mouse = {
  x: renderer.origin.x + INITIAL_HYPOTENUSE_CM * renderer.pxPerCm * Math.cos(INITIAL_ANGLE_RAD),
  y: renderer.origin.y - INITIAL_HYPOTENUSE_CM * renderer.pxPerCm * Math.sin(INITIAL_ANGLE_RAD)
};
let isDragging = false;
let angleLocked = false;
let lockedAngleDeg = null;
let hypotenuseLocked = false;
let lockedHypotenuseCm = null;
let lastData = null;

function fraction(num, den) {
  return `<span class="fraction"><span class="num">${num}</span><span class="den">${den}</span></span>`;
}

function updateUI(data) {
//  const sin = Math.sin(data.angleRad).toFixed(2) / 10;
//  const cos = Math.cos(data.angleRad).toFixed(2) / 10;
  const angle = data.angleDeg;
  const h = ( data.hypotenuseCm /10 ).toFixed(2);
  const ca = (data.ca / renderer.pxPerCm / 10).toFixed(2);
  const co = (data.co / renderer.pxPerCm / 10).toFixed(2);
  const sin = (co/h);
  const cos = (ca/h);
  const tan = (co/ca);
  const cos_angle = `cos ${angle}°`;
  const sen_angle = `sen ${angle}°`;


  formulas.innerHTML = `
    <div class="formula-row">
      <span class="opposite">sen</span> <span class="angle">${angle}°</span> = ${fraction('cateto oposto', 'hipotenusa')} = ${fraction(co, h)} ≅ ${sin.toFixed(2)}
    </div>
    <div class="formula-row">
      <span class="adjacent">cos</span> <span class="angle">${angle}° </span> = ${fraction('cateto adjacente', 'hipotenusa')}= ${fraction(ca, h)} ≅ ${cos.toFixed(2)}
    </div>
    <div class="formula-row">
      <span class="tangente">tg</span> <span class="angle">${angle}° </span> = ${fraction('cateto oposto', 'cateto adjacente')}= ${fraction(co, ca)} ≅ ${tan.toFixed(2)}
    </div>
    <div class="formula-row">
      <span class="tangente">tg</span> <span class="angle">${angle}° </span> = ${fraction(sen_angle, cos_angle)}= ${fraction(sin.toFixed(2), cos.toFixed(2))} ≅ ${tan.toFixed(2)}
    </div>
  `;
}

function render() {
  const origin = renderer.origin;
  const data = calculateTriangle(
    origin,
    mouse,
    renderer.pxPerCm,
    angleLocked ? lockedAngleDeg : null,
    hypotenuseLocked ? lockedHypotenuseCm : null
  );
  lastData = data;
  renderer.draw(origin, data, angleLocked, hypotenuseLocked);
  updateUI(data);
}

// Recalcula a posição (px) do vértice B ao redimensionar, preservando o
// ângulo e a hipotenusa (cm) já configurados pelo usuário.
function handleResize() {
  if (!lastData) return;
  const origin = renderer.origin;
  const angleRad = (lastData.angleDeg * Math.PI) / 180;
  mouse = {
    x: origin.x + lastData.hypotenuseCm * renderer.pxPerCm * Math.cos(angleRad),
    y: origin.y - lastData.hypotenuseCm * renderer.pxPerCm * Math.sin(angleRad)
  };
  render();
}

function getCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function toggleAngleLock() {
  if (angleLocked) {
    angleLocked = false;
    lockedAngleDeg = null;
  } else {
    angleLocked = true;
    lockedAngleDeg = lastData.angleDeg;
  }
  render();
}

function toggleHypotenuseLock() {
  if (hypotenuseLocked) {
    hypotenuseLocked = false;
    lockedHypotenuseCm = null;
  } else {
    hypotenuseLocked = true;
    lockedHypotenuseCm = lastData.hypotenuseCm;
  }
  render();
}

function tryStartDrag(point) {
  // Permite arrastar se clicar/tocar próximo ao ponto
  const dist = Math.hypot(point.x - lastData.target.x, point.y - lastData.target.y);
  if (dist < 25) {
    isDragging = true;
    canvas.style.cursor = 'grabbing';
  }
}

function stopDrag() {
  isDragging = false;
  canvas.style.cursor = 'default';
}

function handlePointerDown(point) {
  if (renderer.isNearAngleLabel(point)) {
    toggleAngleLock();
    return true;
  }
  if (renderer.isNearHypotenuseLabel(point)) {
    toggleHypotenuseLock();
    return true;
  }
  tryStartDrag(point);
  return isDragging;
}

// Eventos de Mouse
canvas.addEventListener('mousedown', (e) => {
  handlePointerDown(getCanvasPoint(e.clientX, e.clientY));
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  mouse = getCanvasPoint(e.clientX, e.clientY);
  render();
});

window.addEventListener('mouseup', stopDrag);

// Eventos de Touch
canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const handled = handlePointerDown(getCanvasPoint(touch.clientX, touch.clientY));
  if (handled) e.preventDefault();
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const touch = e.touches[0];
  mouse = getCanvasPoint(touch.clientX, touch.clientY);
  render();
}, { passive: false });

window.addEventListener('touchend', stopDrag);
window.addEventListener('touchcancel', stopDrag);

render();