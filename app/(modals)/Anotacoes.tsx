import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type Note = {
  id: number;
  content: string;
};

type Treino = {
  id: number;
  titulo: string;
  data: string;
  descanso?: number;
  alimentacao?: number;
  humor?: number;
  esforco?: number;
  observacoes?: string;
  notes: Note[];
};

export default function Anotacoes() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const { memoryToken } = useAuth();

  useEffect(() => {
    if (!memoryToken) return;

    fetch('http://192.168.15.8:3333/api/treinos', {
      headers: {
        Authorization: `Bearer ${memoryToken}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTreinos(Array.isArray(data) ? data : []);
      })
      .catch(() => Alert.alert('Erro', 'Falha ao carregar anotações'));
  }, [memoryToken]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Anotações dos Treinos</Text>

      {treinos.length === 0 ? (
        <Text style={styles.empty}>Nenhum treino encontrado.</Text>
      ) : (
        <FlatList
          data={treinos}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.data).toLocaleDateString()}
              </Text>

              {item.descanso != null && (
                <Text style={styles.cardText}>Descanso: {item.descanso}/10</Text>
              )}
              {item.alimentacao != null && (
                <Text style={styles.cardText}>Alimentação: {item.alimentacao}/10</Text>
              )}
              {item.humor != null && (
                <Text style={styles.cardText}>Humor: {item.humor}/10</Text>
              )}
              {item.esforco != null && (
                <Text style={styles.cardText}>Esforço entre séries: {item.esforco}/10</Text>
              )}
              {item.observacoes && (
                <Text style={styles.cardText}>Observações: {item.observacoes}</Text>
              )}

              {item.notes && item.notes.length > 0 ? (
                <>
                  <Text style={[styles.cardText, { fontWeight: 'bold', marginTop: 10 }]}>
                    Notas:
                  </Text>
                  {item.notes.map(note => (
                    <Text key={note.id} style={styles.cardText}>
                      • {note.content}
                    </Text>
                  ))}
                </>
              ) : (
                <Text style={styles.noNote}>Nenhuma nota para este treino</Text>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  empty: {
    fontStyle: 'italic',
    color: '#aaa',
  },
  card: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardDate: {
    color: '#333',
    marginBottom: 6,
  },
  cardText: {
    color: '#000',
  },
  noNote: {
    fontStyle: 'italic',
    marginTop: 10,
    color: '#444',
  },
});
