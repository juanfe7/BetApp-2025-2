import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Alert, TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      return;
    }
    Alert.alert("Sesión finalizada", "Has cerrado sesión correctamente.", [
      {
        text: "OK",
        onPress: () => router.replace('/(auth)/login'),
      }
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0072f5ff',
        tabBarInactiveTintColor: '#ffffff',
        tabBarStyle: {
          backgroundColor: '#040913ff',
          borderTopColor: '#0072f5ff',
          borderTopWidth: 2,
        },
        headerStyle: { backgroundColor: "#040913" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="home" color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSignOut}>
              <FontAwesome name="sign-out" size={22} color="#0072f5" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="reels"
        options={{
          title: "Reels",
          headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name="play-circle"
              size={focused ? 30 : 26}
              color={focused ? "#0072f5" : color}
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSignOut}>
              <FontAwesome name="sign-out" size={22} color="#0072f5" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="comments" color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSignOut}>
              <FontAwesome name="sign-out" size={22} color="#0072f5" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="user" color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSignOut}>
              <FontAwesome name="sign-out" size={22} color="#0072f5" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
