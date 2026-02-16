export const CATEGORIES = [
  { slug: "network_repair", label: "Шугам сүлжээ засвар угсралт" },
  { slug: "construction_renovation", label: "Барилга / Дотор засал" },
  { slug: "moving", label: "Нүүлгэлт" },
  { slug: "home_cleaning", label: "Гэр цэвэрлэгээ" },
  { slug: "carpentry", label: "Мужаан, тавилга угсралт" },
  { slug: "auto_repair", label: "Авто засвар" },
  { slug: "babysitting", label: "Хүүхэд асрагч" },
  { slug: "tutoring", label: "Гэрийн багш" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CATEGORY_SLUGS: CategorySlug[] = CATEGORIES.map((c) => c.slug);

export const CATEGORY_LABEL_MAP = new Map<string, string>(
  CATEGORIES.map((c) => [c.slug, c.label]),
);
