import Link from "next/link";
import { CATEGORY_OPTIONS } from "../lib/categories";

export default function CategoryGrid() {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      <h2 className="text-2xl font-semibold mb-6">Үйлчилгээний төрөлүүд</h2>
      <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {CATEGORY_OPTIONS.map(({ icon: Icon, label, value }) => (
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
