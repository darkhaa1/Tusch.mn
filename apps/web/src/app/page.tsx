"use client";

import CallToAction from "@web/features/home/components/CallToAction";
import CategoryGrid from "@web/features/home/components/CategoryGrid";
import Hero from "@web/features/home/components/Hero";
import NewListings from "@web/features/listings/NewListings";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <NewListings />
      <CallToAction />
    </main>
  );
}
