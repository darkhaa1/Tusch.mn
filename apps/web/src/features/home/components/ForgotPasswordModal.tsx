"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from "@web/components/ui";
import { useForgotPassword } from "@web/lib/hooks/useApi";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({ open, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const forgotPasswordMutation = useForgotPassword();
  const router = useRouter();

  const handleEmailSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!email || !email.includes("@")) {
      setError("Зөв имэйл хаяг оруулна уу");
      return;
    }

    try {
      const response = await forgotPasswordMutation.mutateAsync(email);

      // In development mode, if token is returned, show step 2
      if (response.token) {
        setToken(response.token);
        setStep(2);
      } else {
        // In production mode, just show success message
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Алдаа гарлаа");
    }
  };

  const handleNavigateToReset = () => {
    router.push(`/reset-password?token=${token}`);
    onClose();
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
  };

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setToken("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="relative w-full max-w-lg rounded-lg border border-border/80 bg-background p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Хаах</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Нууц үг сэргээх</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === 1
              ? "Бүртгэлтэй имэйл хаягаа оруулна уу"
              : "Нууц үг солих хуудас руу очино уу"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Имэйл хаяг
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  disabled={forgotPasswordMutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEmailSubmit();
                    }
                  }}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {success && (
                <div className="rounded-md bg-green-50 border border-green-200 p-4">
                  <p className="text-sm text-green-800">
                    Имэйл илгээлээ. Линкээ шалгана уу.
                  </p>
                </div>
              )}

              <Button
                onClick={handleEmailSubmit}
                disabled={forgotPasswordMutation.isPending}
                className="w-full"
              >
                {forgotPasswordMutation.isPending ? "Илгээж байна..." : "Илгээх"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="token" className="text-sm font-medium text-foreground">
                  Нууцлал токен (зөвхөн хөгжүүлэлтийн горим)
                </label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  readOnly
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Энэ токеныг ашиглан нууц үгээ солино уу
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopyToken} variant="outline" className="flex-1">
                  Токен хуулах
                </Button>
                <Button onClick={handleNavigateToReset} className="flex-1">
                  Нууц үг солих хуудас руу очих
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
