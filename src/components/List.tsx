import { http } from "@/api";
import { useAuthStore } from "@/store/auth";
import { List, useBoardStore } from "@/store/board";
import classNames from "classnames";
import React, {
  Dispatch,
  FocusEvent,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDrag, useDrop } from "react-dnd";
import CardItem from "./Card";
import autoAnimate from "@formkit/auto-animate";
import { useRouter } from "next/router";
import { useAutoAnimate } from "@/hooks/useAutoAnimate";
import NewCard from "./NewCard";

const ListBox = ({ list }: { list: List }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "list",
    item: {
      id: list.id,
      name: list.name,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const { board, get: getBoard } = useBoardStore();
  const { token } = useAuthStore();

  const [listName, setListName] = useState(list.name);
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);

  const onBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (e.target.value == listName) return;
      setListName(e.target.value);
      http
        .put(
          `/board/${board?.id}/list/${list.id}`,
          {
            name: e.target.value,
            cardIdsInOrder: list.cardIdsInOrder,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .catch(() => {
          setListName(listName);
        });
    },
    [board?.id, list.cardIdsInOrder, list.id, listName, token]
  );

  const { parent } = useAutoAnimate();

  const fetchBoard = useCallback(() => {
    if (board?.id) getBoard(board?.id);
  }, [board?.id, getBoard]);

  return (
    <div
      ref={dragRef}
      className={classNames(
        "bg-slate-800 min-w-[400px] h- min-h-[50%] flex flex-col text-slate-300 rounded-md",
        isDragging && "opacity-0 hidden"
      )}
    >
      <span className="px-4 p-3 border-b-2 border-dotted border-black pb-2 flex justify-between">
        <input
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          maxLength={20}
          className="outline-none bg-transparent"
          defaultValue={listName}
          onBlur={onBlur}
          draggable
        />
        <button
          className="bg-yellow-500 rounded-md text-black px-4"
          onClick={() => setIsAddingNewCard(true)}
        >
          +
        </button>
      </span>
      <div
        ref={parent}
        className="pt-3 p-3 flex flex-col overflow-y-scroll overflow-x-hidden h-full"
      >
        {isAddingNewCard && (
          <NewCard
            onCreated={() => {
              setIsAddingNewCard(false);
              fetchBoard();
            }}
            listId={list.id}
          />
        )}

        {list.cards.map((card, index) => (
          <>
            <DropTarget
              listId={list.id}
              onUpdateList={fetchBoard}
              position={index}
            />
            <CardItem listId={list.id} key={card.id} card={card} />
          </>
        ))}
        <DropTarget
          listId={list.id}
          onUpdateList={fetchBoard}
          position={-1}
          expand
        />
      </div>
    </div>
  );
};

function DropTarget({
  onUpdateList,
  position,
  listId: newListId,
  expand = false,
}: {
  // eslint-disable-next-line no-unused-vars
  onUpdateList: () => void;
  position: number;
  listId: number;
  expand?: boolean;
}) {
  const { board } = useBoardStore();
  const { token } = useAuthStore();

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "card",
      drop: (x: {
        id: number;
        name: string;
        listId: number;
        description: string;
      }) => {
        console.log(x, newListId, position);

        if (x.listId == newListId) return;

        // Move to new list
        http
          .put(
            `/board/${board?.id}/list/${x.listId}/card/${x.id}`,
            {
              listId: newListId,
              description: x.description,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(onUpdateList);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        height: monitor.getItem(),
      }),
    }),
    []
  );

  return (
    <div
      ref={drop}
      className={classNames(
        "min-h-[10px] h-[10px] w-full rounded-lg",
        isOver && "min-h-[100px] py-4",
        expand && "!h-full"
      )}
    >
      {isOver && <div className="bg-blue-500 w-full h-full rounded-lg"></div>}
    </div>
  );
}

export default ListBox;
