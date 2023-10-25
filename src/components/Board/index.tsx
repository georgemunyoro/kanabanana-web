import React, { useState } from "react";
import List from "./List";
import AddListInput from "./AddListInput";
import useBoard from "./useBoard";

const Board = () => {
  const { board, addList, renameBoard } = useBoard();
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
              if (newListName && !listExists) addList(newListName);
              setShowAddingListInput(false);
            }}
          />
        )}
        <input
          defaultValue={board.name}
          onBlur={(e) => {
            if (e.target.value == board.name || e.target.value.trim() == "") {
              e.target.value = board.name;
            }
            renameBoard(e.target.value);
          }}
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
