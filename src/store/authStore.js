import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios.config";
 
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
 
      login: async (email, password) => {
        // json-server ne gère pas auth, on simule
        const res = await api.get(`/users?email=${email}&password=${password}`);
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
