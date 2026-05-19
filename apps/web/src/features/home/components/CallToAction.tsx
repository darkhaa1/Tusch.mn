import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="bg-accent text-center py-12 mt-16 mx-4 rounded-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
        Танд чөлөөт цаг эсвэл авъяас байна уу?
      </h2>
      <Link
        href="/ajil-nemeh"
        className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-medium hover:bg-primary/90 transition"
      >
        Зар нэмэх
      </Link>
    </section>
  );
}
