import React, { useState } from "react";
import { Card, useBoardStore } from "@/store/board";
import { useDrag } from "react-dnd";
import { http } from "@/api";
import { useAuthStore } from "@/store/auth";

export default function CardItem({
  card,
  listId,
}: {
  card: Card;
  listId: number;
}) {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "card",
      item: {
        id: card.id,
        name: card.name,
        description: card.description,
        height: 300,
        listId,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    []
  );

  const [name, setName] = useState(card.name);
  const [description, setDescription] = useState(card.description);

  const { board } = useBoardStore();
  const { token } = useAuthStore();

  return (
    <div
      ref={dragRef}
      draggable
      className="rounded-lg bg-slate-100 p-2 flex"
      key={card.id}
    >
      <div className="flex flex-col gap-2 w-full h-fit">
        <input
          maxLength={20}
          defaultValue={name}
          className="text-black bg-transparent outline-none"
          onBlur={(e) => {
            if (e.target.value == name) return;
            setName(e.target.value);
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
          rows={5}
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
  );
}
