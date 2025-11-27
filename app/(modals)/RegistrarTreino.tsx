import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import AdicionarExercicio, { Exercise } from './AdicionarExercicio';

// Tipos...
export type SerieDetalhe = {
  tipoSerie: 'aquecimento' | 'feeder' | 'validas';
  carga: number;
  reps: number;
};

export type ExercicioSelecionado = {
  exerciseId: number;
  name?: string;
  photoUrl?: string;
  carga: number;
  seriesDetalhes: SerieDetalhe[];
};

const validarCampo0a10 = (nome: string, valor: any) => {
  if (valor === undefined || valor === null) return;
  if (typeof valor !== 'number' || valor < 0 || valor > 10) {
    throw new Error(`${nome} deve ser um número entre 0 e 10.`);
  }
};

export default function RegistrarTreino() {
  const { memoryToken } = useAuth();
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [exercicios, setExercicios] = useState<ExercicioSelecionado[]>([]);
  const [descanso, setDescanso] = useState('');
  const [alimentacao, setAlimentacao] = useState('');
  const [humor, setHumor] = useState('');
  const [esforco, setEsforco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [modalEscolherExercicioVisivel, setModalEscolherExercicioVisivel] = useState(false);

  const validarData = (dataStr: string) => {
    const dataObj = new Date(dataStr);
    return !isNaN(dataObj.getTime());
  };

  const adicionarExerciciosSelecionados = (exerciciosSelecionados: Exercise[]) => {
    const novosExercicios: ExercicioSelecionado[] = exerciciosSelecionados
      .filter((ex) => !exercicios.some((e) => e.exerciseId === ex.id))
      .map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        photoUrl: ex.photoUrl,
        carga: 0,
        seriesDetalhes: [],
      }));

    setExercicios(prev => [...prev, ...novosExercicios]);
    setModalEscolherExercicioVisivel(false);
  };

  const enviarTreino = async () => {
    if (!titulo || !data) {
      Alert.alert('Erro', 'Título e data são obrigatórios');
      return;
    }
    if (!validarData(data)) {
      Alert.alert('Erro', 'Data inválida. Use o formato AAAA-MM-DD');
      return;
    }
    
 try {
      validarCampo0a10('Descanso', Number(descanso));
      validarCampo0a10('Alimentação', Number(alimentacao));
      validarCampo0a10('Humor', Number(humor));
      validarCampo0a10('Esforço', Number(esforco));
    } catch (err: any) {
      Alert.alert('Erro', err.message);
      return;
    }

    try {
      const response = await fetch('${API_URL}api/treinos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memoryToken}`,
        },
        body: JSON.stringify({
          titulo,
          data,
          descanso: descanso ? Number(descanso) : undefined,
          alimentacao: alimentacao ? Number(alimentacao) : undefined,
          humor: humor ? Number(humor) : undefined,
          esforco: esforco ? Number(esforco) : undefined,
          observacoes,
          exercicios: exercicios.map(ex => ({
            exerciseId: ex.exerciseId,
            carga: ex.carga,
            seriesDetalhes: ex.seriesDetalhes.map(serie => ({
              tipoSerie: serie.tipoSerie,
              carga: serie.carga,
              reps: serie.reps,
            })),
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        Alert.alert('Erro', err.error || 'Erro ao salvar treino');
        return;
      }

    Alert.alert(
      'Sucesso',
      `Treino "${titulo}" salvo com sucesso!`,
      [
        {
          text: 'OK',
           onPress: () => router.back()
        }
      ]
    );

try {
  const xpResponse = await fetch('${API_URL}api/gamificacao/add-xp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${memoryToken}`,
    },
    body: JSON.stringify({
      xpGanho: 10, // valor fixo de XP ganho por treino
    }),
  });

  if (xpResponse.ok) {
    console.log('XP adicionado com sucesso!');
  } else {
    const err = await xpResponse.json();
    console.warn('Falha ao adicionar XP:', err);
  }
} catch (xpError) {
  console.warn('Erro ao adicionar XP:', xpError);
}
      setTitulo('');
      setData('');
      setExercicios([]);
      setDescanso('');
      setAlimentacao('');
      setHumor('');
      setEsforco('');
      setObservacoes('');
    } catch (error: any) {
      console.log('Erro detalhado:', error);
      Alert.alert('Erro', `Erro ao conectar com o servidor: ${error.message || error}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Título do Treino</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Upper Body"
          value={titulo}
          onChangeText={setTitulo}
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Data do Treino (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2025-05-04"
          value={data}
          onChangeText={setData}
          placeholderTextColor="#888"
        />

        <TouchableOpacity
          style={styles.btnAdicionarExercicio}
          onPress={() => setModalEscolherExercicioVisivel(true)}
        >
          <Text style={styles.btnAdicionarExercicioText}>+ Adicionar Exercício</Text>
        </TouchableOpacity>

        <Text style={styles.subTitle}>Exercícios Selecionados</Text>
        {exercicios.length === 0 && (
          <Text style={{ color: '#ccc', fontStyle: 'italic' }}>Nenhum exercício selecionado.</Text>
        )}

        {exercicios.map((ex, idx) => (
          <View key={ex.exerciseId} style={styles.exercicioContainer}>
            <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16 }}>
              {ex.name ?? ''}
            </Text>

            <Text style={[styles.labelPequeno, { marginTop: 8 }]}>Carga do Exercício</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={ex.carga !== undefined ? String(ex.carga) : ''}
              onChangeText={text => {
                const newExercicios = [...exercicios];
                newExercicios[idx].carga = Number(text) || 0;
                setExercicios(newExercicios);
              }}
              placeholder="Carga do exercício"
              placeholderTextColor="#999"
            />

            {ex.seriesDetalhes.length === 0 ? (
              <Text style={{ color: '#ccc', fontStyle: 'italic', marginTop: 8 }}>
                Nenhuma série adicionada.
              </Text>
            ) : (
              ex.seriesDetalhes.map((serie, sidx) => (
                <View key={sidx} style={styles.serieContainer}>
                  <Text style={styles.labelPequeno}>Tipo de Série</Text>
                  <TextInput
                    style={styles.input}
                    value={serie.tipoSerie ?? ''}
                    onChangeText={text => {
                      const newExercicios = [...exercicios];
                      newExercicios[idx].seriesDetalhes[sidx].tipoSerie =
                        text as 'aquecimento' | 'feeder' | 'validas';
                      setExercicios(newExercicios);
                    }}
                    placeholder="aquecimento, feeder ou validas"
                    placeholderTextColor="#999"
                  />

                  <Text style={[styles.labelPequeno, { marginTop: 8 }]}>Carga</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={serie.carga !== undefined ? String(serie.carga) : ''}
                    onChangeText={text => {
                      const newExercicios = [...exercicios];
                      newExercicios[idx].seriesDetalhes[sidx].carga = Number(text) || 0;
                      setExercicios(newExercicios);
                    }}
                    placeholder="Carga"
                    placeholderTextColor="#999"
                  />

                  <Text style={[styles.labelPequeno, { marginTop: 8 }]}>Repetições</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={serie.reps !== undefined ? String(serie.reps) : ''}
                    onChangeText={text => {
                      const newExercicios = [...exercicios];
                      newExercicios[idx].seriesDetalhes[sidx].reps = Number(text) || 0;
                      setExercicios(newExercicios);
                    }}
                    placeholder="Repetições"
                    placeholderTextColor="#999"
                  />
                </View>
              ))
            )}

            <TouchableOpacity
              style={[styles.btnAdicionarExercicio, { marginTop: 10, backgroundColor: '#28a745' }]}
              onPress={() => {
                const newExercicios = [...exercicios];
                newExercicios[idx].seriesDetalhes.push({
                  tipoSerie: 'aquecimento',
                  carga: 0,
                  reps: 0,
                });
                setExercicios(newExercicios);
              }}
            >
              <Text style={[styles.btnAdicionarExercicioText, { color: '#fff' }]}>
                + Adicionar Série
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.subTitle}>Anotações finais</Text>
        <TextInput
          style={styles.input}
          placeholder="Descanso (1-10)"
          keyboardType="numeric"
          value={descanso}
          onChangeText={setDescanso}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Alimentação (1-10)"
          keyboardType="numeric"
          value={alimentacao}
          onChangeText={setAlimentacao}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Humor (1-10)"
          keyboardType="numeric"
          value={humor}
          onChangeText={setHumor}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Esforço entre as séries (1-10)"
          keyboardType="numeric"
          value={esforco}
          onChangeText={setEsforco}
          placeholderTextColor="#888"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Anotações extras"
          multiline
          value={observacoes}
          onChangeText={setObservacoes}
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.btnSubmit} onPress={enviarTreino}>
          <Text style={styles.btnSubmitText}>Salvar treino</Text>
        </TouchableOpacity>
      </ScrollView>

      {modalEscolherExercicioVisivel && (
        <View style={styles.modalWrapper}>
          <AdicionarExercicio
            onVoltar={() => setModalEscolherExercicioVisivel(false)}
            onAdicionarExercicios={adicionarExerciciosSelecionados}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flex: 1,
    paddingTop: 50
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    color: '#fff',
  },
  labelPequeno: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    color: '#fff',
  },
  subTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    color: '#ccc',
  },
  exercicioContainer: {
    backgroundColor: '#2c2c2c',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  serieContainer: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  btnSubmit: {
    backgroundColor: '#28a745',
    padding: 15,
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 20,
  },
  btnSubmitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  btnAdicionarExercicio: {
    backgroundColor: '#007bff',
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 16,
  },
  btnAdicionarExercicioText: {
    color: '#fff',
    fontSize: 16,
  },
  modalWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    zIndex: 999,
  },
});
