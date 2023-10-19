import { http } from "@/api";
import ListBox from "@/components/List";
import Navbar from "@/components/NavBar";
import { useAutoAnimate } from "@/hooks/useAutoAnimate";
import { useAuthStore } from "@/store/auth";
import { List, useBoardStore } from "@/store/board";
import autoAnimate from "@formkit/auto-animate";
import classNames from "classnames";
import { useRouter } from "next/router";
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDrop } from "react-dnd";

export default function BoardPage() {
  const { user } = useAuthStore();
  const { board, get: getBoard } = useBoardStore();
  const router = useRouter();

  const [listOrder, setListOrder] = useState("");

  useEffect(() => {
    if (router.query.boardId && board == null) {
      getBoard(parseInt(router.query.boardId as string)).then((b) => {
        setListOrder(
          b?.listIdsInOrder.trim() || b?.lists.map((i) => i.id).join(",") || ""
        );
      });
    }
  }, [board, getBoard, router.query.boardId]);

  const { parent } = useAutoAnimate();

  if (!user) return <></>;

  return (
    <div className="h-screen flex flex-col gap-4">
      <Navbar />
      <span className="text-slate-100 px-16 text-lg">{board?.name}</span>
      <div className="flex w-full h-full overflow-x-auto p-8 pt-0" ref={parent}>
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
        <DropTarget
          onUpdateListOrder={setListOrder}
          position={board?.lists.length || 0}
        />
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
      drop: (x: { id: number; name: string }) => {
        onUpdateListOrder((prev) => {
          const order = prev.split(",").filter((i) => i !== x.id.toString());
          order.splice(position, 0, x.id.toString());

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
