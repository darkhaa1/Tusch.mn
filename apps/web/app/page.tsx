"use client";

import Hero from "./home page components/Hero";
import CategoryGrid from "./home page components/CategoryGrid";
import NewListings from "./listings/NewListings";
import CallToAction from "./home page components/CallToAction";

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
