import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Stimulus.png')}
        style={styles.image}
      />

      <Text style={styles.title}>Bem-vindo ao Stimulus 💪</Text>
      <Text style={styles.subtitle}>Seu desempenho além dos pesos.</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/register')}>
        <Text style={styles.cardText}>Registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/login')}>
        <Text style={styles.cardText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  image: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    width: '80%',
    padding: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    marginVertical: 10,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
