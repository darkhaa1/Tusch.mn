'use client';

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import ProfileTabs from "./components/ProfileTabs";
import { logout } from "../lib/logout";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = () => logout(router, queryClient);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Миний Профайл</h1>
      <ProfileTabs />
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Гарах
      </button>
    </div>
  );
}
