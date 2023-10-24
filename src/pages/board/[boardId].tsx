import { http } from "@/api";
import AddListInput from "@/components/AddListInput";
import ListBox from "@/components/List";
import Navbar from "@/components/NavBar";
import { useAutoAnimate } from "@/hooks/useAutoAnimate";
import { useAuthStore } from "@/store/auth";
import { useBoardStore } from "@/store/board";
import classNames from "classnames";
import { useRouter } from "next/router";
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDrop } from "react-dnd";
import Board from "@/components/Board";

export default function BoardPage() {
  const { user, token } = useAuthStore();
  const { board, get: getBoard } = useBoardStore();
  const router = useRouter();

  const [listOrder, setListOrder] = useState("");

  useEffect(() => {
    if (board?.id.toString() !== router.query.boardId || board == null) {
      getBoard(parseInt(router.query.boardId as string))
        .then((b) => {
          setListOrder(
            b?.listIdsInOrder.trim() ||
              b?.lists.map((i) => i.id).join(",") ||
              ""
          );
        })
        .catch(() => router.push("/"));
    }
  }, [board, getBoard, router, router.query.boardId]);

  const { parent } = useAutoAnimate();
  const { parent: emptyParent } = useAutoAnimate();

  const [isAddingList, setIsAddingList] = useState(false);

  const showEmpty =
    board?.lists.length == 0 && board.id.toString() === router.query.boardId;

  const [name, setName] = useState(board?.name);

  const fetchBoard = useCallback(() => {
    if (board?.id) getBoard(board.id).then((b) => setName(b?.name));
  }, [board?.id, getBoard]);

  if (!user || !board) return <></>;

  return (
    <div className="h-screen flex flex-col gap-4">
      <Navbar />

      <span
        // ref={emptyParent}
        className={classNames(!showEmpty && "hidden", "h-screen w-screen")}
      >
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
                onFinished={() => {
                  setIsAddingList(false);
                  fetchBoard();
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
        // ref={parent}
      >
        <Board />
      </div>
    </div>
  );
}
