/**
 * Atelier Home page.
 * Composition (mobile flow ≈ atelier.jsx 215-311; desktop flow ≈ atelier-desktop.jsx 162-332):
 *   Hero → khee divider (desktop) → CategoryGrid → FeaturedDistrict + NearbyProviders
 *   (stacked mobile / 2-col desktop) → CallToAction tri-color strip.
 *
 * Server component. Children are individually server-rendered; interactive bits
 * (search form, etc.) are progressive-enhancement, not client components.
 */
import { KheeBorder } from '@web/components/ui-v2';
import CallToAction from '@web/features/home/components/CallToAction';
import CategoryGrid from '@web/features/home/components/CategoryGrid';
import FeaturedDistrict from '@web/features/home/components/FeaturedDistrict';
import Hero from '@web/features/home/components/Hero';
import NearbyProviders from '@web/features/home/components/NearbyProviders';

export default function Home() {
  return (
    <>
      <Hero />

      {/* Khee divider — desktop only */}
      <div className="hidden md:block px-14">
        <KheeBorder color="var(--at-terre)" height={14} />
      </div>

      <CategoryGrid />

      {/* Mobile: stacked. Desktop: 2-col editorial + nearby. */}
      <div className="md:hidden">
        <FeaturedDistrict />
        <NearbyProviders />
      </div>
      <section className="hidden md:grid md:grid-cols-2 gap-14 px-14 pt-10 pb-15">
        <FeaturedDistrict />
        <NearbyProviders />
      </section>

      <CallToAction />
    </>
  );
}
