export const categoryLabelMap: Record<string, string> = {
  network_repair: "Шугам сүлжээ засвар угсралт",
  construction_renovation: "Барилга / Дотор засал",
  moving: "Нүүлгэлт",
  home_cleaning: "Гэр цэвэрлэгээ",
  dog_walking: "Нохой салхилуулах",
  carpentry: "Тавилга угсрах, мужаан",
  auto_repair: "Авто засвар",
  babysitting: "Хүүхэд асрагч",
  tutoring: "Гэрийн багш",
};

export const resolveCategoryLabel = (value?: string | null) => {
  if (!value) return "";
  return categoryLabelMap[value] || value;
};
