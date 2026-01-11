"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-blue-50 p-6 md:p-8 flex flex-col items-center justify-between rounded-lg mt-6 md:my-8 mx-2 md:mx-4">
      <div className="md:flex flex-row w-full items-center gap-4 justify-center">
        <div className="md:w-1/2 space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            D›DøD«D' ¥,¥Ÿ¥?D¯DøD¬D ¥.¥?¥?¥?D3¥,¥?D1 DñDøD1D«Dø ¥Ÿ¥Ÿ?
          </h1>
          <p className="text-base md:text-lg text-gray-700">
            DzD1¥? DñDøD1D3DøDø O_D1D¯¥ØD,D¯D3¥?¥?D3 D_D¯D ¥?¥?Dý¥?D¯ OcOc¥?D,D1D« O_D1D¯¥ØD,D¯D3¥?¥?D3 ¥?DøD«DøD¯ DñD_D¯D3D_D_¥?D_D1.
          </p>
        </div>
        <Image
          src="/hero.png"
          alt="hero"
          width={360}
          height={320}
          className="w-80 md:w-80 lg:w-100 h-auto mt-4 md:mt-0"
        />
      </div>
    </section>
  );
}
