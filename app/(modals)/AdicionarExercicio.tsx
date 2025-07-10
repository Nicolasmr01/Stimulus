import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';

export type Exercise = {
  id: number;
  name: string;
  photoUrl?: string;
  musculo?: string;
};

const musculos = [
  { key: 'todos', label: 'Todos', image: require('../../assets/images/musculo-todos.png') },
  { key: 'triceps', label: 'Tríceps', image: require('../../assets/images/musculo-triceps.png') },
  { key: 'biceps', label: 'Bíceps', image: require('../../assets/images/musculo-biceps.png') },
  { key: 'quadriceps', label: 'Quadríceps', image: require('../../assets/images/musculo-quadriceps.png') },
  { key: 'posterior', label: 'Posterior', image: require('../../assets/images/musculo-posterior.png') },
  { key: 'panturrilha', label: 'Panturrilha', image: require('../../assets/images/musculo-panturrilha.png') },
  { key: 'upperback', label: 'Upper Back', image: require('../../assets/images/musculo-upperback.png') },
  { key: 'dorsal', label: 'Dorsal', image: require('../../assets/images/musculo-dorsal.png') },
  { key: 'ombro', label: 'Ombro', image: require('../../assets/images/musculo-ombro.png') },
  { key: 'peito', label: 'Peito', image: require('../../assets/images/musculo-peito.png') },
];

type Props = {
  onVoltar: () => void;
  onAdicionarExercicios: (exercicios: Exercise[]) => void;
};

export default function EscolherExercicio({ onVoltar, onAdicionarExercicios }: Props) {
  const { memoryToken } = useAuth();
  const [musculoSelecionado, setMusculoSelecionado] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [exercicios, setExercicios] = useState<Exercise[]>([]);
  const [exerciciosFiltrados, setExerciciosFiltrados] = useState<Exercise[]>([]);
  const [selecionados, setSelecionados] = useState<Exercise[]>([]);
  const [modalMusculosVisivel, setModalMusculosVisivel] = useState(false);

  useEffect(() => {
    if (!memoryToken) return;

    fetch('http://192.168.15.8:3333/api/exercicios', {
      headers: { Authorization: `Bearer ${memoryToken}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExercicios(data);
      })
      .catch(() => Alert.alert('Erro', 'Falha ao carregar exercícios'));
  }, [memoryToken]);

  useEffect(() => {
    let lista = exercicios;

    // filtrar pelo músculo, exceto 'todos'
    if (musculoSelecionado !== 'todos') {
      lista = lista.filter(
        ex => ex.musculo?.toLowerCase() === musculoSelecionado.toLowerCase()
      );
    }

    // filtrar pela busca no nome
    if (busca.trim() !== '') {
      lista = lista.filter(ex =>
        ex.name.toLowerCase().includes(busca.trim().toLowerCase())
      );
    }

    setExerciciosFiltrados(lista);
  }, [musculoSelecionado, busca, exercicios]);

  const toggleSelecionado = (ex: Exercise) => {
    if (selecionados.find(e => e.id === ex.id)) {
      setSelecionados(selecionados.filter(e => e.id !== ex.id));
    } else {
      setSelecionados([...selecionados, ex]);
    }
  };

  // Abre o modal ao clicar em "Todos os Músculos"
  const onPressTodosMusculos = () => {
    setModalMusculosVisivel(true);
  };

  // Quando seleciona músculo no modal
  const selecionarMusculoNoModal = (key: string) => {
    setMusculoSelecionado(key);
    setModalMusculosVisivel(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar}>
          <Icon name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Escolher Exercícios</Text>
      </View>

      {/* Busca */}
      <View style={styles.buscaContainer}>
        <Icon name="search" size={20} color="#888" />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar exercício"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Botões Equipamentos e Musculos */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity style={[styles.filtroBtn, { opacity: 0.5 }]}>
          <Text style={styles.filtroTexto}>Equipamentos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroBtn,
            musculoSelecionado === 'todos' && styles.filtroBtnAtivo,
          ]}
          onPress={onPressTodosMusculos} // abre modal ao invés de setar direto
        >
          <Text
            style={[
              styles.filtroTexto,
              musculoSelecionado === 'todos' && styles.filtroTextoAtivo,
            ]}
          >
            Todos os Músculos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para escolher músculo */}
<Modal visible={modalMusculosVisivel} transparent animationType="slide">
  <View style={styles.modalBackground}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Escolha um músculo</Text>
      <FlatList
        data={musculos} // inclui todos
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.modalMusculoItem}
            onPress={() => selecionarMusculoNoModal(item.key)}
          >
            <Image source={item.image} style={styles.musculoImage} />
            <Text style={styles.musculoLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        onPress={() => setModalMusculosVisivel(false)}
        style={styles.btnFecharModal}
      >
        <Text style={{ color: 'white' }}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* Lista de Exercícios */}
      <FlatList
        data={exerciciosFiltrados}
        keyExtractor={item => item.id.toString()}
        style={styles.listaExercicios}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center' }}>Nenhum exercício encontrado</Text>
        }
        renderItem={({ item }) => {
          const isSelected = selecionados.some(e => e.id === item.id);
          return (
            <TouchableOpacity
              style={[styles.exercicioItem, isSelected && styles.exercicioSelecionado]}
              onPress={() => toggleSelecionado(item)}
            >
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.exercicioImage} />
              ) : (
                <Icon name="dumbbell" size={24} color="#555" />
              )}
              <Text style={styles.exercicioNome}>{item.name}</Text>
              {isSelected && <Icon name="check" size={20} color="green" />}
            </TouchableOpacity>
          );
        }}
      />

      {/* Botão adicionar selecionados */}
      {selecionados.length > 0 && (
        <TouchableOpacity
          style={styles.adicionarBtn}
          onPress={() => {
            onAdicionarExercicios(selecionados);
          }}
        >
          <Text style={styles.adicionarBtnText}>
            Adicionar {selecionados.length} {selecionados.length === 1 ? 'exercício' : 'exercícios'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  buscaInput: { flex: 1, height: 40, fontSize: 16 },
  filtrosContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  filtroBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginRight: 8,
  },
  filtroBtnAtivo: { backgroundColor: '#007BFF' },
  filtroTexto: { fontSize: 16, color: '#555' },
  filtroTextoAtivo: { color: '#fff', fontWeight: 'bold' },
  musculosList: { maxHeight: 80, marginBottom: 12 },
  musculoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  musculoItemSelecionado: { backgroundColor: '#007BFF' },
  musculoImage: { width: 40, height: 40, marginRight: 8 },
  musculoLabel: { fontSize: 16, color: '#333' },
  listaExercicios: { flex: 1 },
  exercicioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  exercicioSelecionado: { backgroundColor: '#d0f0c0' },
  exercicioImage: { width: 40, height: 40, marginRight: 12, borderRadius: 6 },
  exercicioNome: { flex: 1, fontSize: 16 },
  adicionarBtn: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  adicionarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMusculoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  btnFecharModal: {
    marginTop: 12,
    backgroundColor: '#777',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
});
