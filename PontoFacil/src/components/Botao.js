import { TouchableOpacity, Text, ActivityIndicator, StyleSheet} from "react-native";

export default function Botao({ titulo, onPress, carregando = false, disabled = false,}) {

  return (
    <TouchableOpacity
      style={[styles.botao, (disabled || carregando) && styles.desabilitado]}
      onPress={onPress}
      disabled={disabled || carregando}
      activeOpacity={0.8}
    >
      {carregando ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.texto}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
  
}

const styles = StyleSheet.create({
  botao: {
    width: "100%",
    height: 54,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  desabilitado: {
    opacity: 0.6,
  },
  texto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
