import React, { useState } from "react";

const AddListInput = ({
  onFinished,
}: {
  // eslint-disable-next-line no-unused-vars
  onFinished: (newListName: string | null) => void;
}) => {
  const [newListName, setNewListName] = useState("");

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
        onClick={() => onFinished(newListName)}
        className="text-black text-base bg-yellow-400 p-1 px-2 rounded-md"
      >
        ✅ Add
      </button>
      <button
        onClick={() => {
          setNewListName("");
          onFinished(null);
        }}
        className="text-black text-base bg-yellow-400 p-1 px-2 rounded-md"
      >
        ❌ Cancel
      </button>
    </div>
  );
};

export default AddListInput;
