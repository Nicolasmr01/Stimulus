import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
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
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fff' },
  title: { fontSize: 24, marginBottom: 30 },
  card: {
    width: '80%',
    padding: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    marginVertical: 10,
  },
  cardText: { color:'#fff', fontSize:18, textAlign:'center' },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 32,
  },
});
