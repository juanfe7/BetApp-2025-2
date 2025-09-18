import { AuthProvider } from "@/contexts/AuthContext";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";


export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("reset")) {
        router.push("/(auth)/reset");
      }
    });

    return () => subscription.remove();
  }, []);
  

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="main" />
      </Stack>
    </AuthProvider>
  );
}
