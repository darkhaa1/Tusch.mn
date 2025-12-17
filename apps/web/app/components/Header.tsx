'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import SignupModal from './SignUpModal';
import LoginModal from './LoginModal';
import NewListingModal from './NewListingModal';
import { useSession } from 'next-auth/react';
import { useCurrentUser } from '../hooks/useApi';
import resolveAvatarUrl from '../profile/components/avatarUrl';

export default function Header() {
  const { data: session } = useSession();
  const { data: backendUser } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openNewListingModal, setOpenNewListingModal] = useState(false);

  const isLoggedIn = !!session?.user || !!backendUser;
  const user = (backendUser as any) || (session?.user as any);

  const firstName = user?.firstname || user?.firstName || user?.name?.split(' ')?.[0] || '';
  const avatar = resolveAvatarUrl(user?.avatarUrl || user?.image || null);
  const initials = (firstName?.[0] || (user?.lastname || user?.lastName || user?.name?.split(' ')?.[1] || '')?.[0] || '🙂').toUpperCase();

  return (
    <header className="border-b px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
          <img src="/favicon.ico" alt="logo" className="h-12 w-10" />
          <Link href="/" className="text-xl font-bold text-blue-700">
            Tusch.mn
          </Link>
        </div>

        {/* Burger (mobile) */}
        <div className="md:hidden">
          <button aria-label="Оруулах цэс" onClick={() => setMobileOpen((v) => !v)}>
            <Menu className="h-10 w-10 text-blue-600" />
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-end gap-10 text-sm text-blue-800 md:flex">
          <Link href="/offreurs" className="flex flex-col items-center transition hover:text-blue-600">
            <div className="text-2xl">👥</div>
            <span className="mt-1 text-xs font-medium">Үйлчилгээ үзүүлэгчид</span>
          </Link>

          <button onClick={() => setOpenNewListingModal(true)} className="group flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-400 text-lg font-bold text-white transition group-hover:bg-green-500">
              +
            </div>
            <span className="mt-1 text-xs font-medium text-blue-800">Зар нэмэх</span>
          </button>

          <Link href="/messages" className="flex flex-col items-center transition hover:text-blue-600">
            <div className="text-2xl">💬</div>
            <span className="mt-1 text-xs font-medium">Мессеж</span>
          </Link>
        </nav>

        {/* Auth / Profile button */}
        <div className="hidden gap-2 md:flex">
          {isLoggedIn ? (
            <Link href="/profile" className="flex items-center gap-2 rounded-full border px-2 py-1 text-sm transition hover:bg-gray-100">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-gray-700">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <span className="font-medium text-gray-800">{firstName || 'Профайл'}</span>
            </Link>
          ) : (
            <>
              <button
                className="rounded border px-3 py-1 text-sm transition hover:bg-gray-100"
                onClick={() => setOpenLoginModal(true)}
              >
                Нэвтрэх
              </button>
              <button
                onClick={() => setOpenSignUpModal(true)}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
              >
                Бүртгүүлэх
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="mt-3 flex flex-col gap-2 text-sm text-gray-800 md:hidden">
          <Link href="/annonces" onClick={() => setMobileOpen(false)}>Зар</Link>
          <Link href="/categories" onClick={() => setMobileOpen(false)}>Ангилалууд</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>Бидний тухай</Link>

          {isLoggedIn ? (
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="rounded bg-blue-600 px-3 py-1 text-left text-sm text-white"
            >
              Профайл
            </Link>
          ) : (
            <>
              <button
                className="rounded border px-3 py-1 text-left text-sm"
                onClick={() => {
                  setOpenLoginModal(true);
                  setMobileOpen(false);
                }}
              >
                Нэвтрэх
              </button>
              <button
                onClick={() => {
                  setOpenSignUpModal(true);
                  setMobileOpen(false);
                }}
                className="rounded bg-blue-600 px-3 py-1 text-left text-sm text-white"
              >
                Бүртгүүлэх
              </button>
            </>
          )}

          {/* Mobile Зар нэмэх */}
          <button
            onClick={() => {
              setOpenNewListingModal(true);
              setMobileOpen(false);
            }}
            className="rounded border px-3 py-1 text-left text-sm"
          >
            Зар нэмэх
          </button>
        </nav>
      )}

      {/* Modals */}
      <LoginModal open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
      <SignupModal open={openSignUpModal} onClose={() => setOpenSignUpModal(false)} />
      <NewListingModal isOpen={openNewListingModal} onClose={() => setOpenNewListingModal(false)} />
    </header>
  );
}
