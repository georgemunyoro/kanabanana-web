export type ILabel = {};
export type IAttachment = {};

export type ICard = {
  id: number;
  name: string;
  attachments: IAttachment[];
  description: string;
  dueDate: string;
  labels: ILabel[];
  createdAt: string;
  updatedAt: string;
};

export type List = {
  id: number;
  name: string;
  cards: ICard[];
  cardIdsInOrder: string;
  createdAt: string;
  updatedAt: string;
};

export type IBoard = {
  id: number;
  name: string;
  lists: List[];
  listIdsInOrder: string;
  createdAt: string;
  updatedAt: string;
};
