import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const router = useRouter();
  const { setMemoryToken, savePersistentToken, clearPersistentToken } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const response = await fetch('http://192.168.15.8:3333/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setLoginError(true);
        return;
      }

      const data = await response.json();

      if (!data.token) {
        Alert.alert('Erro', 'Token não recebido');
        return;
      }


      await clearPersistentToken(); // 🔥 limpa token anterior
      await savePersistentToken(data.token);
      setMemoryToken(data.token);

      setLoginError(false);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {loginError && (
        <View style={styles.registerPrompt}>
          <Text style={{ color: '#fff', marginRight: 6 }}>Usuário ou senha inválidos.</Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerLink}>Registrar-se</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  registerPrompt: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLink: {
    color: '#4da6ff',
    textDecorationLine: 'underline',
  },
});
