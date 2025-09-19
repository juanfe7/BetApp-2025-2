import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from '@/utils/supabase';
import { CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useContext, useState } from "react";
import { Alert, Button, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [modalVisible, setModalVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [imagePickerPermission, requestImagePickerPermission] = ImagePicker.useMediaLibraryPermissions();


  // ... dentro de tu componente EditProfile
  const handleChoosePhoto = async () => {
    const { granted } = await requestImagePickerPermission();
    if (!granted) {
      Alert.alert("Permission required", "Please grant access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUrl(uri);
      // Opcional: Subir la imagen a Supabase aquí
      // await uploadImage(uri);
    }
    setModalVisible(false);
  };

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      Alert.alert("Permission required", "Please grant camera access.");
      await requestPermission();
      return;
    }
    
    // Aquí puedes abrir una vista de cámara o simplemente lanzar un `launchCameraAsync`
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUrl(uri);
      // Opcional: Subir la imagen a Supabase aquí
      // await uploadImage(uri);
    }
    setModalVisible(false);
  };

    const uploadImage = async (uri: string) => {
      if (!uri) return;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const fileExtension = uri.split('.').pop() || "jpg";
      const fileName = `${user.id}/avatar.${fileExtension}`; // 👈 carpeta por usuario

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExtension}`,
          cacheControl: "3600",
          upsert: false, // opcional: reemplaza si ya existe
        });

      if (error) {
        console.error("Error uploading image:", error);
        return null;
      }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };




  const handleSave = async () => {
    if (!user) return;

    let newAvatarUrl = avatarUrl;
    if (avatarUrl && avatarUrl.startsWith('file://')) {
        newAvatarUrl = await uploadImage(avatarUrl);
        if (!newAvatarUrl) {
            Alert.alert('Error', 'Failed to upload image. Profile not updated.');
            return;
        }
    }
    // Los datos que se van a actualizar en Supabase
    const updates = {
      name: name,
      avatar_url: newAvatarUrl,
      bio: bio,
      lastName: lastName,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      // ✅ PASO CLAVE: Actualiza el estado del usuario en el contexto
      // Combina los datos actuales del usuario con las actualizaciones
      setUser({ ...user, ...updates }); 

      Alert.alert("Éxito", "Perfil actualizado");
      router.push('/main/(tabs)/profile');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar perfil</Text>
      <Image
        source={{
          uri: avatarUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        }}
        style={styles.avatar}
      />
      <TextInput
        style={styles.input}
        placeholder="URL de imagen"
        placeholderTextColor="#aaa"
        value={avatarUrl}
        onChangeText={setAvatarUrl}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombres"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellidos"
        placeholderTextColor="#aaa"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="bio"
        placeholderTextColor="#aaa"
        value={bio}
        onChangeText={setBio}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Guardar cambios</Text>
      </TouchableOpacity>

      
      {/* Botón para abrir el modal */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={{ color: '#0072f5ff', textAlign: 'center', marginTop: 10 }}>Change Photo</Text>
      </TouchableOpacity>

      {/* Modal para elegir la fuente de la foto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a photo</Text>
            <Button title="Take Photo" onPress={handleTakePhoto} />
            <Button title="Choose from Library" onPress={handleChoosePhoto} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View> );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#040913ff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#0072f5ff",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    color: "#fff",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#0072f5ff",
  },
  saveButton: {
    backgroundColor: "#0072f5ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#0a1222',
    padding: 20,
    borderRadius: 15,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
});