import { createContext, useContext, useEffect, useState } from 'react';
import { BASE_API_URL, fetchLogin } from '../utils/api'; // Importa a função e a URL
import { universalStorage } from '../utils/universalStorage';

// --- TIPOS ---

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

// --- PROVIDER ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [memoryToken, setMemoryToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // 1. Função de Login (Usa o fetchLogin do api.ts)
  const login = async (email: string, password: string) => {
    try {
      // Chama a função centralizada no api.ts para fazer a requisição
      const data = await fetchLogin({ email, password });

      // salva token no storage e na memória
      await universalStorage.setItem('auth_token', data.token);
      setMemoryToken(data.token);

      // salva dados do usuário no state
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      });
    } catch (error) {
      // Re-lança o erro para ser capturado pela tela (Register/Login)
      throw error;
    }
  };

  // 2. Função para logout
  const logout = async () => {
    await universalStorage.removeItem('auth_token');
    setMemoryToken(null);
    setUser(null);
  };

  // 3. Carregar token do storage ao iniciar
  useEffect(() => {
    const loadAuth = async () => {
      let token = await universalStorage.getItem('auth_token');
      
      if (token) {
        setMemoryToken(token);

        // busca perfil do usuário usando token
        try {
          const res = await fetch(`${BASE_API_URL}/perfil`, {
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
            // Token inválido ou expirado. Limpa o token e faz logout.
            console.error("Token expirado ou inválido. Realizando logout.");
            await logout();
            token = null; // Garante que o estado final seja limpo
          }
        } catch (error) {
            // Erro de rede na checagem do perfil
            console.error("Erro ao buscar perfil:", error);
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