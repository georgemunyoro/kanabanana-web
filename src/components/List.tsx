import { http } from "@/api";
import { useAuthStore } from "@/store/auth";
import { Board, Card, List, useBoardStore } from "@/store/board";
import classNames from "classnames";
import React, { FocusEvent, useCallback, useEffect, useState } from "react";
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
        // ref={parent}
        className="pt-3 p-3 flex flex-col overflow-y-scroll overflow-x-hidden h-full gap-2"
      >
        {isAddingNewCard && (
          <NewCard
            onCreated={(card) => {
              if (card != null) {
                useBoardStore.setState({
                  board: {
                    ...board,
                    lists: board?.lists.map((l) => {
                      if (l.id === list.id) {
                        return {
                          ...list,
                          cards: [card, ...l.cards],
                          cardIdsInOrder: [
                            card.id.toString(),
                            ...list.cardIdsInOrder.split(","),
                          ].join(","),
                        };
                      }
                      return l;
                    }),
                  } as Board,
                });
              }
              setIsAddingNewCard(false);
              fetchBoard();
            }}
            listId={list.id}
          />
        )}

        {list.cards.map((card) => (
          <CardItem listId={list.id} key={card.id} card={card} />
        ))}
        <CardDropTarget listId={list.id} position={-1} expand />
      </div>
    </div>
  );
};

function CardDropTarget({
  position,
  listId: newListId,
  expand = false,
}: {
  position: number;
  listId: number;
  expand?: boolean;
}) {
  const { board } = useBoardStore();

  const [{ isOver, cardHeight }, drop] = useDrop(
    () => ({
      accept: "card",
      drop: (card: {
        id: number;
        name: string;
        listId: number;
        description: string;
        height: number;
      }) => {
        // If moving to a different list:
        if (card.listId !== newListId) {
          const newList = { ...board?.lists.find((l) => l.id === newListId) };
          const currentList = {
            ...board?.lists.find((l) => l.id === card.listId),
          };

          if (!currentList.cards) return;

          const cardBeingMoved = {
            ...currentList?.cards.find((c) => c.id == card.id),
          } as Card;

          console.log({ cardBeingMoved, newList, currentList }, card.id);

          if (!cardBeingMoved || !newList || !currentList) return;

          // Remove from old list card order
          if (currentList?.cardIdsInOrder) {
            currentList.cards = currentList?.cards.filter(
              (currentListCard) => currentListCard.id !== card.id
            );
          }

          // Add to new list card order
          if (position == -1) newList.cards?.push(cardBeingMoved);
          else newList.cards?.splice(position, 0, cardBeingMoved);

          currentList.cardIdsInOrder = currentList?.cards
            .map((i) => i.id)
            .join(",");
          newList.cardIdsInOrder = newList?.cards?.map((i) => i.id).join(",");

          useBoardStore.setState({
            board: {
              ...board,
              lists: board?.lists.map((l) => {
                if (l.id === newList.id) return newList;
                if (l.id === currentList.id) return currentList;
                return l;
              }) as List[],
            } as Board,
          });
        }

        // If moving within the same list:
        else {
          const currentList = board?.lists.find((i) => i.id == newListId);

          const order = currentList?.cardIdsInOrder
            .split(",")
            .filter((i) => i !== card.id.toString());

          if (position == -1) order?.push(card.id.toString());
          else order?.splice(position, 0, card.id.toString());

          const currentListWithNewlyOrderedCards = {
            ...currentList,
            cardIdsInOrder: order?.join(","),
            cards: order?.map((cardId) =>
              currentList?.cards.find((card) => card.id.toString() == cardId)
            ),
          };

          useBoardStore.setState({
            board: {
              ...board,
              lists: board?.lists.map((l) => {
                if (l.id !== currentList?.id) return l;
                return currentListWithNewlyOrderedCards;
              }),
            } as Board,
          });
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        cardHeight: monitor.getItem()?.height,
      }),
    }),
    [board]
  );

  return (
    <div
      ref={drop}
      className={classNames(
        "min-h-[10px] h-[10px] w-full rounded-lg",
        isOver && "py-4",
        expand && "!h-full min-h-[200px]"
      )}
      style={
        isOver
          ? {
              minHeight: cardHeight + 20,
              height: cardHeight + 20,
            }
          : {}
      }
    >
      {isOver && <div className="w-full h-full rounded-lg"></div>}
    </div>
  );
}

export default ListBox;
