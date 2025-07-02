import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function PerfilScreen() {
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [senha, setSenha] = useState('********');

  const [nome, setNome] = useState('Nicolas');
  const [email, setEmail] = useState('nicolasmrodrigues950@gmail.com');

  async function escolherImagem() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para trocar a foto.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setFotoUri(pickerResult.assets[0].uri);
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
            <Text style={{ color: '#aaa' }}>Clique para adicionar foto</Text>
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
            onBlur={() => setEditandoNome(false)}
          />
        ) : (
          <Text style={styles.texto}>{nome}</Text>
        )}
        <TouchableOpacity onPress={() => setEditandoNome(!editandoNome)}>
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
            onBlur={() => setEditandoEmail(false)}
          />
        ) : (
          <Text style={styles.texto}>{email}</Text>
        )}
        <TouchableOpacity onPress={() => setEditandoEmail(!editandoEmail)}>
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
            secureTextEntry
            onBlur={() => setEditandoSenha(false)}
          />
        ) : (
          <Text style={styles.texto}>********</Text>
        )}
        <TouchableOpacity onPress={() => setEditandoSenha(!editandoSenha)}>
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
  },
});
