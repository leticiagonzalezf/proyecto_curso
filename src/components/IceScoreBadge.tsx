import { Chip } from '@mui/material';

import { getIcePriority } from '../utils/getIcePriority';

import type { IcePriority } from '../types/IcePriority';
import type { ChipProps } from '@mui/material';

const PRIORITY_COLORS: Record<IcePriority, ChipProps['color']> = {
  high: 'success',
  low: 'default',
  medium: 'warning',
};

interface IceScoreBadgeProps {
  score: number | null;
  muted?: boolean;
}

// formatIceScore muestra la puntuacion ICE con una precision estable, o un guion si aun no existe.
function formatIceScore(score: number | null): string {
  return score === null ? 'ICE —' : `ICE ${score.toFixed(1)}`;
}

// getBadgeColor devuelve el color de la prioridad, o gris si la tarea esta completada o no hay puntuacion.
function getBadgeColor(
  score: number | null,
  muted: boolean,
): ChipProps['color'] {
  if (score === null || muted) {
    return 'default';
  }

  return PRIORITY_COLORS[getIcePriority(score)];
}

// IceScoreBadge muestra la puntuacion ICE calculada con el color de su prioridad.
function IceScoreBadge({ score, muted = false }: IceScoreBadgeProps) {
  return (
    <Chip
      color={getBadgeColor(score, muted)}
      label={formatIceScore(score)}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}

export default IceScoreBadge;
