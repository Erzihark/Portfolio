import { t } from '@/i18n';

// Planet ids stay the same as the 3D model ids.
// The label is the word a visitor sees, in the active language.
export function planetLabel(id) {
  return id ? t(`planets.${id}`) : '';
}
