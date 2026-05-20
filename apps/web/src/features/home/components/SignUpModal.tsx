"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRegisterUser } from "@web/lib/hooks/useApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from "@web/components/ui";
import { PhoneSignInForm } from "@web/features/auth/PhoneSignInForm";
import { isFirebasePhoneAuthConfigured } from "@web/lib/firebase/client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SignupModal({ open, onClose }: Props) {
  const t = useTranslations("auth.signUpModal");
  const tPhone = useTranslations("auth.phone");
  const phoneEnabled = isFirebasePhoneAuthConfigured();
  const [step, setStep] = useState<1 | 2 | 3 | 'phone'>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const registerMutation = useRegisterUser();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    if (!acceptedTerms) {
      setError("Үйлчилгээний нөхцөл болон нууцлалын бодлогыг зөвшөөрөх шаардлагатай.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await registerMutation.mutateAsync({ email, password, accountType, firstName, lastName, phone, acceptedTerms });
      alert(t("success"));
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t("title")}</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              aria-label={t("close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {step !== 1 && step !== 'phone' ? (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-1 inline-flex items-center gap-2 text-sm text-muted-foreground"
            onClick={() => setStep((step as number) - 1 as 1 | 2)}
          >
            {t("goBack")}
          </Button>
        ) : null}

        {step === 1 && (
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-center" onClick={() => signIn("google")}>
              {t("google")}
            </Button>
            <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700" onClick={() => signIn("facebook")}>
              {t("facebook")}
            </Button>

            <div className="flex items-center gap-2 text-muted-foreground text-sm justify-center">
              <div className="h-px bg-border flex-1" /> {t("or")} <div className="h-px bg-border flex-1" />
            </div>

            <Button variant="outline" className="w-full justify-center" onClick={() => setStep(2)}>
              {t("emailSignup")}
            </Button>
            {phoneEnabled && (
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => setStep('phone')}
              >
                {tPhone("signupEntry")}
              </Button>
            )}
          </div>
        )}

        {step === 'phone' && (
          <PhoneSignInForm
            mode="login"
            onSuccess={onClose}
            onCancel={() => setStep(1)}
          />
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-center font-semibold">{t("selectAccountType")}</h3>

            <Button variant="outline" className="w-full justify-center" onClick={() => { setAccountType(t("accountIndividual")); setStep(3); }}>
              {t("accountIndividual")}
            </Button>

            <div className="flex items-center justify-center text-muted-foreground text-sm">- {t("or")} -</div>

            <Button variant="outline" className="w-full justify-center" onClick={() => { setAccountType(t("accountFreelancer")); setStep(3); }}>
              {t("accountFreelancer")}
            </Button>

            <Button variant="outline" className="w-full justify-center" onClick={() => { setAccountType(t("accountCompany")); setStep(3); }}>
              {t("accountCompany")}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-2">{t("stepIndicator")}</p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder={t("lastNamePlaceholder")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              type="text"
              placeholder={t("firstNamePlaceholder")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              type="tel"
              placeholder={t("phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label className="flex items-start gap-2 text-sm text-foreground/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border border-input accent-primary"
              />
              <span>
                Би{" "}
                <Link href="/cgu" target="_blank" className="text-primary underline underline-offset-2 hover:opacity-80">
                  үйлчилгээний нөхцөл
                </Link>{" "}
                болон{" "}
                <Link href="/confidentialite" target="_blank" className="text-primary underline underline-offset-2 hover:opacity-80">
                  нууцлалын бодлогыг
                </Link>{" "}
                уншиж, зөвшөөрч байна.
              </span>
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleRegister}
              disabled={loading || !acceptedTerms}
              className="w-full justify-center"
            >
              {loading ? t("submitting") : t("submit")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
