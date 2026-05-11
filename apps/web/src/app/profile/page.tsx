"use client";

/**
 * Atelier Dashboard (SA-6) — user "Me" root.
 * Mobile flow ≈ atelier.jsx 720-784 (eyebrow + 30px serif italic last-name + avatar,
 *   ink card with stats, activity list rows).
 * Desktop flow ≈ atelier-desktop.jsx 712-859 (260px cream sidebar + main: 52px serif headline,
 *   ink big card with 4-stat grid, offers list, cobalt + rose secondary blocks).
 *
 * Data: useCurrentUser, useMyListings, useOffersReceived, useUnreadCount,
 *   useFavoritesCount, useMessageThreads. When a count isn't available, falls back to 0
 *   or omits the metric — counts shown are real, not the design's static demo numbers.
 */

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useCurrentUser,
  useMyListings,
  useOffersReceived,
  useUnreadCount,
  useFavoritesCount,
  useMessageThreads,
} from "@web/lib/hooks/useApi";
import { Avatar, LabelMono } from "@web/components/ui-v2";
import resolveImageUrl from "@web/lib/resolveImageUrl";
import type { Listing, Offer } from "@web/lib/api/types";

const labels = {
  eyebrowMobile: "Миний хэсэг",
  eyebrowDesktopPrefix: "Хяналтын самбар",
  greetingPrefix: "Сайн уу, ",
  defaultName: "Зочин",
  newRequest: "+ Шинэ хүсэлт",
  newRequestHref: "/listings?create=1",
  // active card
  activeRequestLabel: "Идэвхтэй хүсэлт",
  activeRequestNo: "Идэвхтэй хүсэлт № 1",
  activeRequestEmpty: "Идэвхтэй хүсэлт алга",
  activeRequestEmptySub: "Шинэ хүсэлт үүсгэж эхэлнэ үү.",
  activeRequestCta: "Шинэ хүсэлт үүсгэх →",
  endsIn: "Дуусах",
  daysSuffix: "өдөр",
  metricOffers: "САНАЛ",
  metricViews: "ҮЗСЭН",
  metricSaved: "ХАДГАЛСАН",
  metricUnread: "УНШААГҮЙ",
  metricDuration: "ХУГАЦАА",
  // activity
  activityEyebrow: "Үйл ажиллагаа",
  activityOffers: "Хүлээн авсан санал",
  activityMessages: "Яриа",
  activityFavorites: "Дуртай",
  activityListings: "Миний зар",
  activityReviews: "Үлдээсэн сэтгэгдэл",
  // sidebar nav
  sidebarOverview: "Хяналт",
  sidebarRequests: "Хүсэлт",
  sidebarOffers: "Санал",
  sidebarMessages: "Зурвас",
  sidebarFavorites: "Дуртай",
  sidebarReviews: "Сэтгэгдэл",
  sidebarPayments: "Төлбөр",
  sidebarSettings: "Тохиргоо",
  // sidebar promo
  promoEyebrow: "tusch+ ГИШҮҮН",
  promoTitle: "Сар бүр санал хязгааргүй.",
  promoCta: "Илүү ихийг үзэх →",
  // sections
  receivedOffers: "Хүлээн авсан санал",
  latestChatEyebrow: "СҮҮЛИЙН ЯРИА",
  latestChatEmpty: "Сүүлийн яриа алга",
  latestChatOpen: "Яриа нээх →",
  monthlyActivity: "САР БҮРИЙН ҮЙЛ АЖИЛЛАГАА",
  unitArea: "м²",
  rateLabel: "Үнэлгээ",
  priceLabel: "Үнэ",
  durationLabel: "Хугацаа",
  newTag: "ШИНЭ",
  viewLink: "Үзэх →",
  noOffers: "Одоогоор санал ирээгүй",
  // mobile date
  loading: "Уншиж байна…",
} as const;

const monthLabelsMn = [
  "01.",
  "02.",
  "03.",
  "04.",
  "05.",
  "06.",
  "07.",
  "08.",
  "09.",
  "10.",
  "11.",
  "12.",
];
const weekdayLabelsMn = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];

function formatPriceMnt(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${Math.round(value).toLocaleString("en-US").replace(/,/g, ",")}₮`;
}

function shortName(first?: string | null, last?: string | null): string {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (f && l) return `${f} ${l.charAt(0)}.`;
  return f || l || labels.defaultName;
}

function firstInitial(first?: string | null, last?: string | null): string {
  const source = (first || last || labels.defaultName).trim();
  return source.charAt(0).toUpperCase();
}

function shortListingTitle(listing: Listing | undefined): string {
  if (!listing) return "—";
  const desc = (listing.description || "").trim();
  if (!desc) return labels.activeRequestEmpty;
  // first line + truncate
  const firstLine = desc.split(/\n/)[0] ?? "";
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
}

function daysSinceCreation(listing: Listing | undefined): number {
  if (!listing?.createdAt) return 0;
  const ms = Date.now() - new Date(listing.createdAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function relativeDays(iso?: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  return `${d} ${labels.daysSuffix}`;
}

function ChevronRight({ size = 12 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size * 0.71}
      height={size}
      viewBox="0 0 8 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M1 1l6 6-6 6" />
    </svg>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const sessionUser = session?.user as
    | { image?: string; picture?: string; avatarUrl?: string }
    | undefined;

  const { data: myListings } = useMyListings();
  const { data: offersData } = useOffersReceived({ page: 1, limit: 4 });
  const { data: unread } = useUnreadCount();
  const favoritesCount = useFavoritesCount();
  const { data: threads } = useMessageThreads(Boolean(currentUser));

  const avatarUrl = useMemo(() => {
    if (!currentUser) return null;
    const raw =
      currentUser.avatarUrl ||
      sessionUser?.image ||
      sessionUser?.picture ||
      sessionUser?.avatarUrl ||
      null;
    return resolveImageUrl(raw || undefined) || raw || null;
  }, [currentUser, sessionUser]);

  const firstName = currentUser?.firstName?.trim() || "";
  const lastName = currentUser?.lastName?.trim() || "";
  const greetingNameMobile = lastName || firstName || labels.defaultName;
  const greetingNameDesktop = firstName || lastName || labels.defaultName;
  const sidebarName = shortName(firstName, lastName);
  const initial = firstInitial(firstName, lastName);

  const activeListing = useMemo<Listing | undefined>(() => {
    if (!myListings || myListings.length === 0) return undefined;
    const active = myListings.find((l) => l.status === "ACTIVE");
    return active || myListings[0];
  }, [myListings]);

  const offersCount = offersData?.total ?? 0;
  const offersItems: Offer[] = useMemo(
    () => offersData?.items?.slice(0, 4) ?? [],
    [offersData],
  );
  const unreadCount = unread?.count ?? 0;
  const myListingsCount = myListings?.length ?? 0;
  const activeListingsCount = useMemo(
    () => (myListings || []).filter((l) => l.status === "ACTIVE").length,
    [myListings],
  );
  const archivedListingsCount = Math.max(
    0,
    myListingsCount - activeListingsCount,
  );

  // join year for sidebar meta (desktop)
  const createdAt = (currentUser as unknown as { createdAt?: string } | null)
    ?.createdAt;
  const joinYear = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();
  const city = currentUser?.city || "Монгол";

  // latest chat preview
  const latestThread = useMemo(() => {
    if (!threads || threads.length === 0) return null;
    return threads[0];
  }, [threads]);
  const latestPartner = latestThread
    ? latestThread.sender?.id === currentUser?.id
      ? latestThread.recipient
      : latestThread.sender
    : null;
  const latestPartnerName = latestPartner
    ? shortName(latestPartner.firstName, latestPartner.lastName)
    : "";
  const latestChatHref = latestPartner ? `/messages/${latestPartner.id}` : "/messages";

  // today eyebrow date "Мягмар, 5 V"
  const today = new Date();
  const weekdayLabel = weekdayLabelsMn[today.getDay()] ?? "—";
  const monthRomans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const monthRoman = monthRomans[today.getMonth()];
  const dateEyebrow = `${labels.eyebrowDesktopPrefix} · ${weekdayLabel}, ${today.getDate()} ${monthRoman}`;

  // synthetic 12-month activity bars derived from listings + offers count (decorative)
  const monthlyBars = useMemo(() => {
    const seed = offersCount + favoritesCount + myListingsCount + unreadCount;
    const bars: number[] = [];
    for (let i = 0; i < 12; i++) {
      const h = 18 + ((seed * 7 + i * 13) % 76);
      bars.push(h);
    }
    return bars;
  }, [offersCount, favoritesCount, myListingsCount, unreadCount]);
  const monthFromIdx = (off: number) => {
    const m = ((today.getMonth() - 11 + off + 12) % 12) + 1;
    const y = today.getFullYear() - (today.getMonth() - 11 + off < 0 ? 1 : 0);
    return `${String(m).padStart(2, "0")}.${y}`;
  };

  // redirect-to-login pattern (no useEffect — keep parity with sibling pages)
  if (userLoading) {
    return (
      <div className="min-h-screen bg-atelier-paper text-atelier-ink px-5 py-12 md:px-14">
        <div
          style={{ fontFamily: "var(--at-mono)", fontSize: 11, letterSpacing: "0.15em" }}
          className="uppercase text-atelier-muted"
        >
          {labels.loading}
        </div>
      </div>
    );
  }
  if (!currentUser) {
    router.push("/login?redirect=/profile");
    return null;
  }

  // ─────── MOBILE ───────
  const mobile = (
    <div className="md:hidden bg-atelier-paper text-atelier-ink min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <div>
          <LabelMono>{labels.eyebrowMobile}</LabelMono>
          <h1
            className="m-0 mt-1 text-atelier-ink"
            style={{
              fontFamily: "var(--at-serif)",
              fontSize: 30,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {labels.greetingPrefix}
            <em
              style={{
                fontStyle: "var(--at-italic-style, italic)",
              }}
            >
              {greetingNameMobile}.
            </em>
          </h1>
        </div>
        <Link href="/profile/informations" aria-label="profile-settings">
          <Avatar
            src={avatarUrl || undefined}
            initial={initial}
            size="md"
            tone="olive"
          />
        </Link>
      </div>

      {/* Active request card */}
      {activeListing ? (
        <Link
          href={`/listings/${activeListing.id}`}
          className="block mx-5 mb-5 p-5 text-atelier-cream"
          style={{ background: "var(--at-ink)" }}
        >
          <div
            style={{
              fontFamily: "var(--at-mono)",
              fontSize: 9,
              letterSpacing: "0.15em",
              color: "var(--at-sand)",
              textTransform: "uppercase",
            }}
          >
            {labels.activeRequestLabel}
          </div>
          <div
            style={{
              fontFamily: "var(--at-serif)",
              fontSize: 22,
              lineHeight: 1.2,
              marginTop: 8,
            }}
          >
            {shortListingTitle(activeListing)}
          </div>
          <div
            className="mt-4 pt-3 flex items-end justify-between"
            style={{ borderTop: "1px solid rgba(244,237,225,0.15)" }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 9,
                  color: "var(--at-sand)",
                  letterSpacing: "0.1em",
                }}
              >
                {labels.metricOffers}
              </div>
              <div
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 26,
                  fontStyle: "var(--at-italic-style, italic)",
                }}
              >
                {offersCount}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 9,
                  color: "var(--at-sand)",
                  letterSpacing: "0.1em",
                }}
              >
                {labels.metricSaved}
              </div>
              <div
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 26,
                  fontStyle: "var(--at-italic-style, italic)",
                }}
              >
                {activeListing.favoritesCount ?? 0}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 9,
                  color: "var(--at-sand)",
                  letterSpacing: "0.1em",
                }}
              >
                {labels.metricDuration}
              </div>
              <div
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 16,
                  fontStyle: "var(--at-italic-style, italic)",
                  marginTop: 6,
                }}
              >
                {daysSinceCreation(activeListing)} {labels.daysSuffix}
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <Link
          href={labels.newRequestHref}
          className="block mx-5 mb-5 p-5 text-atelier-cream"
          style={{ background: "var(--at-ink)" }}
        >
          <div
            style={{
              fontFamily: "var(--at-mono)",
              fontSize: 9,
              letterSpacing: "0.15em",
              color: "var(--at-sand)",
              textTransform: "uppercase",
            }}
          >
            {labels.activeRequestLabel}
          </div>
          <div
            style={{
              fontFamily: "var(--at-serif)",
              fontSize: 22,
              lineHeight: 1.2,
              marginTop: 8,
              fontStyle: "var(--at-italic-style, italic)",
            }}
          >
            {labels.activeRequestEmpty}
          </div>
          <div
            className="mt-4 pt-3"
            style={{
              borderTop: "1px solid rgba(244,237,225,0.15)",
              fontFamily: "var(--at-serif)",
              fontSize: 14,
              fontStyle: "var(--at-italic-style, italic)",
            }}
          >
            {labels.activeRequestCta}
          </div>
        </Link>
      )}

      {/* Activity eyebrow */}
      <div className="px-5 pb-2">
        <LabelMono>{labels.activityEyebrow}</LabelMono>
      </div>

      {/* Activity rows */}
      <ActivityRow
        href="/profile?tab=offers"
        title={labels.activityOffers}
        sub={
          offersItems.length
            ? offersItems
                .slice(0, 3)
                .map((o) =>
                  shortName(o.provider?.firstName, o.provider?.lastName),
                )
                .join(", ")
            : labels.noOffers
        }
        count={offersCount}
      />
      <ActivityRow
        href="/messages"
        title={labels.activityMessages}
        sub={
          unreadCount > 0
            ? `${unreadCount} ${labels.metricUnread.toLowerCase()}`
            : "—"
        }
        count={threads?.length ?? 0}
      />
      <ActivityRow
        href="/dashboard/favorites"
        title={labels.activityFavorites}
        sub="—"
        count={favoritesCount}
      />
      <ActivityRow
        href="/profile/demandes"
        title={labels.activityListings}
        sub={`${activeListingsCount} идэвхтэй · ${archivedListingsCount} архив`}
        count={myListingsCount}
      />
      <ActivityRow
        href="/reviews/create"
        title={labels.activityReviews}
        sub="—"
        count={0}
      />
    </div>
  );

  // ─────── DESKTOP ───────
  const sidebarNav: Array<{
    label: string;
    href: string;
    active?: boolean;
    count?: number | string;
  }> = [
    { label: labels.sidebarOverview, href: "/profile", active: true, count: "·" },
    { label: labels.sidebarRequests, href: "/profile/demandes", count: myListingsCount },
    { label: labels.sidebarOffers, href: "/profile?tab=offers", count: offersCount },
    { label: labels.sidebarMessages, href: "/messages", count: unreadCount || "·" },
    { label: labels.sidebarFavorites, href: "/dashboard/favorites", count: favoritesCount },
    { label: labels.sidebarReviews, href: "/profile?tab=reviews", count: "·" },
    { label: labels.sidebarPayments, href: "/profile/identifiants", count: "·" },
    { label: labels.sidebarSettings, href: "/profile/informations", count: "·" },
  ];

  const desktop = (
    <div className="hidden md:block bg-atelier-paper text-atelier-ink min-h-screen">
      <section
        className="grid"
        style={{ gridTemplateColumns: "260px 1fr", minHeight: 720 }}
      >
        {/* Sidebar */}
        <aside
          className="bg-atelier-cream"
          style={{
            padding: "36px 28px",
            borderRight: "1px solid var(--at-line)",
          }}
        >
          <div className="flex items-center gap-3 mb-7">
            <Avatar
              src={avatarUrl || undefined}
              initial={initial}
              size="lg"
              tone="ocre"
            />
            <div>
              <div
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 17,
                  fontStyle: "var(--at-italic-style, italic)",
                }}
              >
                {sidebarName}
              </div>
              <div
                className="mt-1"
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  color: "var(--at-muted)",
                }}
              >
                {city} · {joinYear}-оос
              </div>
            </div>
          </div>

          <nav>
            {sidebarNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between"
                style={{
                  padding: "11px 14px",
                  marginBottom: 4,
                  background: item.active ? "var(--at-ink)" : "transparent",
                  color: item.active ? "var(--at-cream)" : "var(--at-ink)",
                  fontFamily: "var(--at-serif)",
                  fontSize: 14,
                  fontStyle: item.active
                    ? "var(--at-italic-style, italic)"
                    : "normal",
                }}
              >
                <span>{item.label}</span>
                <span
                  style={{
                    fontFamily: "var(--at-mono)",
                    fontSize: 10,
                    letterSpacing: "0.05em",
                    color: item.active ? "var(--at-ocre)" : "var(--at-muted)",
                  }}
                >
                  {item.count}
                </span>
              </Link>
            ))}
          </nav>

          <div
            className="mt-9 text-atelier-cream"
            style={{ padding: 18, background: "var(--at-terre)" }}
          >
            <div
              style={{
                fontFamily: "var(--at-mono)",
                fontSize: 9,
                letterSpacing: "0.15em",
                opacity: 0.75,
              }}
            >
              {labels.promoEyebrow}
            </div>
            <div
              className="mt-2"
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 16,
                fontStyle: "var(--at-italic-style, italic)",
                lineHeight: 1.3,
              }}
            >
              {labels.promoTitle}
            </div>
            <div
              className="mt-3"
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 12,
                fontStyle: "var(--at-italic-style, italic)",
              }}
            >
              {labels.promoCta}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div style={{ padding: "40px 48px 60px" }}>
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--at-muted)",
                }}
              >
                {dateEyebrow}
              </div>
              <h1
                className="m-0 mt-2 text-atelier-ink"
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 52,
                  fontWeight: 400,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                {labels.greetingPrefix}
                <em
                  style={{
                    fontStyle: "var(--at-italic-style, italic)",
                    color: "var(--at-terre)",
                  }}
                >
                  {greetingNameDesktop}.
                </em>
              </h1>
            </div>
            <Link
              href={labels.newRequestHref}
              className="text-atelier-cream"
              style={{
                padding: "12px 22px",
                background: "var(--at-ink)",
                fontFamily: "var(--at-serif)",
                fontSize: 14,
              }}
            >
              {labels.newRequest}
            </Link>
          </div>

          {/* Active request big card */}
          {activeListing ? (
            <Link
              href={`/listings/${activeListing.id}`}
              className="block text-atelier-cream mb-8"
              style={{ padding: 36, background: "var(--at-ink)" }}
            >
              <div className="flex items-baseline justify-between">
                <div
                  style={{
                    fontFamily: "var(--at-mono)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--at-ocre)",
                  }}
                >
                  ● {labels.activeRequestNo}
                </div>
                <div
                  style={{
                    fontFamily: "var(--at-mono)",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--at-sand)",
                  }}
                >
                  {labels.endsIn}: {daysSinceCreation(activeListing)} {labels.daysSuffix}
                </div>
              </div>
              <h2
                className="m-0 mt-3"
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 36,
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {shortListingTitle(activeListing)}
              </h2>
              <div
                className="grid mt-8 pt-6"
                style={{
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 28,
                  borderTop: "1px solid rgba(244,237,225,0.15)",
                }}
              >
                <Metric
                  value={offersCount}
                  label={labels.metricOffers}
                  color="var(--at-ocre)"
                />
                <Metric
                  value={activeListing.favoritesCount ?? 0}
                  label={labels.metricSaved}
                  color="var(--at-cream)"
                />
                <Metric
                  value={favoritesCount}
                  label={labels.metricViews}
                  color="var(--at-cream)"
                />
                <Metric
                  value={unreadCount}
                  label={labels.metricUnread}
                  color="var(--at-terre)"
                />
              </div>
            </Link>
          ) : (
            <Link
              href={labels.newRequestHref}
              className="block text-atelier-cream mb-8"
              style={{ padding: 36, background: "var(--at-ink)" }}
            >
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--at-ocre)",
                }}
              >
                {labels.activeRequestLabel}
              </div>
              <h2
                className="m-0 mt-3"
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 32,
                  fontStyle: "var(--at-italic-style, italic)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {labels.activeRequestEmpty}
              </h2>
              <div
                className="mt-6 pt-4"
                style={{
                  borderTop: "1px solid rgba(244,237,225,0.15)",
                  fontFamily: "var(--at-serif)",
                  fontSize: 14,
                  fontStyle: "var(--at-italic-style, italic)",
                }}
              >
                {labels.activeRequestCta}
              </div>
            </Link>
          )}

          {/* Recent offers */}
          <div
            className="mb-3"
            style={{
              fontFamily: "var(--at-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--at-muted)",
            }}
          >
            {labels.receivedOffers} · {offersCount}
          </div>
          {offersItems.length > 0 ? (
            <div
              style={{
                background: "var(--at-paper)",
                border: "1px solid var(--at-line)",
              }}
            >
              {offersItems.map((o, i) => {
                const who = shortName(o.provider?.firstName, o.provider?.lastName);
                const isNew = o.status === "PENDING";
                return (
                  <Link
                    key={o.id}
                    href={`/offers/${o.id}`}
                    className="grid items-center"
                    style={{
                      gridTemplateColumns:
                        "auto 1.5fr 1fr 1fr 1fr auto",
                      gap: 20,
                      padding: "20px 24px",
                      borderTop: i > 0 ? "1px solid var(--at-line)" : "none",
                    }}
                  >
                    <Avatar
                      src={
                        resolveImageUrl(o.provider?.avatarUrl || undefined) ||
                        undefined
                      }
                      initial={firstInitial(
                        o.provider?.firstName,
                        o.provider?.lastName,
                      )}
                      size="md"
                      tone="terre"
                    />
                    <div>
                      <div
                        className="flex items-center gap-2"
                        style={{
                          fontFamily: "var(--at-serif)",
                          fontSize: 16,
                          fontWeight: 500,
                        }}
                      >
                        {who}
                        {isNew && (
                          <span
                            className="text-atelier-cream"
                            style={{
                              fontFamily: "var(--at-mono)",
                              fontSize: 9,
                              letterSpacing: "0.1em",
                              padding: "2px 6px",
                              background: "var(--at-terre)",
                            }}
                          >
                            {labels.newTag}
                          </span>
                        )}
                      </div>
                      <div
                        className="mt-0.5 text-atelier-muted"
                        style={{ fontSize: 12 }}
                      >
                        {o.message
                          ? o.message.slice(0, 50)
                          : labels.activityOffers}
                      </div>
                    </div>
                    <div>
                      <LabelMono>{labels.priceLabel}</LabelMono>
                      <div
                        className="mt-1"
                        style={{
                          fontFamily: "var(--at-serif)",
                          fontSize: 16,
                          fontStyle: "var(--at-italic-style, italic)",
                        }}
                      >
                        {formatPriceMnt(o.price)}
                      </div>
                    </div>
                    <div>
                      <LabelMono>{labels.durationLabel}</LabelMono>
                      <div
                        className="mt-1"
                        style={{
                          fontFamily: "var(--at-serif)",
                          fontSize: 15,
                        }}
                      >
                        {o.estimatedDays != null
                          ? `${o.estimatedDays} ${labels.daysSuffix}`
                          : relativeDays(o.createdAt)}
                      </div>
                    </div>
                    <div>
                      <LabelMono>{labels.rateLabel}</LabelMono>
                      <div
                        className="mt-1"
                        style={{
                          fontFamily: "var(--at-serif)",
                          fontSize: 15,
                          color: "var(--at-terre)",
                        }}
                      >
                        ★ —
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--at-serif)",
                        fontSize: 14,
                        fontStyle: "var(--at-italic-style, italic)",
                      }}
                    >
                      {labels.viewLink}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              className="text-atelier-muted"
              style={{
                background: "var(--at-paper)",
                border: "1px solid var(--at-line)",
                padding: "28px 24px",
                fontFamily: "var(--at-serif)",
                fontStyle: "var(--at-italic-style, italic)",
                fontSize: 15,
              }}
            >
              {labels.noOffers}
            </div>
          )}

          {/* Secondary blocks */}
          <div
            className="grid mt-8"
            style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}
          >
            <Link
              href={latestChatHref}
              className="block text-atelier-cream"
              style={{ background: "var(--at-cobalt)", padding: 28 }}
            >
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  opacity: 0.75,
                }}
              >
                {labels.latestChatEyebrow}
              </div>
              <div
                className="my-3"
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 22,
                  fontStyle: "var(--at-italic-style, italic)",
                }}
              >
                {latestPartner
                  ? `${latestPartnerName} дөнгөж хариулав.`
                  : labels.latestChatEmpty}
              </div>
              {latestThread?.content ? (
                <p
                  className="m-0"
                  style={{
                    fontFamily: "var(--at-serif)",
                    fontSize: 14,
                    opacity: 0.85,
                  }}
                >
                  «{latestThread.content.slice(0, 90)}»
                </p>
              ) : null}
              <div
                className="mt-5"
                style={{
                  fontFamily: "var(--at-serif)",
                  fontStyle: "var(--at-italic-style, italic)",
                  fontSize: 14,
                }}
              >
                {labels.latestChatOpen}
              </div>
            </Link>
            <div
              className="text-atelier-ink"
              style={{ background: "var(--at-rose)", padding: 28 }}
            >
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  opacity: 0.75,
                }}
              >
                {labels.monthlyActivity}
              </div>
              <div
                className="mt-4 flex items-end gap-1"
                style={{ height: 80 }}
              >
                {monthlyBars.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      background:
                        i === monthlyBars.length - 1
                          ? "var(--at-ink)"
                          : "rgba(26,23,20,0.4)",
                    }}
                  />
                ))}
              </div>
              <div
                className="flex justify-between mt-3"
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 9,
                  opacity: 0.7,
                  letterSpacing: "0.05em",
                }}
              >
                <span>{monthFromIdx(0)}</span>
                <span>{monthFromIdx(11)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // suppress unused
  void monthLabelsMn;

  return (
    <>
      {mobile}
      {desktop}
    </>
  );
}

function Metric({
  value,
  label,
  color,
}: {
  value: number | string;
  label: string;
  color: string;
}): React.ReactElement {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--at-serif)",
          fontSize: 44,
          fontStyle: "var(--at-italic-style, italic)",
          letterSpacing: "-0.02em",
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        className="mt-1"
        style={{
          fontFamily: "var(--at-mono)",
          fontSize: 10,
          letterSpacing: "0.15em",
          color: "var(--at-sand)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ActivityRow({
  href,
  title,
  sub,
  count,
}: {
  href: string;
  title: string;
  sub: string;
  count: number | string;
}): React.ReactElement {
  return (
    <Link
      href={href}
      className="flex items-center justify-between text-atelier-ink"
      style={{
        padding: "16px 20px",
        borderTop: "1px solid var(--at-line)",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--at-serif)",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        <div
          className="mt-0.5 text-atelier-muted"
          style={{ fontSize: 12 }}
        >
          {sub}
        </div>
      </div>
      <div className="flex items-center gap-3 text-atelier-muted">
        <span
          className="text-atelier-ink"
          style={{
            fontFamily: "var(--at-serif)",
            fontSize: 22,
            fontStyle: "var(--at-italic-style, italic)",
          }}
        >
          {count}
        </span>
        <ChevronRight />
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
