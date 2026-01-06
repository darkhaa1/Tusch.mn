"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../hooks/useApi";

export default function Hero() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  const role = (currentUser?.role || "CLIENT") as "CLIENT" | "PROVIDER" | "BOTH";
  const showBothCtas = role === "BOTH";
  const primaryCta =
    role === "PROVIDER"
      ? { label: "Зарууд үзэх", href: "/listings" }
      : { label: "Зар нэмэх", href: "/listings?create=1" };
  const secondaryCta = showBothCtas ? { label: "Зар нэмэх", href: "/listings?create=1" } : null;

  const handleCtaClick = (href: string) => router.push(href);

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
          className="w-80 md:w-80 lg:w-100 h-auto mt-4 md:mt-0"
        />
      </div>

      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => handleCtaClick(primaryCta.href)}
          className="w-full rounded-lg bg-blue-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto"
        >
          {primaryCta.label}
        </button>
        {secondaryCta ? (
          <button
            type="button"
            onClick={() => handleCtaClick(secondaryCta.href)}
            className="w-full rounded-lg border border-blue-700 bg-white px-5 py-3 text-base font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto"
          >
            {secondaryCta.label}
          </button>
        ) : null}
      </div>
    </section>
  );
}
