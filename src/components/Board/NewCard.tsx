import React, { useState } from "react";

const NewCard = ({
  onCreated,
}: {
  // eslint-disable-next-line no-unused-vars
  onCreated: (newCardName: string | null) => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
          onBlur={() => {
            if (name) onCreated(name);
            else onCreated(null);
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
};

export default NewCard;
