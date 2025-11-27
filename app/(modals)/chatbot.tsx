import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from '../../contexts/AuthContext';

export default function ChatBot() {
  const { memoryToken } = useAuth();

  const [messages, setMessages] = useState([
    { id: "1", from: "bot", text: "Oi! Me diga seu treino e eu organizo tudo certinho 😄" },
  ]);
  const [input, setInput] = useState("");

  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      from: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const texto = input.trim();
    setInput("");

    // Mensagem temporária
    const loadingMsg = {
      id: (Date.now() + 1).toString(),
      from: "bot",
      text: "Processando treino... ⏳",
    };
    setMessages((prev) => [...prev, loadingMsg]);

    try {
      const response = await fetch("${API_URL}api/treinos/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: memoryToken ? `Bearer ${memoryToken}` : "",
        },
        body: JSON.stringify({ texto }),
      });

      const data = await response.json();

      // Remove a mensagem de carregando
      setMessages((prev) => prev.filter((m) => m.id !== loadingMsg.id));

      if (!response.ok || data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            from: "bot",
            text: "Erro ao interpretar treino. Tente novamente 😕",
          },
        ]);
        return;
      }

      // ---------------------------------------
      // FORMATADOR DE EXERCÍCIOS
      // ---------------------------------------
      const formattedExercises = data.TreinoExercicio.map((te: any) => {
  const nome = te.Exercise?.name ?? "Exercício desconhecido";

  const detalhes =
    te.Serie.length > 0
      ? te.Serie.map((s: any) => `${s.carga}kg x ${s.reps}`).join(", ")
      : "sem séries registradas";

  return `• ${nome} — ${detalhes}`;
}).join("\n");

// MONTAR RESPOSTA BONITA
const formatted = `
Título: ${data.titulo}
Data: ${new Date(data.data).toLocaleDateString("pt-BR")}

Exercícios:
${formattedExercises}
`.trim();

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), from: "bot", text: formatted },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          from: "bot",
          text: "Erro ao conectar com a IA 😢",
        },
      ]);
    }
  };

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.from === "user" ? styles.userMsg : styles.botMsg,
            ]}
          >
            <Text style={styles.msgText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 15, paddingTop: 70 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  message: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  userMsg: {
    backgroundColor: "#1f6feb",
    alignSelf: "flex-end",
  },
  botMsg: {
    backgroundColor: "#30363d",
    alignSelf: "flex-start",
  },
  msgText: {
    color: "#fff",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingBottom: 50
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#fff",
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#1f6feb",
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
