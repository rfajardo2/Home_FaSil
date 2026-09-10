import { CATEGORY_ICONS, PinIcon } from '@/components/icons';
import type { CategoryRow } from '@/lib/database-types';

/** Resolves a DB category row to its icon component + a soft (light, ~13% alpha) background of its color. */
export function categoryStyle(category: Pick<CategoryRow, 'icon' | 'color'>) {
  const Icon = (CATEGORY_ICONS as Record<string, typeof PinIcon>)[category.icon] ?? PinIcon;
  return { Icon, color: category.color, soft: `${category.color}22` };
}
