"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useResetPassword } from "@web/lib/hooks/useApi";
import { Button, Input, Card, CardContent } from "@web/components/ui";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    // Validation
    if (!newPassword || newPassword.length < 8) {
      setError("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Нууц үг тохирохгүй байна");
      return;
    }

    if (!token) {
      setError("Токен олдсонгүй");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword });
      setSuccess(true);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Токен буруу эсвэл хугацаа дууссан");
    }
  };

  // Show error if no token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Алдаа гарлаа</h1>
            <p className="text-sm text-muted-foreground">
              Нууц үг сэргээх токен олдсонгүй. Линкээ дахин шалгана уу.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Нүүр хуудас руу буцах
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Нууц үг сэргээх</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Шинэ нууц үгээ оруулна уу
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-800 font-medium">
                  Нууц үг амжилттай солигдлоо!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Та одоо шинэ нууц үгээрээ нэвтэрч болно. Нүүр хуудас руу шилжиж байна...
                </p>
              </div>
              <Link href="/">
                <Button className="w-full">
                  Нүүр хуудас руу очих
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                    Шинэ нууц үг
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Хамгийн багадаа 8 тэмдэгт"
                    disabled={resetPasswordMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Нууц үг баталгаажуулах
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Нууц үгээ дахин оруулна уу"
                    disabled={resetPasswordMutation.isPending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmit();
                      }
                    }}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={resetPasswordMutation.isPending}
                  className="w-full"
                >
                  {resetPasswordMutation.isPending ? "Солиж байна..." : "Нууц үг солих"}
                </Button>

                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Болих
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
