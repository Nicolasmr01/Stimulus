import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { BASE_API_URL } from '../../utils/api';

export default function PerfilScreen() {
  const { memoryToken, logout } = useAuth();
  const { setUser } = useUser();
  const router = useRouter();

  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('********');
  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);

  // Gamificação
  const [nivel, setNivel] = useState(1);
  const [pontos, setPontos] = useState(0);
  const [medalhas, setMedalhas] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const res = await fetch(`${BASE_API_URL}/perfil`, {
          headers: { Authorization: `Bearer ${memoryToken}` },
        });
        if (!res.ok) throw new Error('Erro ao buscar perfil');
        const data = await res.json();
        setNome(data.name);
        setEmail(data.email);
        setFotoUri(data.photoUrl);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
      }
    }

    async function fetchGamificacao() {
      try {
        const res = await fetch(`${BASE_API_URL}/gamificacao`, {
          headers: { Authorization: `Bearer ${memoryToken}` },
        });
        if (!res.ok) throw new Error('Erro ao buscar gamificação');
        const data = await res.json();
        setNivel(data.nivel);
        setPontos(data.pontos);
        setMedalhas(data.medalhas || []);
      } catch (err) {
        console.error(err);
      }
    }

    if (memoryToken) {
      fetchPerfil();
      fetchGamificacao();
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

    if (!result.canceled) setFotoUri(result.assets[0].uri);
  }

  async function atualizarCampo(chave: string, valor: string) {
    try {
      const response = await fetch(`${BASE_API_URL}/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memoryToken}`,
        },
        body: JSON.stringify({ [chave]: valor, photoUrl: fotoUri }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar');
      Alert.alert('Sucesso', `${chave} atualizado com sucesso!`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o campo.');
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      {/* Foto do Perfil */}
      <TouchableOpacity onPress={escolherImagem}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.fotoPerfil} />
        ) : (
          <Image
            source={{
              uri: 'https://saladeimprensa.com.br/images/noticias/1763/5f665324a3a9bc93228b63cf8219aa04.webp',
            }}
            style={styles.fotoPerfil}
          />
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

      {/* Barra de XP */}
      <View style={styles.xpContainer}>
        <Text style={styles.texto}>Nível {nivel} — {pontos}/100 XP</Text>
        <View style={styles.xpBarBackground}>
          <View
            style={[
              styles.xpBarForeground,
              { width: `${(pontos / 100) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Medalhas */}
      <Text style={[styles.texto, { marginTop: 15, fontWeight: 'bold' }]}>Medalhas:</Text>
      <FlatList
        horizontal
        data={medalhas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.medalhaContainer}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2583/2583341.png' }}
              style={styles.medalhaImage}
            />
            <Text style={styles.medalhaNome}>{item.nome}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10 }}
      />

      {/* Botão de Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingTop: 80
  },
  fotoPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#333333',
  },
  campo: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 4,
  },
  texto: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#007bff',
    paddingVertical: 2,
    color: '#fff',
  },
  logoutButton: {
    marginTop: 30,
    padding: 14,
    backgroundColor: '#ff4d4d',
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpContainer: {
    width: '90%',
    marginTop: 20,
  },
  xpBarBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#444',
    borderRadius: 10,
    marginTop: 5,
  },
  xpBarForeground: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 10,
  },
  medalhaContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  medalhaImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  medalhaNome: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
});
