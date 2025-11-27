import Constants from 'expo-constants';

// 1. Definição da URL.
// O __DEV__ é uma variável global do React Native/Expo que é TRUE apenas no desenvolvimento local.
const isDevelopment = __DEV__; 

let API_URL: string;

if (isDevelopment) {
  // 🧭 AMBIENTE DE DESENVOLVIMENTO (Local)
  // Use o IP privado ou localhost que seu backend está usando.
  // **ATENÇÃO: SUBSTITUA COM SEU IP/PORTA LOCAL CORRETA!**
  API_URL = 'http://192.168.15.8:3333/api'; 
} else {
  // 🌐 AMBIENTE DE PRODUÇÃO (Vercel/EAS)
  // O Expo lê as variáveis EXPO_PUBLIC_* e as injeta na seção 'extra'.
  const productionUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
  
  if (!productionUrl) {
    // Lança um erro se a variável de PRODUÇÃO não foi configurada no Vercel/EAS
    throw new Error('A URL de PRODUÇÃO (EXPO_PUBLIC_API_URL) não está configurada. Adicione-a nas variáveis de ambiente do Vercel/EAS.');
  }

  API_URL = productionUrl;
}

// 2. Exporta a URL Base
// Esta constante será a URL LOCAL em dev e a URL do RENDER em produção.
export const BASE_API_URL: string = API_URL;

// --- Implementação do Fetch ---

// Tipo de dados esperado para as credenciais (melhor prática em TypeScript)
interface LoginCredentials {
  email: string;
  password: string;
}

export async function fetchLogin(credentials: LoginCredentials) {
  // 1. Constrói o corpo da requisição
  const bodyData = JSON.stringify({
    email: credentials.email,
    password: credentials.password
  });

  // 2. Faz a chamada usando a URL base (que srerá local ou Render)
  const response = await fetch(`${BASE_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: bodyData,
  });

  // 3. Lida com a resposta
  if (!response.ok) {
    // Se a API retornar um status de erro (4xx, 5xx), lança uma exceção
    const errorData = await response.json();
    throw new Error(errorData.message || `Erro no login: Status ${response.status}`);
  }

  // 4. Retorna os dados (ex: token de autenticação)
  return response.json();
}