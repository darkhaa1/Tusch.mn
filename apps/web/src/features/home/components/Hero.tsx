import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-blue-50 p-6 md:p-8 flex flex-col items-center justify-between rounded-lg mt-6 md:my-8 mx-2 md:mx-4">
      <div className="md:flex flex-row w-full items-center gap-4 justify-center">
        <div className="md:w-1/2 space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            Танд тусламж хэрэгтэй байна уу?
          </h1>
          <p className="text-base md:text-lg text-gray-700">
            Ойр байгаа үйлчилгээг олж эсвэл өөрийн үйлчилгээг санал болгоорой.
          </p>
        </div>
        <Image
          src="/hero.png"
          alt="hero"
          width={360}
          height={320}
          priority
          className="w-80 md:w-80 lg:w-100 h-auto mt-4 md:mt-0"
        />
      </div>
    </section>
  );
}
