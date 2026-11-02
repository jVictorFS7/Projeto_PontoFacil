import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";

import { AuthProvider, useAuth } from "../src/context/AuthContext";

function Navegacao() {
  const { user, carregando } = useAuth();

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (carregando) return;

    const estaNaAreaPrincipal = segments[0] === "(tabs)";

    if (!user && estaNaAreaPrincipal) {
      router.replace("/login");
    } else if (user && !estaNaAreaPrincipal) {
      router.replace("/(tabs)");
    }
  }, [user, carregando, segments]);

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F5F8FF",
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Navegacao />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F8FF",
  },
});
