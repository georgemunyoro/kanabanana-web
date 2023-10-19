import React, { useEffect, useState } from "react";
import { Card, useBoardStore } from "@/store/board";
import { useDrag } from "react-dnd";
import { http } from "@/api";
import { useAuthStore } from "@/store/auth";

export default function NewCard({
  onCreated,
  listId,
}: {
  // eslint-disable-next-line no-unused-vars
  onCreated: (card: Card | null) => void;
  listId: number;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { board } = useBoardStore();
  const { token } = useAuthStore();

  return (
    <div draggable className="rounded-lg bg-slate-100 p-2 flex">
      <div className="flex flex-col gap-2 w-full h-fit">
        <input
          maxLength={20}
          placeholder={"Hello, World! 🎉"}
          className="text-black bg-transparent outline-none"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => {
            if (name) {
              http
                .post(
                  `/board/${board?.id}/list/${listId}/card`,
                  {
                    name: e.target.value,
                    description: "",
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )
                .then((res) => onCreated(res.data.data));
            } else onCreated(null);
          }}
        />
        <textarea
          disabled
          defaultValue={description}
          className="italic text-slate-500 bg-slate-200 rounded-md outline-none flex flex-col w-full p-2"
          rows={2}
          placeholder="It's a new card..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </div>
  );
}
