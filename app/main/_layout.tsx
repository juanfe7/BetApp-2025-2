import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { 
      backgroundColor: "#040913" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" }, 
      }}>

          
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="editProfile" />

      {/* Pantallas fuera del tab bar */}
      <Stack.Screen name="betDetail" options={{ headerShown: true, title: "Bet detail" }} />
      <Stack.Screen name="create-bet" options={{ headerShown: true, title: "Creaate bet" }} />
    </Stack>
  );
}
