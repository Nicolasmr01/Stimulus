import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';

export default function PerfilScreen() {
  const { memoryToken } = useAuth();

  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('********');

  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const res = await fetch('http://192.168.15.8:3333/api/perfil', {
          headers: {
            Authorization: `Bearer ${memoryToken}`,
          },
        });

        if (!res.ok) {
          throw new Error('Erro ao buscar perfil');
        }

        const data = await res.json();
        setNome(data.name);
        setEmail(data.email);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
      }
    }

    if (memoryToken) {
      fetchPerfil();
    }
  }, [memoryToken]);

  async function escolherImagem() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  }

  async function atualizarCampo(chave: string, valor: string) {
    try {
      const response = await fetch(`http://192.168.15.8:3333/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memoryToken}`,
        },
        body: JSON.stringify({ [chave]: valor }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar');
      }

      Alert.alert('Sucesso', `${chave} atualizado com sucesso!`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o campo.');
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={escolherImagem}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.fotoPerfil} />
        ) : (
          <View style={[styles.fotoPerfil, styles.fotoPlaceholder]}>
            <Icon name="user" size={60} color="#aaa" />
            <Text style={{ color: '#aaa' }}>Adicionar foto</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Nome */}
      <View style={styles.campo}>
        {editandoNome ? (
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            onBlur={() => {
              setEditandoNome(false);
              atualizarCampo('name', nome);
            }}
          />
        ) : (
          <Text style={styles.texto}>{nome}</Text>
        )}
        <TouchableOpacity onPress={() => setEditandoNome(true)}>
          <Icon name="edit-2" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Email */}
      <View style={styles.campo}>
        {editandoEmail ? (
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onBlur={() => {
              setEditandoEmail(false);
              atualizarCampo('email', email);
            }}
          />
        ) : (
          <Text style={styles.texto}>{email}</Text>
        )}
        <TouchableOpacity onPress={() => setEditandoEmail(true)}>
          <Icon name="edit-2" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Senha */}
      <View style={styles.campo}>
        {editandoSenha ? (
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            onBlur={() => {
              setEditandoSenha(false);
              atualizarCampo('password', senha);
              setSenha('********');
            }}
            secureTextEntry
          />
        ) : (
          <Text style={styles.texto}>********</Text>
        )}
        <TouchableOpacity onPress={() => setEditandoSenha(true)}>
          <Icon name="edit-2" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  fotoPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#ddd',
  },
  fotoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  campo: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },
  texto: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    paddingVertical: 2,
    color: '#000',
  },
});
