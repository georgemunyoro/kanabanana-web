import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import classNames from "classnames";
import { ICard } from "./types";
import { boardStore } from "@/store/board";
import { produce } from "immer";

const Card = ({
  card,
  listName,
  position,
}: {
  card: ICard;
  listName: string;
  position: number;
}) => {
  const [cardHeight, setCardHeight] = useState(0);

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "card",
      item: {
        name: card.name,
        description: card.description,
        height: cardHeight,
        listName,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [cardHeight, card, listName]
  );

  const [name, setName] = useState(card.name);
  const [description, setDescription] = useState(card.description);

  const cardId = (listName + card.name).replace(/\s/g, "");

  useEffect(() => {
    const cardElement = document.getElementById(cardId);
    if (cardElement) setCardHeight(cardElement.getBoundingClientRect().height);
  }, [cardHeight, cardId]);

  return (
    <CardDropTarget
      position={position}
      disabled={isDragging}
      listName={listName}
    >
      <div
        id={cardId}
        ref={dragRef}
        draggable
        className={classNames(
          "shadow-md shadow-slate-900 rounded-lg bg-slate-100 p-2 flex",
          isDragging && "opacity-0 hidden"
        )}
        key={card.name}
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

              boardStore.setState((prev) => {
                const listIndex = prev.board.lists.findIndex(
                  (list) => list.name === listName
                );
                const cardIndex = prev.board.lists[listIndex].cards.findIndex(
                  (c) => c.name === card.name
                );

                return produce(prev, (draft) => {
                  draft.board.lists[listIndex].cards[cardIndex].name =
                    e.target.value.trim();
                });
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

              boardStore.setState((prev) => {
                const listIndex = prev.board.lists.findIndex(
                  (list) => list.name === listName
                );
                const cardIndex = prev.board.lists[listIndex].cards.findIndex(
                  (c) => c.name === card.name
                );

                return produce(prev, (draft) => {
                  draft.board.lists[listIndex].cards[cardIndex].description =
                    e.target.value.trim();
                });
              });
            }}
          />
        </div>
      </div>
    </CardDropTarget>
  );
};

type CardDropTargetProps = {
  children?: React.ReactNode;
  position: number;
  disabled?: boolean;
  listName: string;
};

export const CardDropTarget = ({
  children,
  position,
  disabled,
  listName,
}: CardDropTargetProps) => {
  const [{ isOver, cardHeight }, dropRef] = useDrop(
    () => ({
      accept: "card",
      drop: (card: {
        name: string;
        description: string;
        listName: string;
        height: number;
      }) => {
        boardStore.setState((prev) => {
          return produce(prev, (draft) => {
            // If card is dropped in the same list, update card position
            if (card.listName === listName) {
              const listIndex = draft.board.lists.findIndex(
                (list) => list.name === listName
              );
              draft.board.lists[listIndex].cards = prev.board.lists[
                listIndex
              ].cards.filter((i) => i.name !== card.name);

              draft.board.lists[listIndex].cards.splice(position, 0, {
                name: card.name,
                description: card.description,
              });

              console.log(draft.board.lists[listIndex].cards);
            } else {
              // Remove card from previous list
              const prevListIndex = draft.board.lists.findIndex(
                (list) => list.name === card.listName
              );
              const prevCardIndex = draft.board.lists[
                prevListIndex
              ].cards.findIndex((c) => c.name === card.name);
              draft.board.lists[prevListIndex].cards.splice(prevCardIndex, 1);

              // Add card to new list
              const listIndex = draft.board.lists.findIndex(
                (list) => list.name === listName
              );
              draft.board.lists[listIndex].cards.splice(position, 0, {
                name: card.name,
                description: card.description,
              });
            }
          });
        });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        cardHeight: monitor.getItem()?.height,
      }),
    }),
    []
  );

  return (
    <div ref={dropRef}>
      {!disabled && (
        <div
          className={classNames(
            "bg-slate-900 rounded-md w-full pb-1",
            isOver && "mb-2"
          )}
          style={
            isOver
              ? {
                  height: cardHeight || 0,
                }
              : {}
          }
        />
      )}
      {children}
    </div>
  );
};

export default Card;
