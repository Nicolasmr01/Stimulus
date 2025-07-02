import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';

type Treino = {
  id: number;
  titulo: string;
  data: string;
  descanso?: number;
  alimentacao?: number;
  humor?: number;
  esforco?: number;
  observacoes?: string;
};

export default function Anotacoes() {
  const [treinos, setTreinos] = useState<Treino[]>([]);

  useEffect(() => {
    fetch('http://192.168.15.8:3333/api/treinos/1') // Use o ID do usuário logado
      .then(res => res.json())
      .then(setTreinos)
      .catch(() => Alert.alert('Erro', 'Falha ao carregar anotações'));
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Anotações dos Treinos</Text>

      <FlatList
        data={treinos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12, backgroundColor: '#eee', padding: 12, borderRadius: 6 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.titulo}</Text>
            <Text style={{ color: '#666' }}>{new Date(item.data).toLocaleDateString()}</Text>

            {item.descanso != null && <Text>Descanso: {item.descanso}/10</Text>}
            {item.alimentacao != null && <Text>Alimentação: {item.alimentacao}/10</Text>}
            {item.humor != null && <Text>Humor: {item.humor}/10</Text>}
            {item.esforco != null && <Text>Esforço entre séries: {item.esforco}/10</Text>}
            {item.observacoes && <Text>Observações: {item.observacoes}</Text>}
          </View>
        )}
      />
    </View>
  );
}
