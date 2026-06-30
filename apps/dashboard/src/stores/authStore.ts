import { create } from 'zustand';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

interface User {
  userId: string;
  username: string;
  avatar: string;
  guilds: Guild[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  selectedGuild: Guild | null;
  setAuth: (user: User, token: string) => void;
  setSelectedGuild: (guild: Guild) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  selectedGuild: null,
  setAuth: (user, token) => set({ user, token }),
  setSelectedGuild: (guild) => set({ selectedGuild: guild }),
  logout: () => set({ user: null, token: null, selectedGuild: null }),
}));
