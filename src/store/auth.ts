import { http } from "@/api";
import { create } from "zustand";

export type User = {
  id: number;
  name: string;
  email: string;
  boards: ShallowBoard[];
};

export type ShallowBoard = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type AuthStoreState = {
  user: User | null;
  token: string;
  // eslint-disable-next-line no-unused-vars
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: "",

  login: async (email: string, password: string) => {
    const { data } = await http.post("/auth/login", { email, password });
    set({ token: data.data });

    const {
      data: { data: user },
    } = await http.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${data.data}`,
      },
    });
    set({ user });

    localStorage.setItem("token", data.data);
  },

  logout: () => {
    set({
      user: null,
    });
    localStorage.removeItem("token");
  },
}));
