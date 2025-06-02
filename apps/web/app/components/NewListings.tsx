const listings = [
  {
    title: "Тавилга угсрах",
    description: "Ширээ, шүүгээ угсрах үйлчилгээ. 30,000 MNT",
    location: "Баянгол дүүрэг",
    image: "/listing-1.jpg",
  },
  {
    title: "Гэр цэвэрлэх",
    description: "Бүрэн цэвэрлэгээ. 50,000 MNT",
    location: "Сүхбаатар дүүрэг",
    image: "/listing-2.jpg",
  },
  {
    title: "Нохой салхилуулах",
    description: "Өдөр бүр салхилуулна. 20,000 MNT",
    location: "Чингэлтэй дүүрэг",
    image: "/listing-3.jpg",
  },
  {
    title: "Англи хэлний давтлага",
    description: "7 хоногт 3 удаа хичээллэнэ. 40,000 MNT",
    location: "Баянзүрх дүүрэг",
    image: "/listing-4.jpg",
  },
];

export default function NewListings() {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-12">
      <h2 className="text-2xl font-semibold mb-4">Шинэ зарууд</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {listings.map((listing, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-36 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">{listing.title}</h3>
              <p className="text-sm text-gray-600">{listing.description}</p>
              <p className="text-xs text-gray-400 mt-1">{listing.location}</p>
              <button className="mt-3 w-full bg-blue-600 text-white text-sm py-1.5 rounded">
                Дэлгэрэнгүй
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right mt-4">
        <a href="#" className="text-blue-600 text-sm hover:underline">
          Цааш →
        </a>
      </div>
    </section>
  );
}
