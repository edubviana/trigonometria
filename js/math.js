import {
  MIN_ANGLE_DEG,
  MAX_ANGLE_DEG,
  ANGLE_STEP_DEG,
  MIN_HYPOTENUSE_CM,
  MAX_HYPOTENUSE_CM,
  HYPOTENUSE_STEP_CM
} from './config.js';

export function calculateTriangle(origin, mouse, pxPerCm, lockedAngleDeg = null, lockedHypotenuseCm = null) {
  const dx = mouse.x - origin.x;
  const dy = origin.y - mouse.y; // Inverte eixo Y do Canvas

  let angleDeg;
  if (lockedAngleDeg !== null) {
    // Ângulo travado pelo usuário: apenas a hipotenusa reage ao arrasto.
    angleDeg = lockedAngleDeg;
  } else {
    // Ângulo relativo ao eixo horizontal, ajustado para múltiplos de 5° e
    // limitado ao 1º quadrante (entre 5° e 85°).
    angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
    angleDeg = Math.round(angleDeg / ANGLE_STEP_DEG) * ANGLE_STEP_DEG;
    angleDeg = Math.max(MIN_ANGLE_DEG, Math.min(MAX_ANGLE_DEG, angleDeg));
  }
  const angleRad = angleDeg * (Math.PI / 180);

  let hypotenuseCm;
  if (lockedHypotenuseCm !== null) {
    // Hipotenusa travada pelo usuário: apenas o ângulo reage ao arrasto.
    hypotenuseCm = lockedHypotenuseCm;
  } else {
    // Comprimento da hipotenusa ajustado para saltos de 0,5 cm,
    // limitado entre 1 e 10 cm.
    const rawHypotenuseCm = Math.sqrt(dx * dx + dy * dy) / pxPerCm;
    hypotenuseCm = Math.round(rawHypotenuseCm / HYPOTENUSE_STEP_CM) * HYPOTENUSE_STEP_CM;
    hypotenuseCm = Math.max(MIN_HYPOTENUSE_CM, Math.min(MAX_HYPOTENUSE_CM, hypotenuseCm));
  }
  const hypotenuse = hypotenuseCm * pxPerCm;

  const ca = hypotenuse * Math.cos(angleRad);
  const co = hypotenuse * Math.sin(angleRad);

  return {
    angleRad,
    angleDeg,
    hypotenuse,
    hypotenuseCm,
    ca,
    co,
    target: {
      x: origin.x + ca,
      y: origin.y - co
    },
    corner: {
      x: origin.x + ca,
      y: origin.y
    }
  };
}