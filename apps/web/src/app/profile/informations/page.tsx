"use client";

import { useMemo, useState } from "react";
import AppShell from "@web/components/layout/AppShell";
import { useCurrentUser, useUpdateCurrentUser } from "@web/lib/hooks/useApi";
import { Button, Card, CardContent, Input } from "@web/components/ui";

type ProfileInformationsFormProps = {
  currentUser: ReturnType<typeof useCurrentUser>["data"];
  updateUser: ReturnType<typeof useUpdateCurrentUser>["mutate"];
  isPending: boolean;
  isSuccess: boolean;
};

function ProfileInformationsForm({
  currentUser,
  updateUser,
  isPending,
  isSuccess,
}: ProfileInformationsFormProps) {
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        onError: (err) => setError(err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу."),
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
          onError: (err) => setError(err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу."),
        }
      );
    }
  };

  return (
    <Card className="border border-border/80">
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Ерөнхий мэдээлэл</h2>
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
          <span className="text-sm font-medium text-foreground">Утасны дугаар</span>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Утасны дугаар"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-foreground">Профайл зураг</span>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-muted-foreground">JPG/PNG, 2MB хүртэл.</p>
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {isSuccess && !isPending ? <p className="text-sm text-green-600">Мэдээлэл амжилттай шинэчлэгдлээ.</p> : null}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges || isPending} className="min-w-[140px]">
            {isPending ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfileInformationsPage() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: updateUser, isPending, isSuccess } = useUpdateCurrentUser();

  const userKey = [
    currentUser?.id ?? currentUser?.email ?? "anonymous",
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.phone,
  ]
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value))
    .join("|");

  return (
    <AppShell
      title="Хувийн мэдээлэл"
    >
      <ProfileInformationsForm
        key={userKey}
        currentUser={currentUser}
        updateUser={updateUser}
        isPending={isPending}
        isSuccess={isSuccess}
      />
    </AppShell>
  );
}
