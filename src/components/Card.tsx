import React, { useEffect, useState } from "react";
import { Board, Card, List, useBoardStore } from "@/store/board";
import { useDrag, useDrop } from "react-dnd";
import { http } from "@/api";
import { useAuthStore } from "@/store/auth";
import classNames from "classnames";

export default function CardItem({
  card,
  listId,
}: {
  card: Card;
  listId: number;
}) {
  const [cardHeight, setCardHeight] = useState(0);

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "card",
      item: {
        id: card.id,
        name: card.name,
        description: card.description,
        listId,
        height: cardHeight,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [cardHeight]
  );

  const { board } = useBoardStore();
  const { token } = useAuthStore();

  const newListId = listId;

  const [{ isOver, draggedCardHeight }, dropRef] = useDrop(
    () => ({
      accept: "card",
      drop: (currentlyDraggedCard: {
        id: number;
        name: string;
        listId: number;
        description: string;
        height: number;
      }) => {
        const position = board?.lists
          .find((l) => l.id === listId)
          ?.cards.findIndex((i) => i.id === card.id);

        if (position == -1) return;

        // If moving to a different list:
        if (currentlyDraggedCard.listId !== newListId) {
          const newList = { ...board?.lists.find((l) => l.id === newListId) };
          const currentList = {
            ...board?.lists.find((l) => l.id === currentlyDraggedCard.listId),
          };

          if (!currentList.cards) return;

          const cardBeingMoved = {
            ...currentList?.cards.find((c) => c.id == currentlyDraggedCard.id),
          } as Card;

          console.log(
            { cardBeingMoved, newList, currentList },
            currentlyDraggedCard.id
          );

          if (!cardBeingMoved || !newList || !currentList) return;

          // Remove from old list card order
          if (currentList?.cardIdsInOrder) {
            currentList.cards = currentList?.cards.filter(
              (currentListCard) =>
                currentListCard.id !== currentlyDraggedCard.id
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
            .filter((i) => i !== currentlyDraggedCard.id.toString());

          if (position == -1) order?.push(currentlyDraggedCard.id.toString());
          else order?.splice(position, 0, currentlyDraggedCard.id.toString());

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
        draggedCardHeight: monitor.getItem()?.height,
      }),
    }),
    [board]
  );

  const [name, setName] = useState(card.name);
  const [description, setDescription] = useState(card.description);

  useEffect(() => {
    const cardElement = document.getElementById(`card-${card.id}`);
    if (!cardElement) return;
    setCardHeight(cardElement.getBoundingClientRect().height);
  }, [card.id, dragRef]);

  return (
    <div ref={dropRef}>
      <div
        className="w-full"
        style={
          isOver
            ? {
                minHeight: draggedCardHeight + 20,
                height: draggedCardHeight + 20,
              }
            : {}
        }
      ></div>
      <div
        id={`card-${card.id}`}
        ref={dragRef}
        draggable
        className={classNames(
          "shadow-md shadow-slate-900 rounded-lg bg-slate-100 p-2 flex",
          isDragging && "opacity-0 hidden"
        )}
        key={card.id}
      >
        <div className="flex flex-col gap-2 w-full h-fit">
          <input
            maxLength={20}
            defaultValue={name}
            className="text-black bg-transparent outline-none"
            onBlur={(e) => {
              if (e.target.value == name || e.target.value.trim() == "") {
                e.target.value = name;
                return;
              }
              setName(e.target.value.trim());
              http
                .put(
                  `/board/${board?.id}/list/${listId}/card/${card.id}`,
                  {
                    name: e.target.value,
                    description: description,
                    listId: listId,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )
                .catch(() => {
                  setName(name);
                });
            }}
          />
          <textarea
            defaultValue={description}
            className="italic text-slate-500 bg-slate-200 rounded-md outline-none flex flex-col w-full p-2"
            rows={description == "" ? 1 : 5}
            placeholder="..."
            onBlur={(e) => {
              if (e.target.value == description) return;
              setDescription(e.target.value);
              http
                .put(
                  `/board/${board?.id}/list/${listId}/card/${card.id}`,
                  {
                    name: name,
                    description: e.target.value,
                    listId: listId,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )
                .catch(() => {
                  setDescription(description);
                });
            }}
          />
        </div>
      </div>
    </div>
  );
}
