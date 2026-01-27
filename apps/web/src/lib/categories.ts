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

export type CategoryOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "network_repair", label: "Шугам сүлжээ засвар угсралт", icon: Wrench },
  { value: "construction_renovation", label: "Барилга / Дотор засал", icon: Home },
  { value: "moving", label: "Нүүлгэлт", icon: Truck },
  { value: "home_cleaning", label: "Гэр цэвэрлэгээ", icon: SprayCan },
  { value: "carpentry", label: "Мужаан, тавилга угсралт", icon: Hammer },
  { value: "auto_repair", label: "Авто засвар", icon: Car },
  { value: "babysitting", label: "Хүүхэд асрагч", icon: Baby },
  { value: "tutoring", label: "Гэрийн багш", icon: BookOpen },
];

export const CATEGORY_LABEL_MAP = new Map(CATEGORY_OPTIONS.map((category) => [category.value, category.label]));
