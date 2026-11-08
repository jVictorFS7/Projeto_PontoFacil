import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,  KeyboardAvoidingView, Platform, Image} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../src/context/AuthContext";
import { db } from "../../src/firebaseConnection";

export default function Funcionario() {
  const { user, funcionario, atualizarFuncionario, logout} = useAuth();

  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [fotoURL, setFotoURL] = useState(null);
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // Preenche os campos com os dados do funcionário
  useEffect(() => {
    setNome(funcionario?.nome || user?.displayName || "");
    setCargo(funcionario?.cargo || "");
    setFotoURL(funcionario?.foto || null);
  }, [funcionario, user?.displayName]);

  // Seleciona uma foto da galeria
  async function selecionarFoto() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à galeria para escolher sua foto.",
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!resultado.canceled) {
        setFotoSelecionada(resultado.assets[0].uri);
      }
    } catch (error) {
      console.log("Erro ao selecionar foto:", error);

      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  }

  // Redimensiona e converte a foto para Base64
  async function converterFoto(uri) {
    const imagem = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 300, height: 300 } }],
      {
        compress: 0.4,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      },
    );

    return `data:image/jpeg;base64,${imagem.base64}`;
  }

  // Salva os dados do funcionário
  async function salvarAlteracoes() {
    if (!nome.trim() || !cargo.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    setSalvando(true);

    try {
      // Atualiza nome e cargo
      await atualizarFuncionario({
        nome: nome.trim(),
        cargo: cargo.trim(),
      });

      // Se uma nova foto foi selecionada, salva no Firestore
      if (fotoSelecionada) {
        const fotoConvertida = await converterFoto(fotoSelecionada);

        await updateDoc(doc(db, "funcionarios", user.uid), {
          foto: fotoConvertida,
        });

        setFotoURL(fotoConvertida);
        setFotoSelecionada(null);
      }

      Alert.alert("Sucesso!", "Seus dados foram atualizados.");
    } catch (error) {
      console.log("Erro ao atualizar funcionário:", error);

      Alert.alert(
        "Erro",
        "Não foi possível atualizar seus dados. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  // Mostra a foto selecionada ou a foto já salva
  const imagemPerfil = fotoSelecionada || fotoURL;

  async function confirmarLogout() {
    Alert.alert(
      "Sair da conta",
      "Tem certeza de que deseja sair do aplicativo?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.log("Erro ao sair:", error);

              Alert.alert(
                "Erro",
                "Não foi possível sair da conta. Tente novamente.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Meu Perfil</Text>

          <Text style={styles.subtitulo}>
            Consulte e atualize seus dados pessoais.
          </Text>
        </View>

        {/* Foto do funcionário */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {imagemPerfil ? (
              <Image
                source={{ uri: imagemPerfil }}
                style={styles.imagemPerfil}
              />
            ) : (
              <Ionicons name="person" size={48} color="#2563EB" />
            )}

            <TouchableOpacity
              style={styles.botaoCamera}
              onPress={selecionarFoto}
              disabled={salvando}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={selecionarFoto} disabled={salvando}>
            <Text style={styles.textoAlterarFoto}>Alterar foto</Text>
          </TouchableOpacity>

          <Text style={styles.nomeAvatar}>{nome || "Funcionário"}</Text>

          <Text style={styles.emailAvatar}>
            {funcionario?.email || user?.email || ""}
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.cartao}>
          <Text style={styles.tituloFormulario}>Dados do funcionário</Text>

          {/* Nome */}
          <Text style={styles.label}>Nome completo</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#64748B" />

            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#94A3B8"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              editable={!salvando}
            />
          </View>

          {/* Cargo */}
          <Text style={styles.label}>Cargo</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="briefcase-outline" size={20} color="#64748B" />

            <TextInput
              style={styles.input}
              placeholder="Digite seu cargo"
              placeholderTextColor="#94A3B8"
              value={cargo}
              onChangeText={setCargo}
              autoCapitalize="words"
              editable={!salvando}
            />
          </View>

          {/* E-mail */}
          <Text style={styles.label}>E-mail</Text>

          <View style={[styles.inputContainer, styles.inputDesabilitado]}>
            <Ionicons name="mail-outline" size={20} color="#94A3B8" />

            <TextInput
              style={styles.input}
              value={funcionario?.email || user?.email || ""}
              editable={false}
            />

            <Ionicons name="lock-closed-outline" size={17} color="#94A3B8" />
          </View>

          <Text style={styles.aviso}>
            O e-mail não pode ser alterado nesta tela.
          </Text>

          {/* Botão salvar */}
          <TouchableOpacity
            style={[styles.botao, salvando && styles.botaoDesabilitado]}
            onPress={salvarAlteracoes}
            disabled={salvando}
            activeOpacity={0.8}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />

                <Text style={styles.textoBotao}>Salvar alterações</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoSair}
            onPress={confirmarLogout}
            disabled={salvando}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />

            <Text style={styles.textoBotaoSair}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.rodape}>
          Ponto Fácil • Gerenciamento de funcionário
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },

  conteudo: {
    padding: 22,
    paddingTop: 45,
    paddingBottom: 35,
  },

  header: {
    marginBottom: 25,
  },

  titulo: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#1E293B",
  },

  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 7,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },

  imagemPerfil: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  botaoCamera: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F5F8FF",
  },

  textoAlterarFoto: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
  },

  nomeAvatar: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },

  emailAvatar: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },

  cartao: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  tituloFormulario: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    paddingLeft: 10,
  },

  inputDesabilitado: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },

  aviso: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: -10,
    marginBottom: 8,
  },

  botao: {
    height: 54,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginTop: 15,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  rodape: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 25,
  },
  botaoSair: {
    height: 54,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginTop: 12,
  },

  textoBotaoSair: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "bold",
  },
});
