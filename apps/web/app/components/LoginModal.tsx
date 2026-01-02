'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLoginUser } from '../hooks/useApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
  const router = useRouter();
  const loginMutation = useLoginUser();

  const handleEmailLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await loginMutation.mutateAsync({ email, password });
      onClose();
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Нэвтрэх</DialogTitle>
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
            {showForm ? 'Имэйлээр нэвтрэх' : 'Нэвтрэх аргаа сонгоно уу'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {!showForm ? (
            <>
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => signIn('google', { callbackUrl: '/profile' })}
              >
                Google-ээр холбогдох
              </Button>
              <div className="flex items-center gap-2 text-gray-400 text-sm justify-center">
                <div className="h-px bg-gray-300 flex-1" /> эсвэл <div className="h-px bg-gray-300 flex-1" />
              </div>
              <Button className="w-full justify-center" onClick={() => setShowForm(true)}>
                Имэйлээр нэвтрэх
              </Button>
            </>
          ) : (
            <>
              <Input
                type="email"
                placeholder="Имэйл"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Нууц үг"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full justify-center"
              >
                {loading ? 'Түр хүлээнэ үү…' : 'Нэвтрэх'}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-center text-sm text-muted-foreground"
                onClick={() => setShowForm(false)}
              >
                ← Буцах
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
