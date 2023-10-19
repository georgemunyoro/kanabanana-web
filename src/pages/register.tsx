import { useRouter } from "next/router";
import React, { useState } from "react";

export default function Register() {
  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [password2, setPassword2] = useState<string>();

  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 p-4 w-full h-screen items-center justify-center">
      <div className="flex flex-col gap-2 w-96 px-8">
        {
          // eslint-disable-next-line react/jsx-no-comment-textnodes
          <h1 className="text-xl text-slate-100">// Sign up 🎉</h1>
        }
        <input
          className="border-2 p-2 w-full outline-none"
          placeholder="Name"
          onChange={(v) => setName(v.target.value)}
          value={name}
        />
        <input
          className="border-2 p-2 w-full outline-none"
          placeholder="user@domain.tld"
          type="email"
          onChange={(v) => setEmail(v.target.value)}
          value={email}
        />
        <input
          className="border-2 p-2 w-full outline-none"
          placeholder="Password"
          type="password"
          onChange={(v) => setPassword(v.target.value)}
          value={password}
        />
        <input
          className="border-2 p-2 w-full outline-none"
          placeholder="Confirm Password"
          type="password"
          onChange={(v) => setPassword2(v.target.value)}
          value={password2}
        />
        <button
          disabled={
            password !== password2 ||
            (password?.length || 0) < 8 ||
            email === ""
          }
          className="mt-3 disabled:bg-gray-500 disabled:text-gray-900 bg-black text-white w-full p-2 py-3 hover:bg-yellow-400 hover:text-black duration-100 active:bg-yellow-500"
        >
          Sign up
        </button>
        <button
          onClick={() => router.push("/login")}
          className="underline text-yellow-500 pt-4"
        >
          I already have an account.
        </button>
      </div>
    </div>
  );
}
