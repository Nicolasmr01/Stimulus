import { createContext, useContext, useEffect, useState } from 'react';
import { BASE_API_URL } from '../utils/api';
import { universalStorage } from '../utils/universalStorage';

type UserType = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  memoryToken: string | null;
  user: UserType | null;
  isAuthChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  setMemoryToken: React.Dispatch<React.SetStateAction<string | null>>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [memoryToken, setMemoryToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // --- Função para login ---
  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE_API_URL}api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Erro no login');

    // salva token no storage e na memória
    await universalStorage.setItem('auth_token', data.token);
    setMemoryToken(data.token);

    // salva dados do usuário no state
    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
    });
  };

  // --- Função para logout ---
  const logout = async () => {
    await universalStorage.removeItem('auth_token');
    setMemoryToken(null);
    setUser(null);
  };

  // --- Carregar token do storage ao iniciar ---
  useEffect(() => {
    const loadAuth = async () => {
      const token = await universalStorage.getItem('auth_token');
      if (token) {
        setMemoryToken(token);

        // busca perfil do usuário usando token
        const res = await fetch(`${BASE_API_URL}api/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
          });
        } else {
          // token inválido ou expirado
          await logout();
        }
      }

      setIsAuthChecked(true);
    };

    loadAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        memoryToken,
        user,
        isAuthChecked,
        login,
        logout,
        setUser,
        setMemoryToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook para usar contexto ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
