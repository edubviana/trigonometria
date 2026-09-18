// Limites e granularidade de manipulação da hipotenusa.
export const MIN_HYPOTENUSE_CM = 4;
export const MAX_HYPOTENUSE_CM = 10;
export const HYPOTENUSE_STEP_CM = 0.1;

// Limites e granularidade de manipulação do ângulo.
export const MIN_ANGLE_DEG = 20;
export const MAX_ANGLE_DEG = 85;
export const ANGLE_STEP_DEG = 1;

// Proporções da origem e do comprimento máximo da hipotenusa em relação
// às dimensões atuais do canvas (spec docs/spec.md §7). A posição
// horizontal da origem é calculada dinamicamente para centralizar a base.
export const ORIGIN_Y_RATIO = 0.82;
export const HYPOTENUSE_WIDTH_RATIO = 0.70;
export const HYPOTENUSE_HEIGHT_RATIO = 0.60;
