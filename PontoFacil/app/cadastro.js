import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform,} from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../src/components/Input';
import Botao from '../src/components/Botao';
import { useAuth } from '../src/context/AuthContext';

export default function Cadastro() {
  const router = useRouter();

  const { cadastrarFuncionario, carregando } = useAuth();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  async function handleCadastro() {
    if (!nome.trim() || !cpf.trim() || !cargo.trim() ||
        !email.trim() || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('Atenção', 'Informe um CPF com 11 dígitos.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    try {
      await cadastrarFuncionario({
        nome,
        cpf,
        cargo,
        email,
        senha,
      });

      Alert.alert(
        'Sucesso!',
        'Funcionário cadastrado com sucesso.'
      );

      router.replace('/(tabs)');
    } catch (error) {
      console.log('Erro no cadastro:', error);

      let mensagem = 'Não foi possível realizar o cadastro.';

      if (error.code === 'auth/email-already-in-use') {
        mensagem = 'Este e-mail já está cadastrado.';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'Informe um e-mail válido.';
      } else if (error.code === 'auth/weak-password') {
        mensagem = 'A senha é muito fraca.';
      } else if (error.code === 'permission-denied') {
        mensagem = 'Sem permissão para salvar os dados no banco.';
      }

      Alert.alert('Erro', mensagem);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Ponto Fácil</Text>
          <Text style={styles.titulo}>Criar conta</Text>
          <Text style={styles.subtitulo}>
            Cadastre seus dados para começar.
          </Text>
        </View>

        <View style={styles.formulario}>
          <Input
            label="Nome completo"
            placeholder="Digite seu nome"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <Input
            label="CPF"
            placeholder="Digite seu CPF"
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
          />

          <Input
            label="Cargo"
            placeholder="Ex: Desenvolvedor"
            value={cargo}
            onChangeText={setCargo}
            autoCapitalize="words"
          />

          <Input
            label="E-mail"
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            label="Senha"
            placeholder="Mínimo de 6 caracteres"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Input
            label="Confirmar senha"
            placeholder="Digite a senha novamente"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
          />

          <Botao
            titulo="Cadastrar funcionário"
            onPress={handleCadastro}
            carregando={carregando}
          />

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.linkTexto}>
              Já possui uma conta? <Text style={styles.linkDestaque}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  formulario: {
    width: '100%',
  },
  link: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  linkTexto: {
    color: '#64748B',
    fontSize: 14,
  },
  linkDestaque: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
