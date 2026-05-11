"use client";

/**
 * Onboarding — Atelier redesign (SA-8).
 *
 * Three-step post-signup flow: role → profile → (provider-only) categories.
 * Mobile: full-width vertical scroll on cream bg. Desktop: same content
 * centered with `max-w-2xl` and a paper card behind. All state, mutations,
 * and validation behavior are unchanged from the prior version.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompleteOnboarding, useCurrentUser } from "@web/lib/hooks/useApi";
import type { UserRole } from "@web/lib/api/types";
import { CATEGORIES } from "@repo/shared";
import {
  Button as AtButton,
  Input as AtInput,
  LabelMono,
} from "@web/components/ui-v2";

const TOTAL_STEPS = 3;

const MONGOLIAN_CITIES = [
  "Улаанбаатар",
  "Дархан",
  "Эрдэнэт",
  "Чойбалсан",
  "Мөрөн",
  "Өлгий",
  "Говь-Алтай",
  "Баянхонгор",
  "Арвайхээр",
  "Цэцэрлэг",
];

const labels = {
  brand: "Tusch · Танилцуулга",
  step: "Үе шат",
  step1Title: "Тавтай",
  step1TitleEm: "морилно уу.",
  step1Subtitle:
    "Та Tusch.mn-д ямар зорилгоор нэгдэж байна вэ? Хүссэн үедээ өөрчилж болно.",
  roleSection: "Үүрэг",
  roleClient: "Захиалагч",
  roleClientDesc: "Би үйлчилгээ хайж байна.",
  roleProvider: "Үйлчилгээ үзүүлэгч",
  roleProviderDesc: "Би үйлчилгээ санал болгохыг хүсч байна.",
  roleBoth: "Хоёулаа",
  roleBothDesc: "Би хоёуланг нь хийхийг хүсч байна.",
  step2Title: "Профайлаа",
  step2TitleEm: "бөглөнө үү.",
  step2Subtitle:
    "Энэ мэдээлэл бусад хэрэглэгчдэд танийг таних боломж олгоно.",
  citySection: "Хот · Аймаг",
  cityPlaceholder: "Жнь: Улаанбаатар",
  citySuggested: "Санал болгох",
  bioSection: "Товч танилцуулга",
  bioOptional: "Заавал биш",
  bioPlaceholder: "Өөрийгөө товч танилцуулна уу…",
  step3Title: "Үйлчилгээний",
  step3TitleEm: "мэдээлэл.",
  step3Subtitle: "Та ямар төрлийн үйлчилгээ үзүүлдэг вэ?",
  catSection: "Ангилал",
  zonesSection: "Үйлчилгээний бүс",
  zoneInputPlaceholder: "Хот эсвэл дүүрэг нэмэх…",
  zoneAdd: "Нэмэх",
  doneTitle: "Бэлэн",
  doneTitleEm: "боллоо.",
  doneSubtitle:
    "Tusch.mn-д тавтай морилно уу. Та одоо үйлчилгээ хайж эхлэх боломжтой.",
  skip: "Алгасах",
  next: "Үргэлжлүүлэх",
  finish: "Дуусгах",
  saving: "Хадгалж байна…",
  start: "Эхлэх",
  back: "← Буцах",
};

function Eyebrow({ step }: { step: number }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <LabelMono tone="muted">{labels.brand}</LabelMono>
      <LabelMono tone="terre">
        {labels.step} {step} / {TOTAL_STEPS}
      </LabelMono>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= step;
        return (
          <span
            key={i}
            className={
              "h-0.75 flex-1 " +
              (filled ? "bg-atelier-ink" : "bg-atelier-line")
            }
          />
        );
      })}
    </div>
  );
}

function RoleCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full flex-col gap-1 border px-4 py-4 text-left transition " +
        (selected
          ? "border-atelier-ink bg-atelier-cream"
          : "border-atelier-line bg-atelier-paper hover:border-atelier-ink")
      }
    >
      <span
        className="text-[17px] italic text-atelier-ink"
        style={{ fontFamily: "var(--at-serif)" }}
      >
        {label}
      </span>
      <span
        className="text-[12px] text-atelier-muted"
        style={{ fontFamily: "var(--at-serif)" }}
      >
        {description}
      </span>
    </button>
  );
}

function StepHeading({ pre, em }: { pre: string; em: string }) {
  return (
    <h1
      className="text-[28px] leading-[1.15] tracking-[-0.5px] text-atelier-ink md:text-4xl"
      style={{ fontFamily: "var(--at-serif)" }}
    >
      {pre}{" "}
      <em style={{ fontStyle: "italic", fontFamily: "var(--at-serif)" }}>
        {em}
      </em>
    </h1>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const mutation = useCompleteOnboarding();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [serviceZones, setServiceZones] = useState<string[]>([]);
  const [zoneInput, setZoneInput] = useState("");

  const isProvider = role === "PROVIDER" || role === "BOTH";

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );
  };

  const addZone = (zone: string) => {
    const trimmed = zone.trim();
    if (trimmed && !serviceZones.includes(trimmed)) {
      setServiceZones((prev) => [...prev, trimmed]);
    }
    setZoneInput("");
  };

  const removeZone = (zone: string) => {
    setServiceZones((prev) => prev.filter((z) => z !== zone));
  };

  const handleNext = () => {
    if (step === 2 && !isProvider) {
      void handleComplete();
    } else {
      setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    }
  };

  const handleSkip = () => {
    if (step === 2 && !isProvider) {
      void handleComplete();
    } else if (step === TOTAL_STEPS || (step === 2 && !isProvider)) {
      void handleComplete();
    } else {
      setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    await mutation.mutateAsync({
      role,
      city: city || undefined,
      bio: bio || undefined,
      serviceCategories: isProvider ? selectedCategories : [],
      serviceZones: isProvider ? serviceZones : [],
    });
    router.replace("/");
  };

  if (!currentUser) return null;

  return (
    <main
      className="min-h-screen bg-atelier-cream text-atelier-ink"
      style={{ fontFamily: "var(--at-sans)" }}
    >
      <div className="mx-auto w-full max-w-2xl px-5 py-8 md:px-8 md:py-14">
        <div className="md:border md:border-atelier-line md:bg-atelier-paper md:px-10 md:py-10">
          <Eyebrow step={Math.min(step, TOTAL_STEPS)} />
          <ProgressBar step={step} />

          {step === 1 && (
            <div className="space-y-7">
              <div className="space-y-2">
                <StepHeading pre={labels.step1Title} em={labels.step1TitleEm} />
                <p
                  className="text-[13px] italic text-atelier-muted"
                  style={{ fontFamily: "var(--at-serif)" }}
                >
                  {labels.step1Subtitle}
                </p>
              </div>

              <div className="border-t border-atelier-line pt-5">
                <LabelMono className="mb-3 block">
                  {labels.roleSection}
                </LabelMono>
                <div className="flex flex-col gap-3">
                  <RoleCard
                    label={labels.roleClient}
                    description={labels.roleClientDesc}
                    selected={role === "CLIENT"}
                    onClick={() => setRole("CLIENT")}
                  />
                  <RoleCard
                    label={labels.roleProvider}
                    description={labels.roleProviderDesc}
                    selected={role === "PROVIDER"}
                    onClick={() => setRole("PROVIDER")}
                  />
                  <RoleCard
                    label={labels.roleBoth}
                    description={labels.roleBothDesc}
                    selected={role === "BOTH"}
                    onClick={() => setRole("BOTH")}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-atelier-line pt-5">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-[12px] uppercase tracking-[0.15em] text-atelier-muted hover:text-atelier-ink"
                  style={{ fontFamily: "var(--at-mono)" }}
                >
                  {labels.skip}
                </button>
                <div className="flex-1" />
                <AtButton variant="primary" onClick={handleNext}>
                  {labels.next}
                </AtButton>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-7">
              <div className="space-y-2">
                <StepHeading pre={labels.step2Title} em={labels.step2TitleEm} />
                <p
                  className="text-[13px] italic text-atelier-muted"
                  style={{ fontFamily: "var(--at-serif)" }}
                >
                  {labels.step2Subtitle}
                </p>
              </div>

              <div className="border-t border-atelier-line pt-5">
                <AtInput
                  label={labels.citySection}
                  placeholder={labels.cityPlaceholder}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <LabelMono className="w-full">
                    {labels.citySuggested}
                  </LabelMono>
                  {MONGOLIAN_CITIES.map((c) => {
                    const active = city === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCity(c)}
                        className={
                          active
                            ? "bg-atelier-ink text-atelier-cream px-3 py-1.5 text-[13px] border border-transparent"
                            : "bg-transparent text-atelier-ink border border-atelier-line px-3 py-1.5 text-[13px] hover:border-atelier-ink"
                        }
                        style={{
                          fontFamily: "var(--at-serif)",
                          fontStyle: "italic",
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-atelier-line pt-5">
                <div className="mb-2 flex items-baseline justify-between">
                  <LabelMono>{labels.bioSection}</LabelMono>
                  <LabelMono>{labels.bioOptional}</LabelMono>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder={labels.bioPlaceholder}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="block w-full border border-atelier-ink bg-atelier-paper px-3 py-3 text-[14px] leading-[1.55] text-atelier-ink placeholder:text-atelier-muted outline-none focus:ring-2 focus:ring-atelier-ink/30"
                  style={{ fontFamily: "var(--at-serif)" }}
                />
                <p
                  className="mt-1 text-right text-[10px] uppercase tracking-[0.15em] text-atelier-muted"
                  style={{ fontFamily: "var(--at-mono)" }}
                >
                  {bio.length} / 500
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-atelier-line pt-5">
                <AtButton variant="outline" italic onClick={handleBack}>
                  {labels.back}
                </AtButton>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-[12px] uppercase tracking-[0.15em] text-atelier-muted hover:text-atelier-ink"
                  style={{ fontFamily: "var(--at-mono)" }}
                >
                  {labels.skip}
                </button>
                <div className="flex-1" />
                <AtButton
                  variant="primary"
                  onClick={handleNext}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? labels.saving
                    : isProvider
                      ? labels.next
                      : labels.finish}
                </AtButton>
              </div>
            </div>
          )}

          {step === 3 && isProvider && (
            <div className="space-y-7">
              <div className="space-y-2">
                <StepHeading pre={labels.step3Title} em={labels.step3TitleEm} />
                <p
                  className="text-[13px] italic text-atelier-muted"
                  style={{ fontFamily: "var(--at-serif)" }}
                >
                  {labels.step3Subtitle}
                </p>
              </div>

              <div className="border-t border-atelier-line pt-5">
                <LabelMono className="mb-3 block">
                  {labels.catSection}
                </LabelMono>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategories.includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className={
                          active
                            ? "bg-atelier-ink text-atelier-cream px-3 py-1.5 text-[13px] border border-transparent"
                            : "bg-transparent text-atelier-ink border border-atelier-line px-3 py-1.5 text-[13px] hover:border-atelier-ink"
                        }
                        style={{
                          fontFamily: "var(--at-serif)",
                          fontStyle: "italic",
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-atelier-line pt-5">
                <div className="mb-2 flex items-baseline justify-between">
                  <LabelMono>{labels.zonesSection}</LabelMono>
                  <LabelMono>{labels.bioOptional}</LabelMono>
                </div>
                <div className="flex items-stretch gap-2">
                  <div className="flex-1">
                    <AtInput
                      placeholder={labels.zoneInputPlaceholder}
                      value={zoneInput}
                      onChange={(e) => setZoneInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addZone(zoneInput);
                        }
                      }}
                    />
                  </div>
                  <AtButton
                    variant="outline"
                    italic
                    type="button"
                    onClick={() => addZone(zoneInput)}
                    disabled={!zoneInput.trim()}
                  >
                    {labels.zoneAdd}
                  </AtButton>
                </div>
                {serviceZones.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {serviceZones.map((zone) => (
                      <span
                        key={zone}
                        className="inline-flex items-center gap-1 border border-atelier-line bg-atelier-paper px-3 py-1.5 text-[13px] italic text-atelier-ink"
                        style={{ fontFamily: "var(--at-serif)" }}
                      >
                        {zone}
                        <button
                          type="button"
                          onClick={() => removeZone(zone)}
                          className="ml-1 text-atelier-muted hover:text-atelier-ink"
                          aria-label={`Remove ${zone}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-atelier-line pt-5">
                <AtButton variant="outline" italic onClick={handleBack}>
                  {labels.back}
                </AtButton>
                <button
                  type="button"
                  onClick={() => void handleComplete()}
                  className="text-[12px] uppercase tracking-[0.15em] text-atelier-muted hover:text-atelier-ink"
                  style={{ fontFamily: "var(--at-mono)" }}
                >
                  {labels.skip}
                </button>
                <div className="flex-1" />
                <AtButton
                  variant="primary"
                  onClick={() => void handleComplete()}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? labels.saving : labels.finish}
                </AtButton>
              </div>
            </div>
          )}

          {step === 3 && !isProvider && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <StepHeading pre={labels.doneTitle} em={labels.doneTitleEm} />
              <p
                className="text-[14px] italic text-atelier-muted"
                style={{ fontFamily: "var(--at-serif)" }}
              >
                {labels.doneSubtitle}
              </p>
              <AtButton
                variant="primary"
                onClick={() => void handleComplete()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? labels.saving : labels.start}
              </AtButton>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
