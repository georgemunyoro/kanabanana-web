import { http } from "@/api";
import { useAuthStore } from "@/store/auth";
import React, { useState } from "react";

export default function AddBoardInput({
  onFinished,
}: {
  onFinished: () => void;
}) {
  const [newBoardName, setNewBoardName] = useState("");

  const { token } = useAuthStore();

  return (
    <div className="p-1 flex gap-2 bg-slate-100 rounded-lg items-center px-2 h-10">
      <div className="text-black">Name:</div>
      <input
        autoFocus
        className="rounded bg-slate-100 text-black outline-none"
        value={newBoardName}
        onChange={(e) => setNewBoardName(e.target.value)}
      />
      <button
        onClick={() => {
          if (newBoardName == "") return;

          http
            .post(
              `/board`,
              {
                name: newBoardName,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .finally(onFinished);
        }}
        className="text-black text-base bg-yellow-400 p-1 px-2 rounded-md"
      >
        ✅ Add
      </button>
      <button
        onClick={() => {
          setNewBoardName("");
          onFinished();
        }}
        className="text-black text-base bg-yellow-400 p-1 px-2 rounded-md"
      >
        ❌ Cancel
      </button>
    </div>
  );
}
