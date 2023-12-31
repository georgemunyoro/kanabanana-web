import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/router";
import Navbar from "@/components/NavBar";
import AddBoardInput from "@/components/AddBoardInput";
import { useBoardStore } from "@/store/board";

export default function Home() {
  const router = useRouter();
  const { user, getUser } = useAuthStore();

  useEffect(() => {
    if (user == null) router.push("/login");

    useBoardStore.setState({
      board: null,
    });
  }, [router, user]);

  const [isAddingBoard, setIsAddingBoard] = useState(false);

  const onClickBoard = (boardId: number) => {
    router.push(`/board/${boardId}`);
  };

  if (!user) return <></>;

  return (
    <div className="h-screen flex flex-col gap-8">
      <Navbar />
      <div className="p-3 gap-4 flex flex-col px-10">
        {
          // eslint-disable-next-line react/jsx-no-comment-textnodes
          <h1 className="text-xl text-slate-100">// Boards</h1>
        }

        <span className="text-slate-100 text-lg flex gap-4 items-center">
          <button
            onClick={() => setIsAddingBoard(true)}
            className="bg-yellow-400 text-black p-2 rounded-md !text-base hover:scale-105 duration-150"
          >
            + New Board
          </button>
          {isAddingBoard && (
            <AddBoardInput
              onFinished={() => {
                setIsAddingBoard(false);
                getUser();
              }}
            />
          )}
        </span>

        <div className="flex flex-col gap-2">
          {user.boards.map((board) => (
            <div
              onClick={() => onClickBoard(board.id)}
              key={board.name}
              className="border w-fit p-3 hover:bg-yellow-300 hover:border-black cursor-pointer bg-gray-200 flex justify-between gap-10 hover:scale-105 duration-150"
            >
              <span>{board.name}</span>
              <span className="text-gray-400">
                {new Date(board.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
