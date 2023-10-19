import { useAuthStore } from "@/store/auth";
import autoAnimate from "@formkit/auto-animate";
import classNames from "classnames";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";

export default function Login() {
  const { user, login } = useAuthStore();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const parent = useRef(null);

  const onLogin = useCallback(() => {
    setIsLoading(true);
    login(email, password)
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [email, login, password]);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const router = useRouter();

  useEffect(() => {
    if (user != null) {
      router.push("/");
    }
  }, [router, user]);

  if (user != null) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-3 p-4 w-full h-screen items-center justify-center">
      <div className="flex flex-col gap-2 w-96 px-8" ref={parent}>
        {
          // eslint-disable-next-line react/jsx-no-comment-textnodes
          <h1 className="text-xl text-slate-100">// Login</h1>
        }
        <input
          className="border-2 p-2 w-full outline-none"
          placeholder="user@domain.tld"
          type="email"
          onChange={(v) => setEmail(v.target.value)}
          value={email}
          disabled={isLoading}
        />
        <input
          className="border-2 p-2 w-full outline-none"
          placeholder="Password"
          type="password"
          onChange={(v) => setPassword(v.target.value)}
          value={password}
          disabled={isLoading}
        />
        <button
          onClick={onLogin}
          disabled={(password?.length || 0) < 8 || email === ""}
          className={classNames(
            isLoading && "animate-pulse",
            "mt-3 disabled:bg-gray-500 disabled:text-gray-900 bg-black text-white w-full p-2 py-3 hover:bg-yellow-400 hover:text-black duration-100 active:bg-yellow-500"
          )}
        >
          {isLoading ? "..." : "Login"}
        </button>
        <button
          onClick={() => router.push("/register")}
          className="underline text-yellow-500 pt-4"
        >
          I don&apos;t have an account.
        </button>
      </div>
    </div>
  );
}
