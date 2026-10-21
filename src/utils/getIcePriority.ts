import type { IcePriority } from '../types/IcePriority';

export const HIGH_PRIORITY_MIN_ICE = 10;
export const MEDIUM_PRIORITY_MIN_ICE = 5;

// getIcePriority devuelve la prioridad de una puntuacion ICE segun los umbrales de alta y media.
export function getIcePriority(score: number): IcePriority {
  if (score >= HIGH_PRIORITY_MIN_ICE) {
    return 'high';
  }

  if (score >= MEDIUM_PRIORITY_MIN_ICE) {
    return 'medium';
  }

  return 'low';
}
