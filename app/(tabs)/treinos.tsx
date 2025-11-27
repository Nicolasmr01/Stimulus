import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TreinosScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treinos</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/TreinosAnteriores')}
      >
        <Text style={styles.cardText}>Visualizar treinos anteriores</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/(modals)/RegistrarTreino')}
      >
        <Text style={styles.cardText}>Registrar novo treino</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/Anotacoes')}
      >
        <Text style={styles.cardText}>Anotações</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/chatbot')}
      >
        <Text style={styles.cardText}>Chatbot</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    paddingTop: 50
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  card: {
    backgroundColor: '#2c2c2c',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  cardText: {
    fontSize: 18,
    color: '#fff'
  },
});
