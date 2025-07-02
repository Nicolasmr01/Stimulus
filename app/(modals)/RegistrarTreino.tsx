import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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

type Exercise = {
  id: number;
  name: string;
  photoUrl?: string;
};

type ExercicioInput = {
  exerciseId: number;
  series: number;
  carga: number;
  tipoSerie: 'aquecimento' | 'pap' | 'validas';
  name?: string;
  photoUrl?: string;
};

export default function RegistrarTreino() {
  const { memoryToken } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [exercicios, setExercicios] = useState<ExercicioInput[]>([]);
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [descanso, setDescanso] = useState('');
  const [alimentacao, setAlimentacao] = useState('');
  const [humor, setHumor] = useState('');
  const [esforco, setEsforco] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (!memoryToken) return;

    fetch('http://192.168.15.8:3333/api/exercicios', {
      headers: {
        Authorization: `Bearer ${memoryToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('exercisesList API:', data);
        setExercisesList(Array.isArray(data) ? data : []);
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os exercícios.'));
  }, [memoryToken]);

  const validarData = (dataStr: string) => {
    const dataObj = new Date(dataStr);
    return !isNaN(dataObj.getTime());
  };

  const adicionarExercicio = (ex: Exercise) => {
    if (exercicios.some(e => e.exerciseId === ex.id)) {
      Alert.alert('Atenção', 'Exercício já adicionado');
      return;
    }
    setExercicios([
      ...exercicios,
      {
        exerciseId: ex.id,
        series: 1,
        carga: 0,
        tipoSerie: 'validas',
        name: ex.name,
        photoUrl: ex.photoUrl,
      },
    ]);
  };

  const atualizarExercicio = (index: number, campo: keyof ExercicioInput, valor: any) => {
    const novos = [...exercicios];
    novos[index] = { ...novos[index], [campo]: valor };
    setExercicios(novos);
  };

  const removerExercicio = (index: number) => {
    Alert.alert('Remover exercício', 'Tem certeza que deseja remover este exercício?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          const novaLista = [...exercicios];
          novaLista.splice(index, 1);
          setExercicios(novaLista);
        },
      },
    ]);
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

    if (!memoryToken) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      const body = {
        titulo,
        data: new Date(data).toISOString(),
        exercicios: exercicios.map(({ exerciseId, series, carga, tipoSerie }) => ({
          exerciseId,
          series,
          carga,
          tipoSerie,
        })),
        descanso: descanso ? Number(descanso) : undefined,
        alimentacao: alimentacao ? Number(alimentacao) : undefined,
        humor: humor ? Number(humor) : undefined,
        esforco: esforco ? Number(esforco) : undefined,
        observacoes,
      };

      console.log('Enviando treino:', body);

      const response = await fetch('http://192.168.15.8:3333/api/treinos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memoryToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.error || 'Erro desconhecido ao salvar treino');
        return;
      }

      Alert.alert('Sucesso', 'Treino registrado com sucesso!');
      setExercicios([]);
      setTitulo('');
      setData('');
      setDescanso('');
      setAlimentacao('');
      setHumor('');
      setEsforco('');
      setObservacoes('');
    } catch (error) {
      console.error('Erro no envio:', error);
      Alert.alert('Erro', 'Falha ao registrar treino');
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

        <Text style={styles.subTitle}>Escolher Exercício</Text>
        <View style={styles.exList}>
          {Array.isArray(exercisesList) &&
            exercisesList.map(ex => (
              <TouchableOpacity
                key={ex.id}
                style={styles.exCard}
                onPress={() => adicionarExercicio(ex)}
              >
                {ex.photoUrl && <Image source={{ uri: ex.photoUrl }} style={styles.exImage} />}
                <Text style={{ textAlign: 'center', color: '#fff' }}>{ex.name}</Text>
              </TouchableOpacity>
            ))}
        </View>

        <Text style={styles.subTitle}>Exercícios Selecionados</Text>
        {exercicios.map((ex, idx) => (
          <View key={idx} style={styles.exercicioContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: 'bold', color: '#fff' }}>{ex.name}</Text>
              <TouchableOpacity onPress={() => removerExercicio(idx)}>
                <Text style={{ color: 'red', fontSize: 18 }}>❌</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Séries"
              keyboardType="numeric"
              value={ex.series.toString()}
              onChangeText={text => atualizarExercicio(idx, 'series', Number(text) || 0)}
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Carga (kg)"
              keyboardType="numeric"
              value={ex.carga.toString()}
              onChangeText={text => atualizarExercicio(idx, 'carga', Number(text) || 0)}
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Tipo de série (aquecimento, pap, validas)"
              value={ex.tipoSerie}
              onChangeText={text =>
                atualizarExercicio(
                  idx,
                  'tipoSerie',
                  ['aquecimento', 'pap', 'validas'].includes(text)
                    ? (text as ExercicioInput['tipoSerie'])
                    : 'validas'
                )
              }
              placeholderTextColor="#888"
            />
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    color: '#fff',
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
  exList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  exCard: {
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: 100,
    margin: 4,
  },
  exImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
    borderRadius: 6,
  },
});
