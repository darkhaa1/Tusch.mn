"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@web/components/ui";
import { useCompleteOnboarding, useCurrentUser } from "@web/lib/hooks/useApi";
import type { UserRole } from "@web/lib/api/types";
import { CATEGORIES } from "@repo/shared";
import { cn } from "@web/lib/utils";

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

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Алхам {step} / {TOTAL_STEPS}</span>
        <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
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
      className={cn(
        "flex w-full flex-col gap-1 rounded-xl border-2 p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      <span className="font-semibold text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </button>
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
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
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
    <main className="mx-auto max-w-lg px-4 py-10">
      <ProgressBar step={step} />

      {step === 1 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Тавтай морилно уу!
          </h1>
          <p className="mb-6 text-muted-foreground">
            Та Tusch.mn-д ямар зорилгоор нэгдэж байна вэ?
          </p>
          <div className="flex flex-col gap-3">
            <RoleCard
              label="Захиалагч"
              description="Би үйлчилгээ хайж байна"
              selected={role === "CLIENT"}
              onClick={() => setRole("CLIENT")}
            />
            <RoleCard
              label="Үйлчилгээ үзүүлэгч"
              description="Би үйлчилгээ санал болгохыг хүсч байна"
              selected={role === "PROVIDER"}
              onClick={() => setRole("PROVIDER")}
            />
            <RoleCard
              label="Хоёулаа"
              description="Би хоёуланг нь хийхийг хүсч байна"
              selected={role === "BOTH"}
              onClick={() => setRole("BOTH")}
            />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Алгасах
            </button>
            <Button onClick={handleNext}>Үргэлжлүүлэх</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Профайлаа бөглөнө үү
          </h1>
          <p className="mb-6 text-muted-foreground">
            Энэ мэдээлэл нь бусад хэрэглэгчдэд танийг таних боломж олгоно.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Хот / Аймаг
              </label>
              <Input
                placeholder="Улаанбаатар"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {MONGOLIAN_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition",
                      city === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Товч танилцуулга{" "}
                <span className="text-muted-foreground">(заавал биш)</span>
              </label>
              <textarea
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
                placeholder="Өөрийгөө товч танилцуулна уу..."
                value={bio}
                maxLength={500}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {bio.length}/500
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Алгасах
            </button>
            <Button onClick={handleNext}>
              {isProvider ? "Үргэлжлүүлэх" : "Дуусгах"}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && isProvider && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Үйлчилгээний мэдээлэл
          </h1>
          <p className="mb-6 text-muted-foreground">
            Та ямар төрлийн үйлчилгээ үзүүлдэг вэ?
          </p>
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">
                Ангилал
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition",
                      selectedCategories.includes(cat.slug)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:border-primary/50"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Үйлчилгээний бүс{" "}
                <span className="text-muted-foreground">(заавал биш)</span>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Хот нэмэх..."
                  value={zoneInput}
                  onChange={(e) => setZoneInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addZone(zoneInput);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => addZone(zoneInput)}
                  disabled={!zoneInput.trim()}
                >
                  Нэмэх
                </Button>
              </div>
              {serviceZones.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {serviceZones.map((zone) => (
                    <span
                      key={zone}
                      className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      {zone}
                      <button
                        type="button"
                        onClick={() => removeZone(zone)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => void handleComplete()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Алгасах
            </button>
            <Button
              onClick={() => void handleComplete()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Хадгалж байна..." : "Дуусгах"}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && !isProvider && (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="mb-2 text-2xl font-bold">Бүртгэл бэлэн боллоо!</h1>
          <p className="mb-6 text-muted-foreground">
            Tusch.mn-д тавтай морилно уу. Та одоо үйлчилгээ хайж эхлэх
            боломжтой.
          </p>
          <Button onClick={() => void handleComplete()} disabled={mutation.isPending}>
            {mutation.isPending ? "..." : "Эхлэх"}
          </Button>
        </div>
      )}
    </main>
  );
}
