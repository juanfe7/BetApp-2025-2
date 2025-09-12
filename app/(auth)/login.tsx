import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const router = useRouter();
  const { login, isLoading } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      console.log("✅ Login correcto");
      router.push('/main/(tabs)/home');
    } catch (error: any) {
      console.log("❌ Error en login:", error);
      Alert.alert("Error", error.message || "Correo o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

      <Text style={styles.text}>Login</Text>

      <View style={styles.circleTopLeft} />
      <View style={styles.circleBottomRight} />
      <View style={styles.squareTopRight} />
      <View style={styles.squareBottomLeft} />
      <View style={styles.triangleCenter} />


      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginbutton} onPress={handleLogin} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Cargando..." : "LOGIN"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>

      <Pressable onPress={() => router.push('/(auth)/reset')}>
        <Text style={{ color: '#0072f5ff', marginTop: 20, textDecorationLine: 'underline' }}>
          Forgot your password?
        </Text>
      </Pressable>
    </View>
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