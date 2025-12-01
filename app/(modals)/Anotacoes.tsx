import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_API_URL } from '../../utils/api';

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
  const router = useRouter();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const { memoryToken } = useAuth();
  const [editingTreinoId, setEditingTreinoId] = useState<number | null>(null);
  const [descanso, setDescanso] = useState<number | string>('');
  const [alimentacao, setAlimentacao] = useState<number | string>('');
  const [humor, setHumor] = useState<number | string>('');
  const [esforco, setEsforco] = useState<number | string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  useEffect(() => {
    if (!memoryToken) return;

    fetch(`${BASE_API_URL}/treinos`, {
      headers: { Authorization: `Bearer ${memoryToken}` },
    })
      .then(res => res.json())
      .then(data => setTreinos(Array.isArray(data) ? data : []))
      .catch(err => console.log('ERRO AO CARREGAR TREINOS:', err));
  }, [memoryToken]);

  const handleEditTreino = async () => {
    if (editingTreinoId === null) return;

    const updatedData = {
      descanso: Number(descanso),
      alimentacao: Number(alimentacao),
      humor: Number(humor),
      esforco: Number(esforco),
      observacoes,
    };

    try {
      const res = await fetch(`${BASE_API_URL}/treinos/${editingTreinoId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${memoryToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) return;

      const updatedTreino = await res.json();
      setTreinos(prev =>
        prev.map(t => (t.id === editingTreinoId ? { ...t, ...updatedTreino } : t))
      );

      setEditingTreinoId(null);
      setDescanso('');
      setAlimentacao('');
      setHumor('');
      setEsforco('');
      setObservacoes('');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 BOTÃO DE VOLTAR COM SUA IMAGEM */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/images/backbutton.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

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
                <Text style={styles.cardText}>Esforço: {item.esforco}/10</Text>
              )}
              {item.observacoes && (
                <Text style={styles.cardText}>Observações: {item.observacoes}</Text>
              )}

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingTreinoId(item.id);
                  setDescanso(item.descanso || '');
                  setAlimentacao(item.alimentacao || '');
                  setHumor(item.humor || '');
                  setEsforco(item.esforco || '');
                  setObservacoes(item.observacoes || '');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Editar Treino</Text>
              </TouchableOpacity>

              {editingTreinoId === item.id && (
                <View style={styles.editForm}>
                  <TextInput style={styles.input} value={descanso.toString()} onChangeText={setDescanso} placeholder="Descanso (0-10)" keyboardType="numeric" />
                  <TextInput style={styles.input} value={alimentacao.toString()} onChangeText={setAlimentacao} placeholder="Alimentação (0-10)" keyboardType="numeric" />
                  <TextInput style={styles.input} value={humor.toString()} onChangeText={setHumor} placeholder="Humor (0-10)" keyboardType="numeric" />
                  <TextInput style={styles.input} value={esforco.toString()} onChangeText={setEsforco} placeholder="Esforço (0-10)" keyboardType="numeric" />
                  <TextInput style={[styles.input, { height: 80 }]} value={observacoes} onChangeText={setObservacoes} placeholder="Observações" multiline />

                  <TouchableOpacity style={styles.saveButton} onPress={handleEditTreino}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
                  </TouchableOpacity>
                </View>
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

  /* 🔙 BOTÃO DE VOLTAR */
  backButton: {
    position: 'absolute',
    top: 53,
    left: 12,
    zIndex: 50,
  },
  backIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 11,
    alignSelf: 'center',
  },

  empty: { color: '#aaa', fontStyle: 'italic' },

  card: { backgroundColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  cardDate: { color: '#333', marginBottom: 6 },
  cardText: { color: '#000' },

  editButton: {
    backgroundColor: '#4287f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  editForm: { marginTop: 12 },

  input: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },

  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
