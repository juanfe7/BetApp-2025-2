import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Usamos el hook useContext para acceder a las propiedades del AuthContext
  const { register, isLoading } = useContext(AuthContext);

  const handleRegister = async () => {
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      // Intentar registrar al usuario
      setErrorMessage('');
      await register(email, password);
      // Si el registro es exitoso, Supabase se encargará de gestionar la sesión
      // y AuthContext actualizará el estado global.
      // Puedes redirigir al usuario si es necesario.
      console.log("Registration successful! User logged in automatically.");
      router.push('/'); // Redirigir al home o a una pantalla de inicio
    } catch (error) {
      // Capturar cualquier error del proceso de registro (por ejemplo, email ya en uso)
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <View style={styles.container}>

      {/* Figuras decorativas */}
      <View style={styles.circleTopLeft} />
      <View style={styles.circleBottomRight} />
      <View style={styles.squareTopRight} />
      <View style={styles.squareBottomLeft} />
      <View style={styles.triangleCenter} />

      {/* Logo */}
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

      <Text style={styles.text}>Register</Text>

      {/* Campos de registro */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Mensaje de error */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* Botón registrar */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={isLoading} // Desactivar el botón mientras se procesa la solicitud
      >
        {/* Mostrar "Loading..." si está en proceso */}
        <Text style={styles.buttonText}>
          {isLoading ? 'Loading...' : 'SIGN UP'}
        </Text>
      </TouchableOpacity>

      {/* Volver a login */}
      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text style={{ color: '#0072f5ff', marginTop: 20, textDecorationLine: 'underline' }}>
          Already have an account?
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
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
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
