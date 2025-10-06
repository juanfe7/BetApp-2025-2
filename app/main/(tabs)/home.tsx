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

  // 👇 Cargar apuestas activas
  const fetchBets = async () => {
    setLoading(true);

    // Traer solo apuestas activas
    const { data: betsData, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "active") // 👈 solo activas
      .order("created_at", { ascending: false });

    if (betsError) {
      console.error("Error fetching bets:", betsError.message);
      setLoading(false);
      return;
    }

    // Traer opciones
    const { data: optionsData, error: optionsError } = await supabase
      .from("bet_options")
      .select("*");

    if (optionsError) {
      console.error("Error fetching bet options:", optionsError.message);
      setLoading(false);
      return;
    }

    // Unir apuestas con sus opciones
    const betsWithOptions = betsData.map((bet) => ({
      ...bet,
      bet_options: optionsData.filter((opt) => opt.bet_id === bet.id),
    }));

    setBets(betsWithOptions);
    setLoading(false);
  };

  useEffect(() => {
    fetchBets();

    // 👇 Suscripción a realtime en tabla bets
    const channel = supabase
      .channel("realtime-bets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets" },
        () => {
          fetchBets(); // refrescar apuestas
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // limpiar al desmontar
    };
  }, []);

  // 👇 Saludo dinámico
  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "User";

  return (
    <View style={styles.container}>
      {/* 👇 Saludo arriba */}
      <Text style={styles.greeting}>Hello, {displayName} </Text>
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
              {/* Imagen si existe */}
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.betImage}
                  resizeMode="cover"
                />
              )}

              <Text style={styles.betTitle}>{item.title}</Text>
              <Text style={styles.betDesc}>{item.description}</Text>

              {/* 👇 Renderizado diferente según rol */}
              {user?.role === "ADMIN" ? (
                // ADMIN → un solo botón para manejar apuesta completa
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
                // CLIENT → botones por opción
                item.bet_options?.length > 0 ? (
                  <View style={{ marginTop: 10 }}>
                    {item.bet_options.map((opt: any) => (
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
                ) : (
                  <Text style={{ color: "#aaa", marginTop: 8 }}>
                    No options available
                  </Text>
                )
              )}
            </View>
          )}
        />
      )}

      {/* Botón Crear Apuesta (solo ADMIN) */}
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
  betTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: "#fff" },
  betDesc: { fontSize: 14, color: "#ccc" },
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
});
