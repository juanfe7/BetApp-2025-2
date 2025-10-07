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
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 fetchBets con conteo de favoritas
  const fetchBets = async () => {
    setLoading(true);

    // Traer apuestas activas
    const { data: betsData, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (betsError) { console.error(betsError); setLoading(false); return; }

    // Traer opciones
    const { data: optionsData, error: optionsError } = await supabase
      .from("bet_options")
      .select("*");

    if (optionsError) { console.error(optionsError); setLoading(false); return; }

    // Traer todas las favoritas
    const { data: favoritesData, error: favoritesError } = await supabase
      .from("favorites")
      .select("user_id, bet_id");

    if (favoritesError) { console.error(favoritesError); setLoading(false); return; }

    const favoriteIdsUser = favoritesData?.filter(f => f.user_id === user?.id).map(f => f.bet_id) || [];

    // Conteo de favoritos por apuesta
    const favoritesCountMap: Record<string, number> = {};
    favoritesData?.forEach(f => {
      const id = f.bet_id;
      favoritesCountMap[id] = (favoritesCountMap[id] || 0) + 1;
    });

    const betsWithOptions = betsData.map(bet => ({
      ...bet,
      bet_options: optionsData.filter(opt => opt.bet_id === bet.id),
      isFavorite: favoriteIdsUser.includes(bet.id),
      favoritesCount: favoritesCountMap[bet.id] || 0,
    }));

    setBets(betsWithOptions);
    setLoading(false);
  };


  // Marcar/desmarcar favorita
  const toggleFavorite = async (betId: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .eq("bet_id", betId)
      .single();

    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, bet_id: betId });
    }

    fetchBets();
  };

  useEffect(() => {
    const loadBets = async () => {
      await fetchBets();
    };

    loadBets();

    const channel = supabase
      .channel("realtime-bets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets" },
        () => loadBets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "User";

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {displayName}</Text>
      <Text style={styles.title}>Available bets</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : bets.length === 0 ? (
        <Text style={styles.emptyText}>No available bets</Text>
      ) : (
        <FlatList
          data={bets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.betCard}>
              <View style={{ position: "relative" }}>
                {item.image_url && (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.betImage}
                    resizeMode="cover"
                  />
                )}

                <TouchableOpacity
                  style={[
                    styles.favoriteCircle,
                    { backgroundColor: item.isFavorite ? "#df0c0cff" : "#007AFF" },
                  ]}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Text style={styles.favoriteStar}>
                    {item.isFavorite ? "★" : "☆"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.betTitle}>{item.title}</Text>

              {/* Mostrar conteo de favoritas solo para admins */}
              {user?.role === "ADMIN" && (
                <Text style={styles.favoritesCount}>
                  ⭐ Favorited by {item.favoritesCount} user{item.favoritesCount !== 1 ? "s" : ""}
                </Text>
              )}

              <Text style={styles.betDesc}>{item.description}</Text>

              {user?.role === "ADMIN" ? (
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: "#ff9500" }]}
                  onPress={() =>
                    router.push({
                      pathname: "/main/betDetailAdmin",
                      params: { betId: item.id },
                    })
                  }
                >
                  <Text style={styles.optionText}>⚙ Manage bet</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ marginTop: 10 }}>
                  {item.bet_options?.map((opt: any) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={styles.optionButton}
                      onPress={() =>
                        router.push({
                          pathname: "/main/betDetail",
                          params: { betId: item.id, optionId: opt.id },
                        })
                      }
                    >
                      <Text style={styles.optionText}>
                        {opt.label} (fee: {opt.odds})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      )}

      {user?.role === "ADMIN" && (
        <TouchableOpacity
          style={styles.createBetButton}
          onPress={() => router.push("/main/create-bet")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>➕ Create bet</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#040913ff", padding: 20 },
  greeting: { fontSize: 20, fontWeight: "600", color: "#fff", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#fff" },
  emptyText: { textAlign: "center", color: "#aaa", marginTop: 30 },
  betCard: {
    backgroundColor: "#0a1222",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  betTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 2, color: "#fff" },
  favoritesCount: { fontSize: 14, color: "#ffd700", marginBottom: 5 },
  betDesc: { fontSize: 14, color: "#ccc", marginBottom: 8 },
  createBetButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  betImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  optionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  favoriteCircle: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  favoriteStar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
