import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {
  const { memoryToken, isAuthChecked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthChecked && !memoryToken) {
      router.replace('/'); // volta para login/start
    }
  }, [isAuthChecked, memoryToken]);

  if (!isAuthChecked) return null; // evita renderização antes de checar token

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'home') return <Feather name="home" size={size} color={color} />;
          if (route.name === 'treinos') return <FontAwesome5 name="dumbbell" size={size} color={color} />;
          if (route.name === 'perfil') return <Feather name="user" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1E90FF',  // cor ativa
        tabBarInactiveTintColor: 'gray',  // cor inativa
        tabBarLabel: () => null,  // Remove os rótulos de texto
        tabBarStyle: {
          backgroundColor: '#333',  // cor de fundo do footer (barra de navegação)
          borderTopWidth: 0,        // remove a borda superior
          height: 60,               // Defina a altura da barra de navegação
          paddingBottom: 10,        // Adicione algum espaçamento abaixo, se necessário
        },
        headerShown: false,  // Remove o cabeçalho
      })}
    />
  );
}
