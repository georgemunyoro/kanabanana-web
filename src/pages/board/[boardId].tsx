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
      <span className="text-slate-100 px-16 text-lg flex gap-4 items-center">
        {!showEmpty && (
          <>
            <button
              onClick={() => setIsAddingList(true)}
              className="bg-yellow-400 text-black p-2 rounded-md !text-xl"
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
          </>
        )}
        <input
          defaultValue={board?.name}
          className="bg-transparent text-2xl outline-none text-slate-100"
          onBlur={(e) => {
            if (e.target.value.trim() == "" || e.target.value == name) {
              if (!name) return;
              e.target.value = name;
              return;
            }
            setName(e.target.value);

            e.target.disabled = true;

            http
              .put(
                `/board/${board.id}`,
                {
                  name: e.target.value,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then(() => {
                e.target.disabled = false;
              })
              .finally(useAuthStore.getState().getUser);
          }}
        />
      </span>

      <span
        ref={emptyParent}
        className={classNames(!showEmpty && "hidden", "h-screen w-screen")}
      >
        {showEmpty && (
          <div className="text-slate-400 w-full h-3/4 flex flex-col gap-4 items-center justify-center">
            <span className="text-9xl animate-bounce">🫙</span>
            <span className="text-xl">Oh my, such empty...</span>

            <button
              onClick={() => setIsAddingList(true)}
              className="bg-yellow-400 text-black p-2 rounded-md !text-xl"
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
          "flex w-full h-full overflow-x-auto p-8 pt-0",
          showEmpty && "hidden"
        )}
        ref={parent}
      >
        {listOrder?.split(",").map((i, index) => {
          const list = board?.lists.find((l) => l.id.toString() == i);

          if (!list) return <></>;

          return (
            // eslint-disable-next-line react/jsx-key
            <Fragment>
              <DropTarget onUpdateListOrder={setListOrder} position={index} />
              <ListBox key={list.id} list={list} />
            </Fragment>
          );
        })}
        <DropTarget onUpdateListOrder={setListOrder} position={-1} />
      </div>
    </div>
  );
}

function DropTarget({
  onUpdateListOrder,
  position,
}: {
  // eslint-disable-next-line no-unused-vars
  onUpdateListOrder: Dispatch<SetStateAction<string>>;
  position: number;
}) {
  const boardId = useRouter().query.boardId;

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "list",
      drop: (list: { id: number; name: string }) => {
        onUpdateListOrder((prev) => {
          const order = prev.split(",").filter((i) => i !== list.id.toString());
          if (position == -1) order.push(list.id.toString());
          else order.splice(position, 0, list.id.toString());

          http.put(
            `/board/${boardId}`,
            {
              listIdsInOrder: order.join(","),
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          return order.join(",");
        });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    []
  );

  return (
    <div
      ref={drop}
      className={classNames(
        "h-full min-w-[30px] duration-300",
        isOver && "!min-w-[270px]"
      )}
    ></div>
  );
}
