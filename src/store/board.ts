import { http } from "@/api";
import { create } from "zustand";

export type Label = {};
export type Attachment = {};

export type Card = {
  id: number;
  name: string;
  attachments: Attachment[];
  description: string;
  dueDate: string;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
};

export type List = {
  id: number;
  name: string;
  cards: Card[];
  cardIdsInOrder: string;
  createdAt: string;
  updatedAt: string;
};

export type Board = {
  id: number;
  name: string;
  lists: List[];
  listIdsInOrder: string;
  createdAt: string;
  updatedAt: string;
};

type BoardStoreState = {
  board: Board | null;
  // eslint-disable-next-line no-unused-vars
  get: (boardId: number) => Promise<Board | null>;
};

export const useBoardStore = create<BoardStoreState>((set) => ({
  board: null,
  get: async (boardId: number) => {
    const { data } = await http.get(`/board/${boardId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const board: Board = data.data;

    const listOrder =
      board.listIdsInOrder || board.lists.map((l) => l.id).join(",");

    let orderedLists = listOrder
      .split(",")
      .map((listId) =>
        board.lists.find((l) => l.id.toString() == listId)
      ) as List[];

    orderedLists = orderedLists.map((list) => {
      const cardOrder =
        list.cardIdsInOrder || list.cards.map((c) => c.id).join(",");
      const orderedCards = cardOrder
        .split(",")
        .map((cardId) =>
          list.cards.find((c) => c.id.toString() == cardId)
        ) as Card[];

      list.cardIdsInOrder = cardOrder;
      list.cards = orderedCards;

      return list;
    });

    set({
      board: {
        ...board,
        lists: orderedLists as List[],
        listIdsInOrder: listOrder,
      },
    });
    return data.data as Board | null;
  },
}));
