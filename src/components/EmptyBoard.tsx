import React from "react";
import AddListInput from "./AddListInput";

type EmptyBoardProps = {
  isAddingList: boolean;
  onFinishedAddingList: () => void;
  onCloseAddInput: () => void;
};

export default function EmptyBoard({
  isAddingList,
  onFinishedAddingList,
  onCloseAddInput,
}: EmptyBoardProps) {
  return (
    <div className="text-slate-400 w-full h-3/4 flex flex-col gap-4 items-center justify-center">
      <span className="text-9xl animate-bounce">🫙</span>
      <span className="text-xl">Oh my, such empty...</span>
      <button
        onClick={onCloseAddInput}
        className="bg-yellow-400 text-black p-2 rounded-md !text-xl hover:scale-105 duration-150"
      >
        + New List
      </button>
      {isAddingList && <AddListInput onFinished={onFinishedAddingList} />}
    </div>
  );
}
