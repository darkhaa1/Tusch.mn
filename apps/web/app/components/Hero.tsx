export default function Hero() {
  return (
    <section className="bg-blue-50 p-6 md:p-8 flex flex-col  items-center justify-between rounded-lg mt-6 md:my-8 mx-2 md:mx-4">
        <div className="md:flex flex-row justity-between">
          <div className="sm:w-1/2" >
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Танд тусламж хэрэгтэй байна уу?
            </h1>
            <p className="text-base md:text-lg text-gray-700">Ойр байгаа үйлчилгээг олж эсвэл өөрийн үйлчилгээг санал болгоорой.</p>
          </div>
          <img src="/hero.png" alt="hero" className="w-60 md:w-90 h-auto mt-2 md:mt-0" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:w-2/3">
          <select className="border p-2 rounded w-full sm:w-full">
            <option>Үйлчилгээний төрөл</option>
          </select>
          <select className="border p-2 rounded w-full sm:w-full">
            <option>Байршил</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-full hover:bg-blue-700">Хайх</button>
        </div>
    </section>
  );
}