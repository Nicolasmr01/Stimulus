import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_API_URL } from '../../utils/api';
// 💡 IMPORTANDO O BACKBUTTON (Assumindo que está em '../components/BackButton')
import { Ionicons } from '@expo/vector-icons'; // Usado para o ícone de exclusão
import BackButton from '../../assets/images/backbutton.png';

// --- TIPOS ---
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
// --- FIM TIPOS ---


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
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este treino?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Excluir", 
          onPress: async () => {
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

              // Atualiza o estado da lista
              setTreinos(prev => prev.filter(t => t.id !== treinoId));
              Alert.alert("Sucesso", "Treino excluído!");
            } catch (err) {
              console.error(err);
              Alert.alert("Erro", "Erro desconhecido.");
            }
          }
        }
      ]
    );
  };


  const cardStyle = {
    backgroundColor: '#333333',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  };

  const textStyle = { color: '#fff' };

  // --- TELA QUANDO UM TREINO É SELECIONADO (DETALHES) ---
  if (treinoSelecionado) {
    return (
      <ScrollView style={{ padding: 20, backgroundColor: '#121212' }}>
        
        {/* 🚀 IMPLEMENTAÇÃO 1: Botão Voltar na Tela de Detalhes */}
        <View style={{ marginBottom: 20, marginTop: 20 }}>
          <BackButton onPress={() => setTreinoSelecionado(null)} />
          {/* O componente BackButton padrão que criamos usa router.back(), 
              então o ideal é criar um botão customizado para o setTreinoSelecionado(null) 
              OU modificar BackButton para aceitar uma prop onPress customizada. 
              Neste caso, voltamos ao TouchableOpacity com estilo melhorado. 
              Para simplicidade, usaremos o TouchableOpacity já existente com a função interna.
          */}
          <TouchableOpacity
            onPress={() => setTreinoSelecionado(null)}
            style={styles.backButtonDetail}
          >
             <Ionicons name="arrow-back" size={24} color="#fff" />
             <Text style={styles.backTextDetail}> Voltar</Text>
          </TouchableOpacity>
        </View>

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

  // --- TELA DE LISTA DE TREINOS ---
  return (
    <View style={styles.container}>
      
      {/* 🚀 IMPLEMENTAÇÃO 2: Botão Voltar Absoluto na Lista (Para sair da tela) */}
      <View style={styles.backButtonListWrapper}>
         {/* Assumindo que você quer voltar da página de lista para a página anterior (home, tabs, etc.) */}
         <BackButton /> 
      </View>
      
      <Text style={styles.listTitle}>Meus Treinos Anteriores</Text>

      <FlatList
        // Ajuste no paddingTop para que o conteúdo não fique escondido sob o botão Voltar
        style={{ paddingHorizontal: 20 }} 
        contentContainerStyle={{ paddingTop: 10 }} // Espaçamento entre o título e a lista
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
              onPress={() => handleDeleteTreino(item.id)}
              style={{
                backgroundColor: '#ff4444',
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 6,
                marginLeft: 12,
              }}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// --- ESTILOS ADICIONADOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: 50, // Adiciona espaço no topo
    },
    listTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        paddingHorizontal: 20,
        textAlign: 'center',
    },
    // Estilo para o botão Voltar da tela de LISTA (posicionamento absoluto)
    backButtonListWrapper: {
        position: 'absolute',
        top: 50, // Ajuste a altura conforme necessário
        left: 20,
        zIndex: 10,
    },
    // Estilos customizados para o botão Voltar na tela de DETALHES
    backButtonDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        marginBottom: 10,
    },
    backTextDetail: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 5,
    }
});