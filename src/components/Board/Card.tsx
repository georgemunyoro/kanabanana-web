import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import classNames from "classnames";
import { ICard } from "./types";
import useBoard from "./useBoard";

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

  const { updateCardDetails, deleteCard } = useBoard();

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
  }, [cardHeight, cardId, card]);

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
          <div className="flex gap-2 w-full">
            <input
              maxLength={20}
              defaultValue={name}
              className="text-black bg-transparent outline-none grow"
              onBlur={(e) => {
                if (e.target.value == name || e.target.value.trim() == "") {
                  e.target.value = name;
                  return;
                }
                setName(e.target.value.trim());
                updateCardDetails({
                  oldName: card.name,
                  newName: e.target.value.trim(),
                  description,
                  listName,
                });
              }}
            />
            <button
              className="rounded-md text-black px-2"
              onClick={() => deleteCard(card.name)}
            >
              x
            </button>
          </div>
          <textarea
            defaultValue={description}
            className="italic text-slate-500 bg-slate-200 rounded-md outline-none flex flex-col w-full p-2"
            rows={description == "" ? 1 : 5}
            placeholder="..."
            onBlur={(e) => {
              if (e.target.value == description) return;
              setDescription(e.target.value);
              updateCardDetails({
                oldName: card.name,
                newName: card.name,
                description: e.target.value,
                listName,
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
  const { moveCard } = useBoard();

  const [{ isOver, cardHeight }, dropRef] = useDrop(
    () => ({
      accept: "card",
      drop: (card: {
        name: string;
        description: string;
        listName: string;
        height: number;
      }) => {
        moveCard({
          card: {
            name: card.name,
            description: card.description,
          },
          oldListName: card.listName,
          newListName: listName,
          position,
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
    <div ref={dropRef} className={classNames(position === -1 && "h-full")}>
      {!disabled && (
        <div
          className={classNames(
            "bg-slate-900 rounded-md w-full",
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
