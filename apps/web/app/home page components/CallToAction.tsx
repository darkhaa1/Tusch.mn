import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="bg-blue-50 text-center py-12 mt-16 mx-4 rounded-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
        Танд чөлөөт цаг эсвэл авъяас байна уу?
      </h2>
      <Link
        href="/ajil-nemeh"
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
      >
        Зар нэмэх
      </Link>
    </section>
  );
}
