import React, { useState, useCallback, FocusEvent } from "react";
import { useAutoAnimate } from "@/hooks/useAutoAnimate";
import classNames from "classnames";
import { useDrag, useDrop } from "react-dnd";
import { IList } from "./types";
import { boardStore } from "@/store/board";
import { produce } from "immer";
import NewCard from "./NewCard";
import Card, { CardDropTarget } from "./Card";

type ListProps = {
  list: IList;
  position: number;
};

const List = ({ list, position }: ListProps) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "list",
    item: {
      name: list.name,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [isAddingNewCard, setIsAddingNewCard] = useState(false);

  const updateListName = useCallback(
    (newName: string) => {
      boardStore.setState((prev) =>
        produce(prev, (draft) => {
          const listIndex = draft.board.lists.findIndex(
            (l) => l.name === list.name
          );
          draft.board.lists[listIndex].name = newName;
        })
      );
    },
    [list.name]
  );

  const onListNameInputBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (e.target.value == list.name || e.target.value.trim() == "") {
        e.target.value = list.name;
        return;
      }
      updateListName(e.target.value.trim());
    },
    [list.name, updateListName]
  );

  const onDeleteList = useCallback(() => {
    boardStore.setState((prev) =>
      produce(prev, (draft) => {
        draft.board.lists = draft.board.lists.filter(
          (l) => l.name !== list.name
        );
      })
    );
  }, [list.name]);

  const { parent } = useAutoAnimate();

  const onChangeListPosition = useCallback(
    (list: { name: string }) => {
      boardStore.setState((prev) => {
        const newListOrder = prev.board.lists
          .map((l) => l.name)
          .filter((l) => l !== list.name);
        newListOrder.splice(position, 0, list.name);

        return produce(prev, (draft) => {
          draft.board.lists = draft.board.lists.sort(
            (a, b) =>
              newListOrder.indexOf(a.name) - newListOrder.indexOf(b.name)
          );
        });
      });
    },
    [position]
  );

  return (
    <ListDropTarget
      position={position}
      onChangeListPosition={onChangeListPosition}
      disabled={isDragging}
    >
      <div
        ref={dragRef}
        className={classNames(
          "list bg-slate-800 min-w-[300px] h-full flex flex-col text-slate-300 rounded-md",
          isDragging && "opacity-0 hidden"
        )}
      >
        <span className="px-4 p-3 border-b-2 border-dotted border-black pb-2 flex justify-between gap-2">
          <input
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            maxLength={25}
            className="outline-none bg-transparent"
            defaultValue={list.name}
            onBlur={onListNameInputBlur}
            draggable
          />
          <button
            className="bg-yellow-500 rounded-md text-black px-4"
            onClick={() => setIsAddingNewCard(true)}
          >
            +
          </button>
          <button
            className="rounded-md bg-red-500 text-black px-4"
            onClick={onDeleteList}
          >
            DEL
          </button>
        </span>
        <div
          // ref={parent}
          className="pt-3 p-3 flex flex-col overflow-y-scroll overflow-x-hidden h-full gap-2"
        >
          {isAddingNewCard && (
            <NewCard
              onCreated={(newCardName) => {
                if (newCardName) {
                  boardStore.setState((prev) =>
                    produce(prev, (draft) => {
                      const listIndex = draft.board.lists.findIndex(
                        (l) => l.name === list.name
                      );
                      draft.board.lists[listIndex].cards.unshift({
                        name: newCardName,
                        description: "",
                      });
                    })
                  );
                }
                setIsAddingNewCard(false);
              }}
            />
          )}

          {list.cards.map((card, index) => (
            <Card
              key={`${card.name}-${index}`}
              card={card}
              listName={list.name}
              position={index}
            />
          ))}

          <CardDropTarget position={-1} listName={list.name}></CardDropTarget>
        </div>
      </div>
    </ListDropTarget>
  );
};

type ListDropTargetProps = {
  children?: React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  onChangeListPosition: (list: { name: string }, newPosition: number) => void;
  position: number;
  disabled?: boolean;
};

export const ListDropTarget = ({
  children,
  onChangeListPosition,
  position,
  disabled = false,
}: ListDropTargetProps) => {
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: "list",
      drop: (list: { name: string }) => onChangeListPosition(list, position),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [onChangeListPosition]
  );

  return (
    <div ref={dropRef} className={classNames("flex", !disabled && "mr-4")}>
      {!disabled && (
        <div className={classNames("", isOver && "w-[315px] h-full")} />
      )}
      {children}
    </div>
  );
};

export default List;
