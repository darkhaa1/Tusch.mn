"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, X } from "lucide-react";
import AppShell from "@web/components/layout/AppShell";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from "@web/components/ui";
import {
  useCurrentUser,
  useServiceZones,
  useUpdateServiceZones,
} from "@web/lib/hooks/useApi";
import { MN_LOCATIONS } from "@repo/shared";

const MAX_ZONES = 20;

function ServiceZonesContent() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: savedZones = [], isLoading: zonesLoading } = useServiceZones(
    user?.id,
  );
  const updateMutation = useUpdateServiceZones();

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [pendingZones, setPendingZones] = useState<
    { city: string; district: string | null }[] | null
  >(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (userLoading || zonesLoading) {
    return (
      <AppShell title="Үйлчилгээний бүс нутаг">
        <Skeleton className="h-64 w-full rounded-xl" />
      </AppShell>
    );
  }

  if (!user) {
    router.push("/login?redirect=/dashboard/service-zones");
    return null;
  }

  // Use pending state if dirty, otherwise use saved zones
  const zones: { city: string; district: string | null }[] =
    pendingZones ??
    savedZones.map((z) => ({ city: z.city, district: z.district }));

  const isDirty = pendingZones !== null;

  const addZone = (city: string, district: string | null) => {
    if (zones.length >= MAX_ZONES) return;
    const already = zones.some(
      (z) => z.city === city && z.district === district,
    );
    if (already) return;
    setPendingZones([...zones, { city, district }]);
    setSaveSuccess(false);
  };

  const removeZone = (city: string, district: string | null) => {
    setPendingZones(zones.filter((z) => !(z.city === city && z.district === district)));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const payload = zones.map((z) =>
        z.district ? { city: z.city, district: z.district } : { city: z.city },
      );
      await updateMutation.mutateAsync(payload);
      setPendingZones(null);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  };

  const selectedCityData = selectedCity
    ? MN_LOCATIONS.find((l) => l.city === selectedCity)
    : null;

  return (
    <AppShell title="Үйлчилгээний бүс нутаг">
      <div className="space-y-6">
        <Card className="border-border/80">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Миний үйлчилгээний бүс нутаг
                </h2>
                <p className="text-sm text-muted-foreground">
                  Та хаана үйлчилгээ үзүүлэхийг сонгоно уу. Хамгийн ихдээ{" "}
                  {MAX_ZONES} бүс нутаг нэмэх боломжтой.
                </p>
              </div>
              <Badge
                variant={zones.length >= MAX_ZONES ? "destructive" : "outline"}
                className="rounded-full px-3 text-xs"
              >
                {zones.length} / {MAX_ZONES}
              </Badge>
            </div>

            {/* Selected zones */}
            {zones.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {zones.map((z) => (
                  <Badge
                    key={`${z.city}-${z.district ?? ""}`}
                    variant="secondary"
                    className="gap-1.5 pr-1 text-sm"
                  >
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {z.district ? `${z.city} · ${z.district}` : z.city}
                    <button
                      type="button"
                      onClick={() => removeZone(z.city, z.district)}
                      className="ml-0.5 rounded-sm opacity-70 hover:opacity-100"
                      aria-label={`Устгах: ${z.district ?? z.city}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Одоогоор бүс нутаг сонгоогүй байна.
              </p>
            )}

            {/* City selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Хот сонгох</p>
              <div className="flex flex-wrap gap-2">
                {MN_LOCATIONS.map((loc) => (
                  <button
                    key={loc.city}
                    type="button"
                    onClick={() =>
                      setSelectedCity(
                        selectedCity === loc.city ? null : loc.city,
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                      selectedCity === loc.city
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/70 text-foreground hover:bg-muted/70"
                    }`}
                  >
                    {loc.city}
                  </button>
                ))}
              </div>
            </div>

            {/* District selector or whole-city add */}
            {selectedCityData && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  {selectedCityData.city}
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Add whole city */}
                  <button
                    type="button"
                    disabled={
                      zones.length >= MAX_ZONES ||
                      zones.some(
                        (z) =>
                          z.city === selectedCityData.city && z.district === null,
                      )
                    }
                    onClick={() => addZone(selectedCityData.city, null)}
                    className="rounded-full border border-dashed border-primary/60 px-3 py-1 text-sm text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    + Бүхэл хот
                  </button>
                  {selectedCityData.districts.map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={
                        zones.length >= MAX_ZONES ||
                        zones.some(
                          (z) =>
                            z.city === selectedCityData.city && z.district === d,
                        )
                      }
                      onClick={() => addZone(selectedCityData.city, d)}
                      className="rounded-full border border-border/70 px-3 py-1 text-sm text-foreground transition hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-sm text-green-600">Амжилттай хадгалагдлаа.</p>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateMutation.isPending ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function ServiceZonesPage() {
  return (
    <Suspense>
      <ServiceZonesContent />
    </Suspense>
  );
}
