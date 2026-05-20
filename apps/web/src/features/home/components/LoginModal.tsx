'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLoginUser } from '@web/lib/hooks/useApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from '@web/components/ui';
import ForgotPasswordModal from './ForgotPasswordModal';
import { PhoneSignInForm } from '@web/features/auth/PhoneSignInForm';
import { isFirebasePhoneAuthConfigured } from '@web/lib/firebase/client';

type Mode = 'choice' | 'email' | 'phone';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LoginModal({ open, onClose }: Props) {
  const t = useTranslations('auth.loginModal');
  const tPhone = useTranslations('auth.phone');
  const [mode, setMode] = useState<Mode>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLoginUser();
  const phoneEnabled = isFirebasePhoneAuthConfigured();

  const handleEmailLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await loginMutation.mutateAsync({ email, password });
      onClose();
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || t('defaultError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t('title')}</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              aria-label={t('close')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <DialogDescription>
            {mode === 'email' ? t('descriptionEmail') : t('descriptionMethods')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {mode === 'choice' && (
            <>
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => signIn('google', { callbackUrl: '/profile' })}
              >
                {t('google')}
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground text-sm justify-center">
                <div className="h-px bg-border flex-1" /> {t('or')}{' '}
                <div className="h-px bg-border flex-1" />
              </div>
              <Button className="w-full justify-center" onClick={() => setMode('email')}>
                {t('emailLogin')}
              </Button>
              {phoneEnabled && (
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => setMode('phone')}
                >
                  {tPhone('loginEntry')}
                </Button>
              )}
            </>
          )}

          {mode === 'email' && (
            <>
              <Input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="space-y-1">
                <Input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="text-sm text-primary hover:underline text-right w-full"
                  onClick={() => setShowForgotPassword(true)}
                >
                  {t('forgotPassword')}
                </button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full justify-center"
              >
                {loading ? t('submitting') : t('submit')}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-center text-sm text-muted-foreground"
                onClick={() => setMode('choice')}
              >
                {t('goBack')}
              </Button>
            </>
          )}

          {mode === 'phone' && (
            <PhoneSignInForm
              mode="login"
              onSuccess={onClose}
              onCancel={() => setMode('choice')}
            />
          )}
        </div>
      </DialogContent>

      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </Dialog>
  );
}
