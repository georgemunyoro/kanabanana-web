import React, { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user == null) router.push("/login");
  }, [router, user]);

  if (!user) return <></>;

  const onClickBoard = (boardId: number) => {
    router.push(`/board/${boardId}`);
  };

  return (
    <div className="h-screen flex flex-col gap-8">
      <div className="flex h-12 bg-slate-400 px-10 items-center gap-4 justify-between">
        <button
          className="font-bold text-yellow-500 bg-slate-900 p-3"
          onClick={() => router.push("/")}
        >
          {"🍌Kanabanana"}
        </button>
        <span>Hi, {user.name} 👋</span>
        <span>{user.email}</span>
      </div>
      <div className="p-3 gap-4 flex flex-col px-10">
        {
          // eslint-disable-next-line react/jsx-no-comment-textnodes
          <h1 className="text-xl text-slate-100">// Boards</h1>
        }
        <div className="flex gap-2">
          {user.boards.map((board) => (
            <div
              onClick={() => onClickBoard(board.id)}
              key={board.name}
              className="border w-64 p-3 hover:bg-yellow-300 hover:border-black cursor-pointer bg-gray-200 flex justify-between"
            >
              <span>{board.name}</span>
              <span className="text-gray-400">
                {new Date(board.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 cursor-pointer hover:text-yellow-400 text-slate-400 underline">
          + New Board
        </div>
      </div>
    </div>
  );
}
