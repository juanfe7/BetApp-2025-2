import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';




export default function TabLayout() {
    const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0072f5ff',   // Color activo (azul)
        tabBarInactiveTintColor: '#ffffff',   // Color inactivo (blanco)
        tabBarStyle: {
          backgroundColor: '#040913ff',       // Fondo de la barra
          borderTopColor: '#0072f5ff',        // Línea superior de la tab bar
          borderTopWidth: 2,
        },
        headerStyle: { backgroundColor: "#040913" }, // Fondo del header
        headerTintColor: "#fff",         // Color del texto e íconos
        headerTitleStyle: { fontWeight: "bold" }, // Estilo del título

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
            <TouchableOpacity
              style={{  }}
              onPress={() => {
                // Aquí limpias token, storage, etc
                router.push('/(auth)/login');
              }}
            >
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
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#040913ff',
  },
  text: {
    color: '#ffffffff',
    fontSize: 24,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#0072f5ff',
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 8,
    width: 200,
    borderRadius: 25,
    color: '#ffffffff',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#040913ff',
    borderColor: '#0072f5ff',
    borderWidth: 2,
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  loginbutton: {
    marginTop: 16,
    backgroundColor: '#0072f5ff',
    borderColor: '#ffffffff',
    borderWidth: 2,
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 25,
  },
  circleTopLeft: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#0072f5ff',
    opacity: 0.3,
  },
  circleBottomRight: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ffffffff',
    opacity: 0.3,
  },
  squareTopRight: {
    position: 'absolute',
    top: 40,
    right: -30,
    width: 100,
    height: 100,
    backgroundColor: '#0072f5ff',
    opacity: 0.2,
    transform: [{ rotate: '20deg' }],
  },
  squareBottomLeft: {
    position: 'absolute',
    bottom: 30,
    left: -40,
    width: 120,
    height: 120,
    backgroundColor: '#ffffffff',
    opacity: 0.2,
    transform: [{ rotate: '15deg' }],
  },
  triangleCenter: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 90,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0072f5ff',
    opacity: 0.25,
  },
});
