import React, { useEffect, useState } from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useAuthStore } from "@/store/auth";
import { http } from "@/api";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function App({ Component, pageProps }: AppProps) {
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setIsLoading(true);
    if (!user && savedToken) {
      http
        .get("/auth/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        })
        .then(({ data }) => {
          useAuthStore.setState({
            user: data.data,
            token: savedToken,
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        });
    }

    if (user || (!user && !savedToken))
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-slate-900 font-mono">
      {isLoading ? (
        <div className="w-screen h-screen flex items-center justify-center animate-bounce text-5xl">
          🍌
        </div>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <Component {...pageProps} />
        </DndProvider>
      )}
    </div>
  );
}
