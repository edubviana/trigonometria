import { calculateTriangle } from './math.js';
import { Renderer } from './renderer.js';
import { PX_PER_CM } from './config.js';

const canvas = document.getElementById('trigCanvas');
const formulas = document.getElementById('formulas');
const renderer = new Renderer(canvas);

const origin = renderer.origin;
let mouse = { x: origin.x + 177, y: origin.y - 177 }; // ~45°, 5 cm de hipotenusa
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
  const sin = Math.sin(data.angleRad);
  const cos = Math.cos(data.angleRad);
  const angle = data.angleDeg;
  const h = data.hypotenuseCm.toFixed(1);
  const ca = (data.ca / PX_PER_CM).toFixed(1);
  const co = (data.co / PX_PER_CM).toFixed(1);
  const cos_angle = `cos ${angle}°`;
  const sen_angle = `sen ${angle}°`;

  formulas.innerHTML = `
    <div class="formula-row">
      <span class="opposite">sen</span> <span class="angle">${angle}°</span> = ${fraction('cateto oposto', 'hipotenusa')} = ${fraction(co, h)} = ${sin.toFixed(1)}
    </div>
    <div class="formula-row">
      <span class="adjacent">cos</span> <span class="angle">${angle}° </span> = ${fraction('cateto adjacente', 'hipotenusa')}= ${fraction(ca, h)} = ${cos.toFixed(1)}
    </div>
    <div class="formula-row">
      <span class="tangente">tg</span> <span class="angle">${angle}° </span> = ${fraction('cateto oposto', 'cateto adjacente')}= ${fraction(co, ca)} = ${(co / ca).toFixed(1)}
    </div>
    <div class="formula-row">
      <span class="tangente">tg</span> <span class="angle">${angle}° </span> = ${fraction(sen_angle, cos_angle)}= ${fraction(sin.toFixed(1), cos.toFixed(1))} = ${(co / ca).toFixed(1)}
    </div>
  `;
}

function render() {
  const data = calculateTriangle(
    origin,
    mouse,
    angleLocked ? lockedAngleDeg : null,
    hypotenuseLocked ? lockedHypotenuseCm : null
  );
  lastData = data;
  renderer.draw(origin, data, angleLocked, hypotenuseLocked);
  updateUI(data);
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