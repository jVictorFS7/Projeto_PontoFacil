import { useEffect, useState } from 'react';
import {  View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/firebaseConnection';
import { addDoc, collection, getDocs, query, where, serverTimestamp} from 'firebase/firestore';

import * as Haptics from 'expo-haptics';

export default function Inicio() {
  const { user, funcionario } = useAuth();

  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  const [agora, setAgora] = useState(new Date());

  // Atualiza o relógio na tela
  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // Busca os registros do funcionário
  async function buscarRegistros() {
    try {
      const consulta = query(
        collection(db, 'registros'),
        where('funcionarioId', '==', user.uid)
      );

      const resultado = await getDocs(consulta);

      const registros = resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      registros.sort((a, b) => {
        const dataA = a.dataHora?.toDate?.()?.getTime() || 0;
        const dataB = b.dataHora?.toDate?.()?.getTime() || 0;

        return dataB - dataA;
      });

      setUltimoRegistro(registros[0] || null);
    } catch (error) {
      console.log('Erro ao buscar registros:', error);
      Alert.alert('Erro', 'Não foi possível carregar os registros.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (user?.uid) {
      buscarRegistros();
    }
  }, [user?.uid]);

  // Define se o próximo registro será entrada ou saída
  const tipoRegistro =
    ultimoRegistro?.tipo === 'entrada' ? 'saida' : 'entrada';

  // Registra entrada ou saída
  async function registrarPonto() {
    if (!user?.uid) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    setRegistrando(true);

    try {
      const novoRegistro = {
        funcionarioId: user.uid,
        tipo: tipoRegistro,
        dataHora: serverTimestamp(),
      };

      const documento = await addDoc(
        collection(db, 'registros'),
        novoRegistro
      );

      setUltimoRegistro({
        id: documento.id,
        ...novoRegistro,
        dataHora: new Date(),
      });

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      Alert.alert(
        'Ponto registrado!',
        `${tipoRegistro === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso.`
      );
    } catch (error) {
      console.log('Erro ao registrar ponto:', error);
      Alert.alert('Erro', 'Não foi possível registrar seu ponto.');
    } finally {
      setRegistrando(false);
    }
  }

  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const horarioFormatado = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.textoLoading}>Carregando registros...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Ponto Fácil</Text>
          <Text style={styles.bemVindo}>Olá, {funcionario?.nome || user?.displayName || 'Funcionário'}!</Text>
        </View>
      </View>

      <View style={styles.cartaoHorario}>
        <Text style={styles.labelHorario}>Horário atual</Text>

        <Text style={styles.horario}>{horarioFormatado}</Text>

        <Text style={styles.data}>{dataFormatada}</Text>
      </View>

      <View style={styles.cartaoPonto}>
        <Text style={styles.tituloCartao}>Registro de ponto</Text>

        <Text style={styles.descricao}>
          {tipoRegistro === 'entrada'
            ? 'Você ainda não registrou sua entrada ou já registrou sua saída.'
            : 'Sua entrada foi registrada. Registre sua saída ao finalizar.'}
        </Text>

        <View style={styles.botaoPonto}>
          <Text
            onPress={registrarPonto}
            style={[
              styles.textoBotao,
              registrando && styles.botaoDesabilitado,
            ]}
          >
            {registrando
              ? 'Registrando...'
              : tipoRegistro === 'entrada'
                ? 'REGISTRAR ENTRADA'
                : 'REGISTRAR SAÍDA'}
          </Text>
        </View>
      </View>

      <View style={styles.cartaoUltimo}>
        <Text style={styles.tituloCartao}>Último registro</Text>

        {ultimoRegistro ? (
          <>
            <Text style={styles.tipoUltimo}>
              {ultimoRegistro.tipo === 'entrada' ? 'Entrada' : 'Saída'}
            </Text>

            <Text style={styles.horarioUltimo}>
              {ultimoRegistro.dataHora?.toDate
                ? ultimoRegistro.dataHora.toDate().toLocaleTimeString('pt-BR')
                : new Date(ultimoRegistro.dataHora).toLocaleTimeString('pt-BR')}
            </Text>
          </>
        ) : (
          <Text style={styles.descricao}>
            Nenhum ponto registrado ainda.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  conteudo: {
    padding: 24,
    paddingTop: 55,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
  },
  textoLoading: {
    marginTop: 12,
    color: '#64748B',
  },
  header: {
    marginBottom: 30,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  bemVindo: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  cartaoHorario: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  labelHorario: {
    color: '#DBEAFE',
    fontSize: 15,
  },
  horario: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  data: {
    color: '#DBEAFE',
    fontSize: 14,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  cartaoPonto: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    elevation: 3,
  },
  tituloCartao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  descricao: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
  },
  botaoPonto: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 22,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  cartaoUltimo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    elevation: 3,
  },
  tipoUltimo: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  horarioUltimo: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
});
