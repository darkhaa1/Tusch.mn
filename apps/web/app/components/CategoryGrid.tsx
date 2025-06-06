import {
  Wrench,
  Truck,
  SprayCan,
  Dog,
  Hammer,
  Car,
  Baby,
  BookOpen
} from "lucide-react";

const categories = [
  { icon: Wrench, label: "Шугам сүлжээ засвар угсралт" },
  { icon: Truck, label: "Нүүлгэлт" },
  { icon: SprayCan, label: "Гэр цэвэрлэгээ" },
  { icon: Dog, label: "Нохой салхилуулах" },
  { icon: Hammer, label: "Мужаан, тавилга угсралт" },
  { icon: Car, label: "Авто засвар" },
  { icon: Baby, label: "Хүүхэд асрагч" },
  { icon: BookOpen, label: "Гэрийн багш" },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      <h2 className="text-2xl font-semibold mb-6">Үйлчилгээний төрлүүд</h2>
      <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(({ icon: Icon, label }, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center border rounded-lg p-3 text-center hover:shadow-lg transition hover:bg-gray-100"
          >
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" />
            <p className="text-xs sm:text-sm font-medium leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
