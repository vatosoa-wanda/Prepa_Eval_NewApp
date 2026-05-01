import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios.config";
import authApi from "../api/auth.api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
 
            login: async (email, password) => {
        // json-server ne gère pas auth, on simule
        const res = await authApi.login(email, password);
        if (res.data.length === 0) throw new Error("Identifiants incorrects");
        const user = res.data[0];
        localStorage.setItem("erp_token", "mock-jwt-token");
        set({ user, isAuthenticated: true });
        return user;
      },
 
      logout: () => {
        localStorage.removeItem("erp_token");
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: "erp-auth" }
  )
);


