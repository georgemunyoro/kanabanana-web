export type IBoard = {
  name: string;
  lists: IList[];
};

export type IList = {
  name: string;
  cards: ICard[];
};

export type ICard = {
  name: string;
  description: string;
};
