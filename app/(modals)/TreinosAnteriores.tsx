import React, { useEffect, useState } from 'react';
import {
    FlatList,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [treinoSelecionado, setTreinoSelecionado] = useState<Treino | null>(null);

  useEffect(() => {
    fetch('http://192.168.15.8:3333/api/treinos/1') // userId fixo
      .then(res => res.json())
      .then(setTreinos)
      .catch(() => alert('Erro ao carregar treinos'));
  }, []);

  if (treinoSelecionado) {
    return (
      <ScrollView style={{ padding: 20 }}>
        <TouchableOpacity onPress={() => setTreinoSelecionado(null)} style={{ marginBottom: 20 }}>
          <Text style={{ color: 'blue' }}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{treinoSelecionado.titulo}</Text>
        <Text style={{ marginBottom: 10 }}>{new Date(treinoSelecionado.data).toLocaleDateString()}</Text>

        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Exercícios:</Text>
        {treinoSelecionado.exercicios.map(ex => (
          <View
            key={ex.id}
            style={{ backgroundColor: '#eee', padding: 10, marginBottom: 8, borderRadius: 6 }}
          >
            <Text style={{ fontWeight: 'bold' }}>{ex.exercise.name}</Text>
            <Text>Séries: {ex.series}</Text>
            <Text>Carga: {ex.carga} kg</Text>
            <Text>Tipo: {ex.tipoSerie}</Text>
          </View>
        ))}

        <Text style={{ fontWeight: 'bold', marginTop: 15 }}>Anotações:</Text>
        {treinoSelecionado.notes.length > 0 ? (
          treinoSelecionado.notes.map(note => (
            <View
              key={note.id}
              style={{ backgroundColor: '#f7f7f7', padding: 10, marginBottom: 8, borderRadius: 6 }}
            >
              <Text>{note.content}</Text>
            </View>
          ))
        ) : (
          <Text style={{ fontStyle: 'italic' }}>Nenhuma anotação</Text>
        )}
      </ScrollView>
    );
  }

  return (
    <FlatList
      style={{ padding: 20 }}
      data={treinos}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => setTreinoSelecionado(item)}
          style={{
            backgroundColor: '#eee',
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
