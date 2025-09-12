import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Register() {
  const router = useRouter();
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
        placeholder="Username"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
      />

      {/* Botón registrar */}
      <TouchableOpacity style={styles.button} onPress={() => console.log('Register pressed')}>
        <Text style={styles.buttonText}>SIGN UP</Text>
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
