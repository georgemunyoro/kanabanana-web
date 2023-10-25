import AddListInput from "@/components/Board/AddListInput";
import Navbar from "@/components/NavBar";
import { useAuthStore } from "@/store/auth";
import classNames from "classnames";
import React, { useState } from "react";
import Board from "@/components/Board";
import useBoard from "@/components/Board/useBoard";

export default function BoardPage() {
  const { user } = useAuthStore();
  const { board, addList } = useBoard();

  const [isAddingList, setIsAddingList] = useState(false);

  const showEmpty = board?.lists.length == 0;

  if (!user || !board) return <></>;

  return (
    <div className="h-screen flex flex-col gap-4">
      <Navbar />

      <span className={classNames(!showEmpty && "hidden", "h-screen w-screen")}>
        {showEmpty && (
          <div className="text-slate-400 w-full h-3/4 flex flex-col gap-4 items-center justify-center">
            <span className="text-9xl animate-bounce">🫙</span>
            <span className="text-xl">Oh my, such empty...</span>

            <button
              onClick={() => setIsAddingList(true)}
              className="bg-yellow-400 text-black p-2 rounded-md !text-xl hover:scale-105 duration-150"
            >
              + New List
            </button>
            {isAddingList && (
              <AddListInput
                onFinished={(newListName) => {
                  if (newListName) addList(newListName);
                  setIsAddingList(false);
                }}
              />
            )}
          </div>
        )}
      </span>

      <div
        className={classNames(
          "flex w-full h-full overflow-x-auto pt-0",
          showEmpty && "hidden"
        )}
      >
        <Board />
      </div>
    </div>
  );
}
