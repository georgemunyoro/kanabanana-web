import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/router";
import React from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <div className="flex h-12 bg-slate-400 px-10 items-center gap-4 justify-between">
      <button
        className="font-bold text-yellow-500 bg-slate-900 p-3"
        onClick={() => router.push("/")}
      >
        {"🍌 Kanabanana"}
      </button>
      {user && (
        <>
          <span className="flex gap-4">Hi, {user.name} 👋</span>
          <span className="flex gap-4">
            <span>{user.email}</span>
            <button onClick={logout} className="underline">
              🪵 Log out
            </button>
          </span>{" "}
        </>
      )}
    </div>
  );
}
