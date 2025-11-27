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
import { BASE_API_URL } from '../../utils/api';

type SerieDetalhe = {
  id: number;
  treinoExercicioId: number;
  tipoSerie: string;
  carga: number;
  reps: number;
};

type TreinoExercicio = {
  id: number;
  carga: number;
  exercise: {
    id: number;
    name: string;
    photoUrl?: string;
  };
  seriesDetalhes: SerieDetalhe[];
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

    fetch(`${BASE_API_URL}/treinos`, {
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

  // --- Função para excluir treino ---
  const handleDeleteTreino = async (treinoId: number) => {
  console.log("Chamando DELETE para treino:", treinoId);

  try {
    const res = await fetch(`${BASE_API_URL}/treinos/${treinoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${memoryToken}`,
        'Content-Type': 'application/json'
      },
    });

    const txt = await res.text();
    console.log("STATUS DELETE:", res.status);
    console.log("RESPOSTA DELETE:", txt);

    if (!res.ok) {
      Alert.alert("ERRO", `Status: ${res.status}\nResposta: ${txt}`);
      return;
    }

    setTreinos(prev => prev.filter(t => t.id !== treinoId));
    Alert.alert("OK", "Treino excluído!");
  } catch (err) {
    console.error(err);
    Alert.alert("Erro", "Erro desconhecido.");
  }
};


  const cardStyle = {
    backgroundColor: '#333333',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  };

  const textStyle = { color: '#fff' };

  // Tela quando um treino é selecionado
  if (treinoSelecionado) {
    return (
      <ScrollView style={{ padding: 20, backgroundColor: '#121212' }}>
        <TouchableOpacity
          onPress={() => setTreinoSelecionado(null)}
          style={{ marginBottom: 20 }}
        >
          <Text style={{ color: '#007bff' }}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={[{ fontSize: 22, fontWeight: 'bold' }, textStyle]}>
          {treinoSelecionado.titulo}
        </Text>
        <Text style={[{ marginBottom: 10 }, textStyle]}>
          {new Date(treinoSelecionado.data).toLocaleDateString()}
        </Text>

        <Text style={[{ fontWeight: 'bold', marginBottom: 5 }, textStyle]}>
          Exercícios:
        </Text>

        {treinoSelecionado.exercicios.map(ex => (
          <View key={ex.id} style={cardStyle}>
            <Text style={{ fontWeight: 'bold', color: '#fff' }}>
              {ex.exercise.name}
            </Text>
            <Text style={{ color: '#fff' }}>Carga total: {ex.carga} kg</Text>

            <Text style={{ fontWeight: 'bold', marginTop: 6, color: '#fff' }}>
              Séries Detalhadas:
            </Text>

            {ex.seriesDetalhes?.length > 0 ? (
              ex.seriesDetalhes.map(sd => (
                <View
                  key={sd.id}
                  style={{
                    marginLeft: 10,
                    marginBottom: 4,
                    backgroundColor: '#222',
                    padding: 6,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#ddd' }}>Tipo: {sd.tipoSerie}</Text>
                  <Text style={{ color: '#ddd' }}>Carga: {sd.carga} kg</Text>
                  <Text style={{ color: '#ddd' }}>Repetições: {sd.reps}</Text>
                </View>
              ))
            ) : (
              <Text style={{ fontStyle: 'italic', color: '#ccc' }}>
                Nenhuma série detalhada.
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    );
  }

  // Tela de lista de treinos
  return (
    <FlatList
      style={{ padding: 20, backgroundColor: '#121212', paddingTop: 100 }}
      data={treinos}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: '#333333',
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Botão para abrir treino */}
          <TouchableOpacity
            onPress={() => setTreinoSelecionado(item)}
            style={{ flex: 1 }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#fff' }}>
              {item.titulo}
            </Text>
            <Text style={{ color: '#fff' }}>
              {new Date(item.data).toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {/* Botão excluir */}
          <TouchableOpacity
            onPress={() => {
              console.log("Excluindo treino ID:", item.id);
              handleDeleteTreino(item.id);
            }}
            style={{
              backgroundColor: '#ff4444',
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 6,
              marginLeft: 12,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Excluir
            </Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

