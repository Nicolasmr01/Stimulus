import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seja bem-vindo!</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/treinos')}>
        <Text style={styles.buttonText}>Visualizar Treinos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/grafico')}>
        <Text style={styles.buttonText}>Visualizar Gráfico</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/Anotacoes')}>
        <Text style={styles.buttonText}>Ver Anotações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/perfil')}>
        <Text style={styles.buttonText}>Ir para o Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 30, textAlign: 'center' },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
});
