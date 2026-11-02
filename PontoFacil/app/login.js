import { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity,} from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../src/components/Input';
import Botao from '../src/components/Botao';
import { useAuth } from '../src/context/AuthContext';

export default function Login() {
  const router = useRouter();

  const { login, carregando } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    try {
      await login(email, senha);

      router.replace('/(tabs)');
    } catch (error) {
      console.log('Erro no login:', error);

      let mensagem = 'Não foi possível realizar o login.';

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        mensagem = 'E-mail ou senha incorretos.';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'Informe um e-mail válido.';
      } else if (error.code === 'auth/too-many-requests') {
        mensagem = 'Muitas tentativas. Tente novamente mais tarde.';
      }

      Alert.alert('Erro no login', mensagem);
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

          <Text style={styles.titulo}>Bem-vindo de volta!</Text>

          <Text style={styles.subtitulo}>
            Entre com seus dados para continuar.
          </Text>
        </View>

        <View style={styles.formulario}>
          <Input
            label="E-mail"
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            label="Senha"
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Botao
            titulo="Entrar"
            onPress={handleLogin}
            carregando={carregando}
          />

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.replace('/cadastro')}
          >
            <Text style={styles.linkTexto}>
              Ainda não possui uma conta?{' '}
              <Text style={styles.linkDestaque}>Cadastre-se</Text>
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
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
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
    textAlign: 'center',
  },
  formulario: {
    width: '100%',
  },
  link: {
    alignItems: 'center',
    marginTop: 24,
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
