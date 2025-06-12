import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LoginModal({ open, onClose }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleEmailLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3310/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Нэвтрэхэд алдаа гарлаа');

      alert('Амжилттай нэвтэрлээ!');
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

        <h2 className="text-xl font-bold text-center mb-2">Нэвтрэх</h2>
        <p className="text-center text-gray-600 mb-4">
          {showForm ? 'Имэйлээр нэвтрэх' : 'Нэвтрэх аргаа сонгоно уу'}
        </p>

        <div className="space-y-3">
          {!showForm ? (
            <>
              <button
                className="w-full border rounded-full flex items-center justify-center py-2 font-medium hover:bg-gray-100"
                onClick={() => signIn('google')}
              >
                Google-ээр холбогдох
              </button>
              <div className="flex items-center gap-2 text-gray-400 text-sm justify-center">
                <div className="h-px bg-gray-300 flex-1" /> эсвэл <div className="h-px bg-gray-300 flex-1" />
              </div>
              <button
                className="w-full bg-black text-white rounded-full py-2 font-medium hover:bg-gray-800"
                onClick={() => setShowForm(true)}
              >
                Имэйлээр нэвтрэх
              </button>
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Имэйл"
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-black text-white rounded-full py-2 font-medium hover:bg-gray-800"
              >
                {loading ? 'Түр хүлээнэ үү…' : 'Нэвтрэх'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="w-full text-sm text-gray-500 hover:underline text-center mt-2"
              >
                ← Буцах
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
