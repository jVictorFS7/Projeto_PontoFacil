import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/firebaseConnection';

// Converte a data do Firestore para Date
function converterData(dataHora) {
  if (!dataHora) return null;

  let data;

  if (typeof dataHora.toDate === 'function') {
    data = dataHora.toDate();
  } else if (dataHora instanceof Date) {
    data = dataHora;
  } else {
    data = new Date(dataHora);
  }

  return Number.isNaN(data.getTime()) ? null : data;
}

// Formata o tipo de registro
function obterTipo(tipo) {
  const valor = String(tipo || '').toLowerCase();

  if (valor === 'entrada') {
    return {
      titulo: 'Entrada',
      icone: 'log-in-outline',
      cor: '#16A34A',
      fundo: '#DCFCE7',
    };
  }

  if (valor === 'saida' || valor === 'saída') {
    return {
      titulo: 'Saída',
      icone: 'log-out-outline',
      cor: '#DC2626',
      fundo: '#FEE2E2',
    };
  }

  return {
    titulo: tipo || 'Registro',
    icone: 'time-outline',
    cor: '#2563EB',
    fundo: '#DBEAFE',
  };
}

// Componente de cada registro
function ItemRegistro({ item }) {
  const data = converterData(item.dataHora);
  const tipo = obterTipo(item.tipo);

  return (
    <View style={styles.cardRegistro}>
      <View style={[styles.iconeRegistro, { backgroundColor: tipo.fundo }]}>
        <Ionicons
          name={tipo.icone}
          size={23}
          color={tipo.cor}
        />
      </View>

      <View style={styles.infoRegistro}>
        <Text style={styles.tipoRegistro}>
          {tipo.titulo}
        </Text>

        <Text style={styles.dataRegistro}>
          {data
            ? data.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : 'Data indisponível'}
        </Text>
      </View>

      <View style={styles.horarioContainer}>
        <Text style={styles.horarioRegistro}>
          {data
            ? data.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '--:--'}
        </Text>

        <Text style={styles.horarioLegenda}>
          Horário
        </Text>
      </View>
    </View>
  );
}

export default function Historico() {
  const { user, funcionario } = useAuth();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  // Busca os registros do funcionário logado
  const buscarRegistros = useCallback(async (mostrarLoading = true) => {
    if (!user?.uid) {
      setRegistros([]);
      setCarregando(false);
      return;
    }

    if (mostrarLoading) {
      setCarregando(true);
    } else {
      setAtualizando(true);
    }

    setErro('');

    try {
      const referencia = collection(db, 'registros');

      const consulta = query(
        referencia,
        where('funcionarioId', '==', user.uid)
      );

      const resultado = await getDocs(consulta);

      const lista = resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      // Ordena do registro mais recente para o mais antigo
      lista.sort((a, b) => {
        const dataA = converterData(a.dataHora)?.getTime() || 0;
        const dataB = converterData(b.dataHora)?.getTime() || 0;

        return dataB - dataA;
      });

      setRegistros(lista);

    } catch (error) {
      console.log('Erro ao buscar histórico:', error);

      setErro('Não foi possível carregar o histórico. Tente novamente.');

    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    buscarRegistros();
  }, [buscarRegistros]);

  // Contabiliza entradas e saídas
  const totalEntradas = registros.filter(
    (item) => String(item.tipo).toLowerCase() === 'entrada'
  ).length;

  const totalSaidas = registros.filter((item) => {
    const tipo = String(item.tipo).toLowerCase();
    return tipo === 'saida' || tipo === 'saída';
  }).length;

  if (carregando) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingTexto}>
          Carregando histórico...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemRegistro item={item} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lista}

        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => buscarRegistros(false)}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }

        ListHeaderComponent={
          <View>
            <Text style={styles.titulo}>
              Meu Histórico
            </Text>

            <Text style={styles.subtitulo}>
              Acompanhe suas entradas e saídas.
            </Text>

            <View style={styles.cardResumo}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoNumero}>
                  {registros.length}
                </Text>
                <Text style={styles.resumoLegenda}>
                  Registros
                </Text>
              </View>

              <View style={styles.divisor} />

              <View style={styles.resumoItem}>
                <Text style={[styles.resumoNumero, { color: '#16A34A' }]}>
                  {totalEntradas}
                </Text>
                <Text style={styles.resumoLegenda}>
                  Entradas
                </Text>
              </View>

              <View style={styles.divisor} />

              <View style={styles.resumoItem}>
                <Text style={[styles.resumoNumero, { color: '#DC2626' }]}>
                  {totalSaidas}
                </Text>
                <Text style={styles.resumoLegenda}>
                  Saídas
                </Text>
              </View>
            </View>

            <View style={styles.tituloLista}>
              <Text style={styles.tituloRegistros}>
                Todos os registros
              </Text>

              <Text style={styles.quantidade}>
                {registros.length}
              </Text>
            </View>

            {!!erro && (
              <View style={styles.avisoErro}>
                <Text style={styles.textoErro}>
                  {erro}
                </Text>

                <TouchableOpacity onPress={() => buscarRegistros()}>
                  <Text style={styles.tentarNovamente}>
                    Tentar novamente
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }

        ListEmptyComponent={
          !erro ? (
            <View style={styles.vazio}>
              <View style={styles.iconeVazio}>
                <Ionicons
                  name="time-outline"
                  size={38}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.vazioTitulo}>
                Nenhum registro encontrado
              </Text>

              <Text style={styles.vazioTexto}>
                Quando você registrar sua entrada ou saída,
                os pontos aparecerão aqui.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },

  lista: {
    padding: 20,
    paddingBottom: 35,
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTexto: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 22,
  },

  cardResumo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },

  resumoNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  resumoLegenda: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },

  divisor: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E8F0',
  },

  tituloLista: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  tituloRegistros: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  quantidade: {
    backgroundColor: '#DBEAFE',
    color: '#2563EB',
    fontWeight: 'bold',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },

  cardRegistro: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  iconeRegistro: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoRegistro: {
    flex: 1,
  },

  tipoRegistro: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  dataRegistro: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
    textTransform: 'capitalize',
  },

  horarioContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  horarioRegistro: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  horarioLegenda: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },

  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 45,
  },

  iconeVazio: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  vazioTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },

  vazioTexto: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },

  avisoErro: {
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  textoErro: {
    color: '#B91C1C',
    fontSize: 13,
  },

  tentarNovamente: {
    color: '#2563EB',
    fontWeight: 'bold',
    marginTop: 10,
  },
});
