"use client";

import { useMemo, useState } from "react";
import AppShell from "@web/components/layout/AppShell";
import { useChangePassword, useCurrentUser, useUpdateCurrentUser } from "@web/lib/hooks/useApi";
import { Button, Card, CardContent, Input } from "@web/components/ui";

type ProfileIdentifiantsFormProps = {
  currentUser: ReturnType<typeof useCurrentUser>["data"];
  updateUser: ReturnType<typeof useUpdateCurrentUser>["mutate"];
  savingContact: boolean;
  contactSuccess: boolean;
  changePassword: ReturnType<typeof useChangePassword>["mutate"];
  savingPassword: boolean;
  passwordSuccess: boolean;
};

function ProfileIdentifiantsForm({
  currentUser,
  updateUser,
  savingContact,
  contactSuccess,
  changePassword,
  savingPassword,
  passwordSuccess,
}: ProfileIdentifiantsFormProps) {
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [contactError, setContactError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const hasContactChanges = useMemo(() => {
    return email !== (currentUser?.email || "") || phone !== (currentUser?.phone || "");
  }, [email, phone, currentUser]);

  const handleContactSave = () => {
    if (!currentUser) return;
    setContactError(null);
    updateUser(
      { email, phone },
      {
        onError: (err) => setContactError(err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу."),
      }
    );
  };

  const handlePasswordSave = () => {
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("Шинэ нууц үг хамгийн багадаа 8 тэмдэгттэй байх ёстой.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Шинэ нууц үг хоорондоо таарахгүй байна.");
      return;
    }
    changePassword(
      { currentPassword, newPassword },
      {
        onError: (err) => setPasswordError(err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу."),
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
        },
      }
    );
  };

  return (
    <>
      <Card className="border border-border/80">
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Имэйл / Утас</h2>
          </div>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">Имэйл</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Имэйл" />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">Утасны дугаар</span>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Утасны дугаар" />
          </label>
          {contactError ? <p className="text-sm text-red-600">{contactError}</p> : null}
          {contactSuccess && !savingContact ? <p className="text-sm text-green-600">Холбоо барих мэдээлэл амжилттай шинэчлэгдлээ.</p> : null}
          <div className="flex justify-end">
            <Button onClick={handleContactSave} disabled={!hasContactChanges || savingContact} className="min-w-35">
              {savingContact ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/80">
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Нууц үг солих</h2>
          </div>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">Одоогийн нууц үг</span>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="********"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">Шинэ нууц үг</span>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="********"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">Шинэ нууц үг давтах</span>
            <Input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="********"
            />
          </label>
          {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
          {passwordSuccess && !savingPassword ? <p className="text-sm text-green-600">Нууц үг амжилттай шинэчлэгдлээ.</p> : null}
          <div className="flex justify-end">
            <Button onClick={handlePasswordSave} disabled={savingPassword} className="min-w-35">
              {savingPassword ? "Шинэчилж байна..." : "Нууц үг солих"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function ProfileIdentifiantsPage() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: updateUser, isPending: savingContact, isSuccess: contactSuccess } = useUpdateCurrentUser();
  const { mutate: changePassword, isPending: savingPassword, isSuccess: passwordSuccess } = useChangePassword();

  const userKey = [
    currentUser?.id ?? currentUser?.email ?? "anonymous",
    currentUser?.email,
    currentUser?.phone,
  ]
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value))
    .join("|");

  return (
    <AppShell
      title="Нэвтрэх мэдээлэл"
    >
      <ProfileIdentifiantsForm
        key={userKey}
        currentUser={currentUser}
        updateUser={updateUser}
        savingContact={savingContact}
        contactSuccess={contactSuccess}
        changePassword={changePassword}
        savingPassword={savingPassword}
        passwordSuccess={passwordSuccess}
      />
    </AppShell>
  );
}
