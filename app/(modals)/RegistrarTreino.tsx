import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
    fetch('http://192.168.15.8:3333/api/exercicios')
      .then(res => res.json())
      .then(data => setExercisesList(data))
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os exercícios.'));
  }, []);

  const validarData = (dataStr: string) => {
    const dataObj = new Date(dataStr);
    return !isNaN(dataObj.getTime());
  };

  const adicionarExercicio = (ex: Exercise) => {
    if (exercicios.some(e => e.exerciseId === ex.id)) {
      Alert.alert('Atenção', 'Exercício já adicionado');
      return;
    }
    setExercicios([...exercicios, {
      exerciseId: ex.id,
      series: 1,
      carga: 0,
      tipoSerie: 'validas',
      name: ex.name,
      photoUrl: ex.photoUrl,
    }]);
  };

  const atualizarExercicio = (index: number, campo: keyof ExercicioInput, valor: any) => {
    const novos = [...exercicios];
    novos[index] = { ...novos[index], [campo]: valor };
    setExercicios(novos);
  };

  const removerExercicio = (index: number) => {
    Alert.alert(
      'Remover exercício',
      'Tem certeza que deseja remover este exercício?',
      [
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
      ]
    );
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
      const body = {
        userId: 1, // Substitua pelo ID do usuário logado
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
        headers: { 'Content-Type': 'application/json' },
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
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Título do Treino</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Upper Body"
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Data do Treino (AAAA-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 2025-07-02"
        value={data}
        onChangeText={setData}
      />

      <Text style={styles.subTitle}>Escolher Exercício</Text>
      <View style={styles.exList}>
        {exercisesList.map(ex => (
          <TouchableOpacity
            key={ex.id}
            style={styles.exCard}
            onPress={() => adicionarExercicio(ex)}
          >
            {ex.photoUrl && (
              <Image source={{ uri: ex.photoUrl }} style={styles.exImage} />
            )}
            <Text style={{ textAlign: 'center' }}>{ex.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subTitle}>Exercícios Selecionados</Text>
      {exercicios.map((ex, idx) => (
        <View key={idx} style={styles.exercicioContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold' }}>{ex.name}</Text>
            <TouchableOpacity onPress={() => removerExercicio(idx)}>
              <Text style={{ color: 'red', fontSize: 18 }}>❌</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Séries"
            keyboardType="numeric"
            value={ex.series.toString()}
            onChangeText={text =>
              atualizarExercicio(idx, 'series', Number(text) || 0)
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Carga (kg)"
            keyboardType="numeric"
            value={ex.carga.toString()}
            onChangeText={text =>
              atualizarExercicio(idx, 'carga', Number(text) || 0)
            }
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
      />

      <TextInput
        style={styles.input}
        placeholder="Alimentação (1-10)"
        keyboardType="numeric"
        value={alimentacao}
        onChangeText={setAlimentacao}
      />

      <TextInput
        style={styles.input}
        placeholder="Humor (1-10)"
        keyboardType="numeric"
        value={humor}
        onChangeText={setHumor}
      />

      <TextInput
        style={styles.input}
        placeholder="Esforço entre as séries (1-10)"
        keyboardType="numeric"
        value={esforco}
        onChangeText={setEsforco}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Anotações extras"
        multiline
        value={observacoes}
        onChangeText={setObservacoes}
      />

      <TouchableOpacity style={styles.btnSubmit} onPress={enviarTreino}>
        <Text style={styles.btnSubmitText}>Salvar treino</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  subTitle: { fontWeight: 'bold', fontSize: 20, marginTop: 20, marginBottom: 10 },
  exercicioContainer: {
    backgroundColor: '#f7f7f7',
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
  btnSubmitText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  exList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  exCard: {
    backgroundColor: '#f1f1f1',
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
