import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { BASE_API_URL } from '../utils/api';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=?])[A-Za-z0-9!@#$%^&*()_+=?]{6,15}$/;

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fieldError, setFieldError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const router = useRouter();
  const { login } = useAuth(); 

  const handleRegister = async () => {
    setFieldError('');
    setPasswordError('');

    if (!name || !email || !password) {
      setFieldError('Preencha todos os campos');
      return;
    }

     // Validação da senha no FRONT
    if (!passwordRegex.test(password)) {
      setPasswordError(
        'A senha deve ter 6–15 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial.'
      );
      return;
    }

    try {
      // Faz o registro no servidor
      const response = await fetch(`${BASE_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFieldError(data.error || 'Erro ao registrar');
        return;
      }

      // Após registrar, já loga automaticamente usando a função login do contexto
      await login(email, password);

      router.replace('/(tabs)/home');

    } catch (error) {
      console.error(error);
      setFieldError('Não foi possível conectar ao servidor');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome"
        placeholderTextColor="#888"
        value={name}
        onChangeText={(t) => {
          setName(t);
          setFieldError('');
          setPasswordError('');
        }}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setFieldError('');
          setPasswordError('');
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
          setPasswordError('');
          setFieldError('');
        }}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

       {/* EXIBIR ERROS COMO NO LOGIN */}
      {fieldError !== '' && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {fieldError}
        </Text>
      )}

      {passwordError !== '' && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {passwordError}
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
