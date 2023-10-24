import { produce } from "immer";
import React, { useState } from "react";
import List from "./List";
import AddListInput from "./AddListInput";
import { boardStore } from "@/store/board";

const Board = () => {
  const { board } = boardStore();
  const [showAddingListInput, setShowAddingListInput] = useState(false);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex gap-4 px-10">
        <button
          onClick={() => setShowAddingListInput(true)}
          className="bg-yellow-400 text-black p-2 rounded-md hover:scale-105 duration-150"
        >
          + New List
        </button>
        {showAddingListInput && (
          <AddListInput
            onFinished={(newListName) => {
              const listExists = board.lists.some(
                (list) => list.name === newListName
              );
              if (newListName && !listExists) {
                boardStore.setState((prev) =>
                  produce(prev, (draft) => {
                    draft.board.lists.push({
                      name: newListName,
                      cards: [],
                    });
                  })
                );
              }
              setShowAddingListInput(false);
            }}
          />
        )}
        <input
          value={board.name}
          className="text-lg bg-transparent text-slate-200 outline-none"
        />
      </div>

      <div className="w-full h-full pb-10 py-2 flex overflow-auto px-10">
        {board.lists.map((list, index) => (
          <List key={list.name} list={list} position={index} />
        ))}
      </div>
    </div>
  );
};

export default Board;
