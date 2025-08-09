"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import SignupModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import NewListingModal from "./NewListingModal";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openNewListingModal, setOpenNewListingModal] = useState(false); // 
  return (
    <header className="border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/favicon.ico" alt="logo" className="w-10 h-12" />
          <Link href="/" className="text-xl font-bold text-blue-700">
            Tusch.mn
          </Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setOpen(!open)}>
            <Menu className="w-10 h-10 text-blue-600" />
          </button>
        </div>

<nav className="hidden md:flex items-end gap-10 text-sm text-blue-800">
  <Link href="/offreurs" className="flex flex-col items-center hover:text-blue-600 transition">
    <div className="text-2xl">👥</div>
    <span className="text-xs mt-1 font-medium">Үйлчилгээ үзүүлэгч</span>
  </Link>

  <button
    onClick={() => setOpenNewListingModal(true)}
    className="flex flex-col items-center group"
  >
    <div className="w-8 h-8 rounded-full bg-green-400 text-white flex items-center justify-center text-lg font-bold group-hover:bg-green-500 transition">
      +
    </div>
    <span className="text-xs font-medium text-blue-800 mt-1">Зар нэмэх</span>
  </button>
  <NewListingModal open={openNewListingModal} onClose={() => setOpenNewListingModal(false)} />

  <Link href="/messages" className="flex flex-col items-center hover:text-blue-600 transition">
    <div className="text-2xl">💬</div>
    <span className="text-xs mt-1 font-medium">Мессеж</span>
  </Link>
</nav>


        <div className="hidden md:flex gap-2">
          <button className="text-sm px-3 py-1 border rounded hover:bg-gray-100 transition" onClick={() => setOpenLoginModal(true)}>Нэвтрэх</button>
          <LoginModal open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
          <button onClick={() => setOpenSignUpModal(true)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Бүртгүүлэх</button>
          <SignupModal open={openSignUpModal} onClose={() => setOpenSignUpModal(false)} />
        </div>
      </div>

      {/* mobile nav */}
      {open && (
        <nav className="md:hidden mt-3 flex flex-col gap-2 text-sm text-gray-800">
          <Link href="/annonces">Зар</Link>
          <Link href="/categories">Ангилалууд</Link>
          <Link href="/about">Бидний тухай</Link>
          <button className="text-sm px-3 py-1 border rounded" onClick={() => setOpenLoginModal(true)}>Нэвтрэх</button>
          <LoginModal open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
          <button onClick={() => setOpenSignUpModal(true)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Бүртгүүлэх</button>
          <SignupModal open={openSignUpModal} onClose={() => setOpenSignUpModal(false)} />
        </nav>
      )}
    </header>
  );
}
