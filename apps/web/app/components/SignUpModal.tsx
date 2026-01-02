// components/SignupModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRegisterUser } from "../hooks/useApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SignupModal({ open, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState("");
  const registerMutation = useRegisterUser();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Нууц үг тохирохгүй байна");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await registerMutation.mutateAsync({ email, password, accountType, firstName, lastName, phone });
      alert("Амжилттай бүртгэлээ!");
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
            <DialogTitle>Бүртгүүлээрэй!</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              aria-label="Хаах"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <DialogDescription>
            Таны хорооны оршин суугчид, мэргэжилтнүүд таны хэрэгцээнд хариу өгөнө.
          </DialogDescription>
        </DialogHeader>

        {step > 1 ? (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-1 inline-flex items-center gap-2 text-sm text-muted-foreground"
            onClick={() => setStep(step - 1)}
          >
            ← Буцах
          </Button>
        ) : null}

        {step === 1 && (
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-center" onClick={() => signIn("google")}>
              Google-ээр холбогдох
            </Button>
            <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700" onClick={() => signIn("facebook")}>
              Facebook-ээр үргэлжлүүлэх
            </Button>

            <div className="flex items-center gap-2 text-gray-400 text-sm justify-center">
              <div className="h-px bg-gray-300 flex-1" /> эсвэл <div className="h-px bg-gray-300 flex-1" />
            </div>

            <Button variant="outline" className="w-full justify-center" onClick={() => setStep(2)}>
              И-мэйл хаягаар бүртгүүлэх
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-center font-semibold">Би бүртгүүлэх төрөл:</h3>

            <Button variant="outline" className="w-full justify-center" onClick={() => { setAccountType("Хувь хүн"); setStep(3); }}>
              Хувь хүн
            </Button>

            <div className="flex items-center justify-center text-gray-400 text-sm">— эсвэл —</div>

            <Button variant="outline" className="w-full justify-center" onClick={() => { setAccountType("Хувиараа хөдөлмөр эрхлэгч"); setStep(3); }}>
              Бие даан ажиллагч / Хувиараа хөдөлмөр эрхлэгч
            </Button>

            <Button variant="outline" className="w-full justify-center" onClick={() => { setAccountType("Байгууллага"); setStep(3); }}>
              Байгууллага
            </Button>

            <p className="text-center text-xs text-gray-400 mt-2">2 үе шатны 1-р алхам</p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Овог"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Нэр"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              type="tel"
              placeholder="Утасны дугаар"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Имэйл хаяг"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Нууц үг давтах"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full justify-center"
            >
              {loading ? "Түр хүлээнэ үү…" : "Бүртгүүлэх"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
