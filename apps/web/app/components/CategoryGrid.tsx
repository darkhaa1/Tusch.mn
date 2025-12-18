import {
  Wrench,
  Truck,
  SprayCan,
  Home,
  Hammer,
  Car,
  Baby,
  BookOpen
} from "lucide-react";
import Link from "next/link";

const categories = [
  { value: "network_repair", icon: Wrench, label: "Шугам сүлжээ засвар угсралт" },
  { value: "construction_renovation", icon: Home, label: "Барилга / Дотор засал" },
  { value: "moving", icon: Truck, label: "Нүүлгэлт" },
  { value: "home_cleaning", icon: SprayCan, label: "Гэр цэвэрлэгээ" },
  { value: "carpentry", icon: Hammer, label: "Мужаан, тавилга угсралт" },
  { value: "auto_repair", icon: Car, label: "Авто засвар" },
  { value: "babysitting", icon: Baby, label: "Хүүхэд асрагч" },
  { value: "tutoring", icon: BookOpen, label: "Гэрийн багш" },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      <h2 className="text-2xl font-semibold mb-6">Үйлчилгээний төрөлүүд</h2>
      <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(({ icon: Icon, label, value }) => (
          <Link
            key={value}
            href={`/listings?category=${value}`}
            className="flex flex-col items-center justify-center border rounded-lg p-3 text-center hover:shadow-lg transition hover:bg-gray-100"
          >
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" />
            <p className="text-xs sm:text-sm font-medium leading-tight">{label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
