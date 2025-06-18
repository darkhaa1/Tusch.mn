// components/SignupModal.tsx
"use client";
import { useState } from 'react';
import { X } from 'lucide-react';
import { signIn } from 'next-auth/react';
type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SignupModal({ open, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState('');

  if (!open) return null;

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Нууц үг тохирохгүй байна');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3310/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, accountType, firstName, lastName, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Бүртгэхэд алдаа гарлаа');

      alert('Амжилттай бүртгэгдлээ!');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={20} />
        </button>

        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="absolute top-4 left-4 text-xl text-gray-600 hover:text-black">
            <span className="inline-block text-2xl font-bold">←</span>
          </button>
        )}

        <h2 className="text-xl font-bold text-center mb-2">Бүртгүүлээрэй!</h2>
        <p className="text-center text-gray-600 mb-4">
          Таны хорооны оршин суугчид, мэргэжилтнүүд таны хэрэгцээнд хариу өгнө.
        </p>

        {step === 1 && (
          <div className="space-y-3">
            <button onClick={() => signIn('google')} className="w-full border rounded-full py-2 font-medium hover:bg-gray-100">
              Google-ээр холбогдох
            </button>
            <button onClick={() => signIn('facebook')} className="w-full bg-blue-600 text-white rounded-full py-2 font-medium hover:bg-blue-700">
              Facebook-ээр үргэлжлүүлэх
            </button>

            <div className="flex items-center gap-2 text-gray-400 text-sm justify-center">
              <div className="h-px bg-gray-300 flex-1" /> эсвэл <div className="h-px bg-gray-300 flex-1" />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full border rounded-full py-2 font-medium hover:bg-gray-100"
            >
              И-мэйл хаягаар бүртгүүлэх
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-center font-semibold">Би бүртгүүлэх төрөл:</h3>

            <button onClick={() => { setAccountType('Хувь хүн'); setStep(3); }} className="w-full border rounded-full py-2 font-medium hover:bg-gray-100">
              Хувь хүн
            </button>

            <div className="flex items-center justify-center text-gray-400 text-sm">— эсвэл —</div>

            <button onClick={() => { setAccountType('Хувиараа хөдөлмөр эрхлэгч'); setStep(3); }} className="w-full border rounded-full py-2 font-medium hover:bg-gray-100">
              Бие даан ажиллагч / Хувиараа хөдөлмөр эрхлэгч
            </button>

            <button onClick={() => { setAccountType('Байгууллага'); setStep(3); }} className="w-full border rounded-full py-2 font-medium hover:bg-gray-100">
              Байгууллага
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">2 үе шатны 1-р алхам</p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Овог"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Нэр"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="tel"
              placeholder="Утасны дугаар"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Имэйл хаяг"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Нууц үг давтах"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-black text-white rounded-full py-2 font-medium hover:bg-gray-800"
            >
              {loading ? 'Түр хүлээнэ үү…' : 'Бүртгүүлэх'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
