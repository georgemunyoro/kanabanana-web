import { IBoard } from "@/components/Board/types";
import { create } from "zustand";

export const boardStore = create<{ board: IBoard | null }>(() => ({
  board: null,
}));
