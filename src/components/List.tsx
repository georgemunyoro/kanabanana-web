import { http } from "@/api";
import { useAuthStore } from "@/store/auth";
import { List, useBoardStore } from "@/store/board";
import classNames from "classnames";
import React, {
  Dispatch,
  FocusEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDrag, useDrop } from "react-dnd";
import CardItem from "./Card";
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

  const [cardOrder, setCardOrder] = useState("");

  useEffect(() => {
    setCardOrder(
      list?.cardIdsInOrder.trim() ||
        list?.cards.map((i) => i.id).join(",") ||
        ""
    );
  }, [list?.cardIdsInOrder, list?.cards]);

  const onBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (e.target.value == listName || e.target.value.trim() == "") {
        e.target.value = listName;
        return;
      }
      setListName(e.target.value.trim());
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
    if (board?.id != null) getBoard(board.id);
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
          maxLength={25}
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
            onCreated={(card) => {
              if (card != null) {
                setCardOrder((prev) => {
                  const newCardOrder = `${card.id},${prev}`;
                  http
                    .put(
                      `/board/${board?.id}/list/${list.id}`,
                      {
                        cardIdsInOrder: newCardOrder,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                      }
                    )
                    .finally(fetchBoard);
                  return newCardOrder;
                });
              }
              setIsAddingNewCard(false);
              fetchBoard();
            }}
            listId={list.id}
          />
        )}

        {cardOrder.split(",").map((i, index) => {
          const card = list.cards.find((c) => c.id.toString() == i);

          if (!card) return <></>;

          return (
            <>
              <DropTarget
                listId={list.id}
                onUpdateList={fetchBoard}
                position={index}
                setCardOrder={setCardOrder}
              />
              <CardItem listId={list.id} key={card.id} card={card} />
            </>
          );
        })}

        <DropTarget
          listId={list.id}
          onUpdateList={fetchBoard}
          position={-1}
          expand
          setCardOrder={setCardOrder}
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
  setCardOrder,
}: {
  // eslint-disable-next-line no-unused-vars
  onUpdateList: () => void;
  position: number;
  listId: number;
  expand?: boolean;
  setCardOrder: Dispatch<SetStateAction<string>>;
}) {
  const { board } = useBoardStore();
  const { token } = useAuthStore();

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "card",
      drop: (card: {
        id: number;
        name: string;
        listId: number;
        description: string;
      }) => {
        // Moving to a different list
        if (card.listId != newListId) {
          // Remove card from previous list order
          {
            const listBeingMovedFrom = useBoardStore
              .getState()
              .board?.lists.find((l) => l.id == card.listId);
            const listBeingMovedFromCardOrder = (
              listBeingMovedFrom?.cardIdsInOrder.split(",") ||
              listBeingMovedFrom?.cards.map((c) => c.id.toString())
            )
              ?.filter((i) => i !== card.id.toString())
              .join(",");

            http.put(
              `/board/${board?.id}/list/${card.listId}`,
              {
                cardIdsInOrder: listBeingMovedFromCardOrder,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            console.log("from", card.listId, listBeingMovedFromCardOrder);
          }

          // Update list being moved to's card order
          setCardOrder((prev) => {
            const order = prev
              .split(",")
              .filter((i) => i !== card.id.toString());
            if (position == -1) order?.push(card.id.toString());
            else order?.splice(position, 0, card.id.toString());

            console.log("to", newListId, order?.join(","));

            http.put(
              `/board/${board?.id}/list/${newListId}`,
              {
                cardIdsInOrder: order?.join(","),
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            return order.join(",");
          });

          http
            .put(
              `/board/${board?.id}/list/${card.listId}/card/${card.id}`,
              {
                listId: newListId,
                description: card.description,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then(onUpdateList);
          return;
        }

        // console.log(card.id, position);

        // Moving within the same list
        setCardOrder((prev) => {
          const order = prev.split(",").filter((i) => i !== card.id.toString());
          if (position == -1) order.push(card.id.toString());
          else order.splice(position, 0, card.id.toString());

          http
            .put(
              `/board/${board?.id}/list/${card.listId}`,
              {
                cardIdsInOrder: order.join(","),
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            )
            .then(onUpdateList);

          return order.join(",");
        });
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
        expand && "!h-full min-h-[200px]"
      )}
    >
      {isOver && <div className="bg-blue-500 w-full h-full rounded-lg"></div>}
    </div>
  );
}

export default ListBox;
