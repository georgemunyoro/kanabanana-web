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
    set({
      board: data.data,
    });
    return data.data as Board | null;
  },
}));
