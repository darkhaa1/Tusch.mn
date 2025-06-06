"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import SignupModal from "./SignUpModal";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
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

        <nav className="hidden md:flex gap-6 text-sm text-gray-800">
          <Link href="/annonces" className=" hover:text-blue-600 transition">Зар</Link>
          <Link href="/categories" className=" hover:text-blue-600 transition">Ангилалууд</Link>
          <Link href="/about" className=" hover:text-blue-600 transition">Бидний тухай</Link>
        </nav>

        <div className="hidden md:flex gap-2">
          <button className="text-sm px-3 py-1 border rounded hover:bg-gray-100 transition">Нэвтрэх</button>
          <button onClick={() => setOpenModal(true)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Бүртгүүлэх</button>
          <SignupModal open={openModal} onClose={() => setOpenModal(false)} />
        </div>
      </div>

      {/* mobile nav */}
      {open && (
        <nav className="md:hidden mt-3 flex flex-col gap-2 text-sm text-gray-800">
          <Link href="/annonces">Зар</Link>
          <Link href="/categories">Ангилалууд</Link>
          <Link href="/about">Бидний тухай</Link>
          <button className="text-sm px-3 py-1 border rounded">Нэвтрэх</button>
          <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Бүртгүүлэх</button>
        </nav>
      )}
    </header>
  );
}
