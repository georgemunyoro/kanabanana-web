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
  register: (name: string, email: string, password: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getUser: () => Promise<void>;
};

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  token: "",

  register: async (name: string, email: string, password: string) => {
    const { data } = await http.post("/auth/register", {
      email,
      password,
      name,
    });

    console.log(data);
  },

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

  getUser: async () => {
    const {
      data: { data: user },
    } = await http.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${get().token}`,
      },
    });
    set({ user });
  },
}));
