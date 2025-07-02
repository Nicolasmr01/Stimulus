import { createContext, useContext, useEffect, useState } from 'react';
import { universalStorage } from '../utils/universalStorage';

type AuthContextType = {
  memoryToken: string | null;
  setMemoryToken: (token: string | null) => void;
  savePersistentToken: (token: string) => Promise<void>;
  clearPersistentToken: () => Promise<void>;
  isAuthChecked: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [memoryToken, setMemoryToken] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const savePersistentToken = async (token: string) => {
    await universalStorage.setItem('auth_token', token);
  };

  const clearPersistentToken = async () => {
    await universalStorage.removeItem('auth_token');
  };

  useEffect(() => {
    const loadAuth = async () => {
      const token = await universalStorage.getItem('auth_token');
      console.log('Token carregado:', token);
      setMemoryToken(token);
      setIsAuthChecked(true);
    };
    loadAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        memoryToken,
        setMemoryToken,
        savePersistentToken,
        clearPersistentToken,
        isAuthChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
