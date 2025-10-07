// app/main/reels.tsx
import { supabase } from "@/utils/supabase";
import { AntDesign } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import LottieView from 'lottie-react-native';





type Reel = {
  id: string;
  user_id: string;
  email: string;
  video_url: string;
  description: string;
  created_at: string;
};

export default function ReelsScreen() {
  const [videos, setVideos] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [description, setDescription] = useState("");
  const [pendingUri, setPendingUri] = useState<string | null>(null);

  const videoRefs = useRef<(Video | null)[]>([]);

  // ========================
  // FETCH DE VIDEOS (desde la tabla reels)
  // ========================
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err: any) {
      console.error("Error fetching reels:", err);
      Alert.alert("Error", "No se pudieron cargar los reels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // ========================
  // PICK VIDEO
  // ========================
  const pickVideo = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Permiso requerido", "Permite acceso a la galería para subir videos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.7,
      });

      const canceled = (result as any).canceled ?? (result as any).cancelled;
      if (canceled) return;

      const uri = (result as any).uri || (result as any).assets?.[0]?.uri;
      if (!uri) return;

      setPendingUri(uri);
      setShowDescriptionInput(true);
    } catch (err) {
      console.error("pickVideo error:", err);
      Alert.alert("Error", "No se pudo seleccionar el video.");
    }
  };

  // ========================
  // SUBIR VIDEO
  // ========================
  const uploadVideo = async (uri: string, description: string) => {
    setUploading(true);
    try {
      // ✅ Lee el archivo local como bytes
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const videoBytes = new Uint8Array(arrayBuffer);

      // extensión del archivo
      const ext = uri.split(".").pop()?.split("?")[0] || "mp4";
      const fileName = `reels/${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;

      // ✅ Sube el video
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, videoBytes, {
          contentType: `video/${ext}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // ✅ Obtiene URL pública
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);
      const url = urlData?.publicUrl || "";

      // ✅ Obtiene usuario actual
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Debes iniciar sesión para subir un reel.");

      // ✅ Inserta metadatos en la tabla reels
      const { error: insertError } = await supabase.from("reels").insert({
        user_id: user.id,
        email: user.email,
        video_url: url,
        description,
      });

      if (insertError) throw insertError;

      Alert.alert("Éxito", "Video subido ✅");
      setShowDescriptionInput(false);
      setDescription("");
      setPendingUri(null);

      // Refresca la lista
      fetchVideos();
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "No se pudo subir el video");
    } finally {
      setUploading(false);
    }
  };

  // ========================
  // REPRODUCCIÓN ACTIVA
  // ========================
  const onViewRef = useRef(({ viewableItems }: any) => {
    const first = viewableItems[0];
    setActiveIndex(first ? first.index : null);
  });
  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 75 });

  // ========================
  // RENDER ITEM
  // ========================
  const renderItem = ({ item, index }: { item: Reel; index: number }) => (
    <View style={styles.card}>
        <Video
        ref={(r) => {
            videoRefs.current[index] = r;
        }}
        source={{ uri: item.video_url }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={activeIndex === index}
        isLooping
        />

        {/* Capa de texto e íconos sobre el video */}
        <View style={styles.overlay}>
        <View style={styles.overlayHeader}>
            <AntDesign name="play-circle" size={24} color="white" />
            <Text style={styles.email}>{item.email}</Text>
        </View>

        <Text numberOfLines={2} style={styles.description}>
            {item.description || "Sin descripción"}
        </Text>
        </View>
    </View>
  );


  return (
    <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.headerRow}>
        <Text style={styles.header}>Reels</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickVideo}>
            <AntDesign name="plus" size={18} color="#fff" />
        </TouchableOpacity>
        </View>

        {/* Si está subiendo, mostrar Lottie en el centro */}
        {uploading && (
        <View style={styles.overlayLoading}>
            <LottieView
            source={require('../../../assets/images/loading.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
            />
            <Text style={{ color: "#fff", marginTop: 10 }}>Subiendo video...</Text>
        </View>
        )}

        {!uploading && (
        <>
            {showDescriptionInput && pendingUri && (
            <View style={styles.descBox}>
                <TextInput
                placeholder="Agrega una descripción..."
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                />
                <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => uploadVideo(pendingUri, description)}
                >
                <Text style={{ color: "#fff" }}>Subir</Text>
                </TouchableOpacity>
            </View>
            )}

            {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
            ) : videos.length === 0 ? (
            <View style={{ marginTop: 40, alignItems: "center" }}>
                <Text style={{ color: "#999" }}>No hay reels aún. Sube el primero 📽️</Text>
            </View>
            ) : (
            <FlatList
                data={videos}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                pagingEnabled
                onViewableItemsChanged={onViewRef.current}
                viewabilityConfig={viewConfigRef.current}
                showsVerticalScrollIndicator={false}
            />
            )}
        </>
        )}
    </View>
    );

}

// ========================
// ESTILOS
// ========================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  header: { color: "#fff", fontSize: 22, fontWeight: "700" },
  uploadBtn: { backgroundColor: "#007AFF", padding: 10, borderRadius: 10 },

  card: {
    height: 600,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 25,
  },
  video: { width: "100%", height: "100%" },

  // 💬 overlay con texto e ícono
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 15,
    right: 15,
  },
  overlayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  email: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  description: {
    color: "#ddd",
    fontSize: 14,
    lineHeight: 20,
  },

  descBox: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 10,
    margin: 12,
  },
  input: {
    color: "#fff",
    borderBottomColor: "#444",
    borderBottomWidth: 1,
    marginBottom: 8,
    padding: 4,
  },
  submitBtn: {
    backgroundColor: "#007AFF",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  overlayLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  }, 
});
