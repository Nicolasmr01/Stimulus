import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type TreinoExercicio = {
  id: number;
  series: number;
  carga: number;
  tipoSerie: string;
  exercise: {
    id: number;
    name: string;
    photoUrl?: string;
  };
};

type Note = {
  id: number;
  content: string;
};

type Treino = {
  id: number;
  titulo: string;
  data: string;
  exercicios: TreinoExercicio[];
  notes: Note[];
};

export default function TreinosAnteriores() {
  const { memoryToken } = useAuth();

  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [treinoSelecionado, setTreinoSelecionado] = useState<Treino | null>(null);

  useEffect(() => {
    if (!memoryToken) return;

    fetch('http://192.168.15.8:3333/api/treinos', {
      headers: {
        Authorization: `Bearer ${memoryToken}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then(data => setTreinos(data))
      .catch(() => {
        Alert.alert('Erro', 'Erro ao carregar treinos');
      });
  }, [memoryToken]);

  const cardStyle = {
    backgroundColor: '#cccccc',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  };

  const textStyle = { color: '#fff' };

  if (treinoSelecionado) {
    return (
      <ScrollView style={{ padding: 20, backgroundColor: '#121212' }}>
        <TouchableOpacity onPress={() => setTreinoSelecionado(null)} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#007bff' }}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={[{ fontSize: 22, fontWeight: 'bold' }, textStyle]}>
          {treinoSelecionado.titulo}
        </Text>
        <Text style={[{ marginBottom: 10 }, textStyle]}>
          {new Date(treinoSelecionado.data).toLocaleDateString()}
        </Text>

        <Text style={[{ fontWeight: 'bold', marginBottom: 5 }, textStyle]}>Exercícios:</Text>
        {treinoSelecionado.exercicios.map(ex => (
          <View key={ex.id} style={cardStyle}>
            <Text style={{ fontWeight: 'bold' }}>{ex.exercise.name}</Text>
            <Text>Séries: {ex.series}</Text>
            <Text>Carga: {ex.carga} kg</Text>
            <Text>Tipo: {ex.tipoSerie}</Text>
          </View>
        ))}

        <Text style={[{ fontWeight: 'bold', marginTop: 15 }, textStyle]}>Anotações:</Text>
        {treinoSelecionado.notes.length > 0 ? (
          treinoSelecionado.notes.map(note => (
            <View key={note.id} style={cardStyle}>
              <Text>{note.content}</Text>
            </View>
          ))
        ) : (
          <Text style={[{ fontStyle: 'italic' }, textStyle]}>Nenhuma anotação</Text>
        )}
      </ScrollView>
    );
  }

  return (
    <FlatList
      style={{ padding: 20, backgroundColor: '#121212', paddingTop: 100 }} 
      data={treinos}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => setTreinoSelecionado(item)}
          style={{
            backgroundColor: '#cccccc',
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.titulo}</Text>
          <Text>{new Date(item.data).toLocaleDateString()}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
