import { http } from "@/api";
import { useAuthStore } from "@/store/auth";
import { useBoardStore } from "@/store/board";
import React, { useState } from "react";

export default function AddListInput({
  onFinished,
}: {
  onFinished: () => void;
}) {
  const [newListName, setNewListName] = useState("");

  const { token } = useAuthStore();
  const { board } = useBoardStore();

  return (
    <div className="p-1 flex gap-2 bg-slate-100 rounded-lg items-center px-2 h-10">
      <div className="text-black">Name:</div>
      <input
        autoFocus
        className="rounded bg-slate-100 text-black outline-none"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
      />
      <button
        onClick={() => {
          if (newListName == "" || board?.id == null) return;

          http
            .post(
              `/board/${board.id}/list`,
              {
                name: newListName,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then(async (data) => {
              const newList = data.data.data;

              await http.put(
                `/board/${board.id}`,
                {
                  listIdsInOrder: board.listIdsInOrder + `,${newList.id}`,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
            })
            .finally(onFinished);
        }}
        className="text-black text-base bg-yellow-400 p-1 px-2 rounded-md"
      >
        ✅ Add
      </button>
      <button
        onClick={() => {
          setNewListName("");
          onFinished();
        }}
        className="text-black text-base bg-yellow-400 p-1 px-2 rounded-md"
      >
        ❌ Cancel
      </button>
    </div>
  );
}
