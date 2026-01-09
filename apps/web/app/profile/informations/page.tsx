"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../../../components/layout/AppShell";
import { PageHeader } from "../../../components/common";
import { useCurrentUser, useUpdateCurrentUser } from "../../hooks/useApi";
import { Button, Card, CardContent, Input } from "@repo/ui";

export default function ProfileInformationsPage() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: updateUser, isPending, isSuccess } = useUpdateCurrentUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setFirstName(currentUser.firstName || "");
    setLastName(currentUser.lastName || "");
    setPhone(currentUser.phone || "");
  }, [currentUser]);

  const hasChanges = useMemo(() => {
    return (
      avatarFile !== null ||
      firstName !== (currentUser?.firstName || "") ||
      lastName !== (currentUser?.lastName || "") ||
      phone !== (currentUser?.phone || "")
    );
  }, [avatarFile, firstName, lastName, phone, currentUser]);

  const handleSave = () => {
    if (!currentUser) return;
    setError(null);
    if (avatarFile) {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phone", phone);
      formData.append("avatar", avatarFile);
      updateUser(formData, {
        onError: (err) => setError(err instanceof Error ? err.message : "Алдаа гарлаа."),
        onSuccess: () => setAvatarFile(null),
      });
    } else {
      updateUser(
        {
          firstName,
          lastName,
          phone,
        },
        {
          onError: (err) => setError(err instanceof Error ? err.message : "Алдаа гарлаа."),
        }
      );
    }
  };

  return (
    <AppShell>
      <PageHeader title="Хувийн мэдээлэл" className="mb-4" />
      <Card className="border border-border/80">
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Профайл шинэчлэх</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Нэр</span>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Нэр"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Овог</span>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Овог"
              />
            </label>
          </div>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">Утас</span>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Утасны дугаар"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">Профайл зураг</span>
            <Input id="avatar" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground">JPG/PNG, 2MB хүртэл.</p>
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {isSuccess && !isPending ? <p className="text-sm text-green-600">Амжилттай шинэчлэгдлээ.</p> : null}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!hasChanges || isPending} className="min-w-[140px]">
              {isPending ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
