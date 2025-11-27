import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');  // 🔥 novo
  const [loginError, setLoginError] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    setFieldError('');
    setLoginError(false);

    if (!email || !password) {
      setFieldError('Preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)/home');

    } catch (error) {
      setLoginError(true);
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setFieldError('');
          setLoginError(false);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setFieldError('');
          setLoginError(false);
        }}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {/* 🔥 Erro de campos vazios */}
      {fieldError !== '' && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {fieldError}
        </Text>
      )}

      {/* 🔥 Erro de login inválido */}
      {loginError && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          Usuário ou senha inválidos.
        </Text>
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
});
