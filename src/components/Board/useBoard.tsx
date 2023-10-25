import { boardStore } from "@/store/board";
import { produce } from "immer";
import { useCallback } from "react";
import { IList } from "./types";

const useBoard = () => {
  const { board } = boardStore();

  const addList = useCallback((name: string) => {
    boardStore.setState((prev) => {
      return produce(prev, (draft) => {
        draft.board.lists.push({
          name,
          cards: [],
        } as IList);
      });
    });
  }, []);

  const moveList = useCallback((listName: string, newListPosition: number) => {
    boardStore.setState((prev) => {
      const newListOrder = prev.board.lists
        .map((l) => l.name)
        .filter((l) => l !== listName);
      newListOrder.splice(newListPosition, 0, listName);

      return produce(prev, (draft) => {
        draft.board.lists = draft.board.lists.sort(
          (a, b) => newListOrder.indexOf(a.name) - newListOrder.indexOf(b.name)
        );
      });
    });
  }, []);

  const renameList = useCallback((oldListName: string, newListName: string) => {
    boardStore.setState((prev) =>
      produce(prev, (draft) => {
        const listIndex = draft.board.lists.findIndex(
          (l) => l.name === oldListName
        );
        draft.board.lists[listIndex].name = newListName;
      })
    );
  }, []);

  const deleteList = useCallback((listName: string) => {
    boardStore.setState((prev) =>
      produce(prev, (draft) => {
        draft.board.lists = draft.board.lists.filter(
          (l) => l.name !== listName
        );
      })
    );
  }, []);

  const addCard = useCallback((listName: string, newCardName: string) => {
    boardStore.setState((prev) =>
      produce(prev, (draft) => {
        const listIndex = draft.board.lists.findIndex(
          (l) => l.name === listName
        );
        draft.board.lists[listIndex].cards.unshift({
          name: newCardName,
          description: "",
        });
      })
    );
  }, []);

  const moveCard = useCallback(
    ({
      oldListName,
      newListName,
      card,
      position,
    }: {
      oldListName: string;
      newListName: string;
      card: {
        name: string;
        description: string;
      };
      position: number;
    }) => {
      boardStore.setState((prev) => {
        return produce(prev, (draft) => {
          // If card is dropped in the same list, update card position
          if (oldListName === newListName) {
            const listIndex = draft.board.lists.findIndex(
              (list) => list.name === oldListName
            );
            draft.board.lists[listIndex].cards = prev.board.lists[
              listIndex
            ].cards.filter((i) => i.name !== card.name);

            if (position === -1)
              draft.board.lists[listIndex].cards.push({
                name: card.name,
                description: card.description,
              });
            else
              draft.board.lists[listIndex].cards.splice(position, 0, {
                name: card.name,
                description: card.description,
              });
          } else {
            // Remove card from previous list
            const prevListIndex = draft.board.lists.findIndex(
              (list) => list.name === oldListName
            );
            const prevCardIndex = draft.board.lists[
              prevListIndex
            ].cards.findIndex((c) => c.name === card.name);
            draft.board.lists[prevListIndex].cards.splice(prevCardIndex, 1);

            // Add card to new list
            const listIndex = draft.board.lists.findIndex(
              (list) => list.name === newListName
            );

            if (position === -1)
              draft.board.lists[listIndex].cards.push({
                name: card.name,
                description: card.description,
              });
            else
              draft.board.lists[listIndex].cards.splice(position, 0, {
                name: card.name,
                description: card.description,
              });
          }
        });
      });
    },
    []
  );

  const updateCardDetails = useCallback(
    (card: {
      oldName: string;
      newName: string;
      description: string;
      listName: string;
    }) => {
      boardStore.setState((prev) => {
        const listIndex = prev.board.lists.findIndex(
          (list) => list.name === card.listName
        );
        const cardIndex = prev.board.lists[listIndex].cards.findIndex(
          (c) => c.name === card.oldName
        );

        return produce(prev, (draft) => {
          if (card.newName)
            draft.board.lists[listIndex].cards[cardIndex].name = card.newName;
          draft.board.lists[listIndex].cards[cardIndex].description =
            card.description;
        });
      });
    },
    []
  );

  const deleteCard = useCallback((cardName: string) => {
    boardStore.setState((prev) =>
      produce(prev, (draft) => {
        draft.board.lists.forEach((list) => {
          list.cards = list.cards.filter((c) => c.name !== cardName);
        });
      })
    );
  }, []);

  const renameBoard = useCallback((newBoardName: string) => {
    boardStore.setState((prev) =>
      produce(prev, (draft) => {
        draft.board.name = newBoardName;
      })
    );
  }, []);

  return {
    board,
    addList,
    moveList,
    renameList,
    deleteList,
    addCard,
    moveCard,
    updateCardDetails,
    deleteCard,
    renameBoard,
  };
};

export default useBoard;
