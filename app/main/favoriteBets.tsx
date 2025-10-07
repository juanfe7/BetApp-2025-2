import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function FavoritesScreen() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 Cargar apuestas favoritas del usuario
  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);

    // Traer apuestas favoritas
    const { data: favData, error: favError } = await supabase
      .from("favorites")
      .select("bet_id")
      .eq("user_id", user.id);

    if (favError) {
      console.error("Error fetching favorites:", favError.message);
      setLoading(false);
      return;
    }

    const favoriteIds = favData?.map(f => f.bet_id) || [];

    if (favoriteIds.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    // Traer detalles de esas apuestas
    const { data: betsData, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .in("id", favoriteIds)
      .order("created_at", { ascending: false });

    if (betsError) {
      console.error("Error fetching bets:", betsError.message);
      setLoading(false);
      return;
    }

    // Traer opciones
    const { data: optionsData, error: optionsError } = await supabase
      .from("bet_options")
      .select("*")
      .in("bet_id", favoriteIds);

    if (optionsError) {
      console.error("Error fetching options:", optionsError.message);
      setLoading(false);
      return;
    }

    // Unir opciones
    const betsWithOptions = betsData.map(bet => ({
      ...bet,
      bet_options: optionsData.filter(opt => opt.bet_id === bet.id),
      isFavorite: true, // ya sabemos que son favoritas
    }));

    setFavorites(betsWithOptions);
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();

    // Suscripción a cambios de favoritas
    const channel = supabase
      .channel("realtime-favorites")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "favorites" },
        () => fetchFavorites()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⭐ Your Favorite Bets</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : favorites.length === 0 ? (
        <Text style={styles.emptyText}>You have no favorite bets</Text>
      ) : (
        <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false} // Scroll vertical limpio
            renderItem={({ item }) => (
                <View style={styles.betCard}>
                {item.image_url && (
                    <Image
                    source={{ uri: item.image_url }}
                    style={styles.betImage}
                    resizeMode="cover"
                    />
                )}

                <Text style={styles.betTitle}>{item.title}</Text>
                <Text style={styles.betDesc}>{item.description}</Text>

                <View style={{ marginTop: 6 }}>
                    {item.bet_options?.map((opt: any) => (
                    <Text key={opt.id} style={styles.optionText}>
                        {opt.label} (fee: {opt.odds})
                    </Text>
                    ))}
                </View>
                </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#040913ff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#fff" },
  emptyText: { textAlign: "center", color: "#aaa", marginTop: 30 },
  betCard: {
    backgroundColor: "#0a1222",
    width: "100%",        // Ocupa todo el ancho disponible
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,     // Separación vertical entre cartas
    borderWidth: 1,
    borderColor: "#007AFF",
    },
    betImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    },
    betTitle: { fontSize: 18, fontWeight: "bold", marginTop: 8, color: "#fff" },
    betDesc: { fontSize: 14, color: "#ccc", marginTop: 4 },
    optionText: { fontSize: 13, color: "#fff", marginTop: 3 },

});
