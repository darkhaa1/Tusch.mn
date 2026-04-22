import {
  Wrench,
  Home,
  Truck,
  SprayCan,
  Hammer,
  Car,
  Baby,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { CATEGORIES, type CategorySlug } from "@repo/shared";

export { CATEGORY_LABEL_MAP, type CategorySlug } from "@repo/shared";

export type CategoryOption = {
  value: CategorySlug;
  label: string;
  icon: LucideIcon;
};

const ICON_MAP: Record<CategorySlug, LucideIcon> = {
  network_repair: Wrench,
  construction_renovation: Home,
  moving: Truck,
  home_cleaning: SprayCan,
  carpentry: Hammer,
  auto_repair: Car,
  babysitting: Baby,
  tutoring: BookOpen,
};

export const CATEGORY_OPTIONS: CategoryOption[] = CATEGORIES.map((c) => ({
  value: c.slug,
  label: c.label,
  icon: ICON_MAP[c.slug],
}));
