export type MnLocation = {
  city: string;
  districts: string[];
};

export const MN_LOCATIONS: MnLocation[] = [
  {
    city: "Улаанбаатар",
    districts: [
      "Баянгол",
      "Баянзүрх",
      "Сонгинохайрхан",
      "Сүхбаатар",
      "Хан-Уул",
      "Чингэлтэй",
      "Налайх",
      "Багануур",
      "Багахангай",
    ],
  },
  {
    city: "Дархан",
    districts: [],
  },
  {
    city: "Эрдэнэт",
    districts: [],
  },
  {
    city: "Чойбалсан",
    districts: [],
  },
  {
    city: "Ховд",
    districts: [],
  },
];

/** Set of valid city names for fast lookup */
export const MN_CITY_SET: Set<string> = new Set(
  MN_LOCATIONS.map((l) => l.city),
);

/** Map of city → set of valid district names */
export const MN_DISTRICT_MAP: Map<string, Set<string>> = new Map(
  MN_LOCATIONS.map((l) => [l.city, new Set(l.districts)]),
);
