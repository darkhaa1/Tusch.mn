"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, Users, MessageCircle, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import SignupModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import NewListingModal from "../listings/NewListingModal";
import { useCurrentUser } from "../hooks/useApi";
import resolveAvatarUrl from "../lib/resolveImageUrl";
import { Button, buttonVariants } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "./ui/sheet";
import { cn } from "../lib/utils";

const navItems = [
  { href: "/offreurs", label: "Үйлчилгээ үзүүлэгчид", icon: Users },
  { href: "/messages", label: "Мессеж", icon: MessageCircle },
];

const mobileNav = [
  { href: "/annonces", label: "Зар" },
  { href: "/categories", label: "Ангилалууд" },
  { href: "/about", label: "Бидний тухай" },
  { href: "/offreurs", label: "Үйлчилгээ үзүүлэгчид" },
  { href: "/messages", label: "Мессеж" },
];

export default function Header() {
  const { data: session } = useSession();
  const { data: backendUser } = useCurrentUser();
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openNewListingModal, setOpenNewListingModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!session?.user || !!backendUser;
  const user = (backendUser as any) || (session?.user as any);

  const firstName = user?.firstname || user?.firstName || user?.name?.split(" ")?.[0] || "";
  const avatar = resolveAvatarUrl(user?.avatarUrl || user?.image || null);
  const initials =
    (firstName?.[0] || (user?.lastname || user?.lastName || user?.name?.split(" ")?.[1] || "")?.[0] || "U")?.toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.ico" alt="Tusch.mn" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-semibold text-foreground">Tusch.mn</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenNewListingModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Зар нэмэх
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Цэс нээх"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Button
            className="gap-2"
            onClick={() => setOpenNewListingModal(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Зар нэмэх
          </Button>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Link
              href="/profile"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "gap-2 rounded-full px-2"
              )}
            >
              <Avatar className="h-9 w-9">
                {avatar ? (
                  <AvatarImage src={avatar} alt={firstName || "Profile"} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {firstName || "Профайл"}
              </span>
            </Link>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenLoginModal(true)}
              >
                Нэвтрэх
              </Button>
              <Button size="sm" onClick={() => setOpenSignUpModal(true)}>
                Бүртгүүлэх
              </Button>
            </>
          )}
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Цэс</SheetTitle>
            <SheetDescription>Танд хэрэгтэй зүйл рүү түргэн очно.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 p-4">
            {mobileNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start text-base"
                )}
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ variant: "outline" }), "justify-start text-base")}
              >
                Профайл
              </Link>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenLoginModal(true);
                    setMobileOpen(false);
                  }}
                >
                  Нэвтрэх
                </Button>
                <Button
                  onClick={() => {
                    setOpenSignUpModal(true);
                    setMobileOpen(false);
                  }}
                >
                  Бүртгүүлэх
                </Button>
              </div>
            )}
          </div>
          <SheetFooter>
            <Button
              className="w-full gap-2"
              onClick={() => {
                setOpenNewListingModal(true);
                setMobileOpen(false);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Зар нэмэх
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <LoginModal open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
      <SignupModal open={openSignUpModal} onClose={() => setOpenSignUpModal(false)} />
      <NewListingModal isOpen={openNewListingModal} onClose={() => setOpenNewListingModal(false)} />
    </header>
  );
}
