import { CATEGORY_ICONS } from '@/components/icons';
import { IconCircle } from '@/components/ui/IconCircle';
import { CATEGORIES, type CategoryId } from '@/constants/theme';

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

type CategoryIconProps = {
  categoryId: CategoryId;
  size?: number;
};

/** The colored circle + line icon used for a task/expense category everywhere in the app. */
export function CategoryIcon({ categoryId, size = 40 }: CategoryIconProps) {
  const category = getCategory(categoryId);
  const Icon = CATEGORY_ICONS[category.icon];
  return (
    <IconCircle size={size} background={category.soft}>
      <Icon size={size * 0.475} color={category.color} />
    </IconCircle>
  );
}
