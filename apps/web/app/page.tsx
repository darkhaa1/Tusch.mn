"use client";

import Hero from "./components/Hero";
import CategoryGrid from "./components/CategoryGrid";
import NewListings from "./components/NewListings";
import CallToAction from "./components/CallToAction";

export default function Home() {

  return (
  <main>
    <Hero/>
    <CategoryGrid/>
    <NewListings/>
    <CallToAction/>
  </main> 
  );
}
