import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function BetDetail() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { betId } = useLocalSearchParams();

  const [bet, setBet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // cargar apuesta
  const fetchBet = async () => {
    setLoading(true);

    const { data: bet, error: betError } = await supabase
      .from("bets")
      .select("*")
      .eq("id", betId)
      .single();

    if (betError) {
      console.error("❌ Error cargando apuesta:", betError.message);
    } else {
      console.log("✅ Apuesta cargada:", bet);
    }
    

    const { data: options, error: optionsError } = await supabase
      .from("bet_options")
      .select("*")
      .eq("bet_id", betId);

    if (optionsError) {
      console.error("❌ Error cargando opciones:", optionsError.message);
    } else {
      console.log("✅ Opciones cargadas:", options);
    }

    if (bet) {
      setBet({ ...bet, bet_options: options || [] });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBet();
  }, []);

  // asignar ganador
  const handleSetWinner = async (winnerId: string) => {
    const betIdStr = Array.isArray(betId) ? betId[0] : betId;
    console.log("Bet ID recibido:", betIdStr, "Winner:", winnerId);

    Alert.alert(
        "Confirmar",
        "¿Seguro que quieres terminar esta apuesta con este ganador?",
        [
        { text: "Cancelar", style: "cancel" },
        {
            text: "Confirmar",
            style: "destructive",
            onPress: async () => {
            try {
                // 1️⃣ Actualizamos el estado de la apuesta
                const { data: betUpdated, error: betError } = await supabase
                .from("bets")
                .update({ status: "terminated", winner_option_id: winnerId })
                .eq("id", betIdStr)
                .select();

                if (betError) throw betError;
                console.log("✅ Apuesta actualizada:", betUpdated);

                // 2️⃣ Traemos los participantes que apostaron a la opción ganadora
                const { data: winners, error: winnersError } = await supabase
                .from("bets_participants")
                .select("user_id, amount")
                .eq("bet_id", betIdStr)
                .eq("option_id", winnerId);

                if (winnersError) throw winnersError;
                console.log("✅ Ganadores encontrados:", winners);

                // 3️⃣ Obtenemos la cuota de la opción ganadora
                const { data: winnerOption, error: optionError } = await supabase
                .from("bet_options")
                .select("odds")
                .eq("id", winnerId)
                .single();

                if (optionError) throw optionError;

                const multiplier = winnerOption?.odds || 1;

                // 4️⃣ Repartimos las ganancias
                for (const w of winners) {
                // Traemos el saldo actual
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("balance")
                    .eq("id", w.user_id)
                    .single();

                if (profileError) {
                    console.error("❌ Error obteniendo balance de usuario:", profileError.message);
                    continue; // seguimos con los demás
                }

                const newBalance = (profile.balance || 0) + w.amount * multiplier;

                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ balance: newBalance })
                    .eq("id", w.user_id);

                if (updateError) {
                    console.error("❌ Error actualizando saldo de usuario:", updateError.message);
                } else {
                    console.log(`✅ Usuario ${w.user_id} actualizado con balance ${newBalance}`);
                }
                }

                // 5️⃣ Refrescamos la apuesta local
                await fetchBet();
                Alert.alert("Éxito", "La apuesta fue finalizada y los ganadores recibieron sus premios");
                router.push("/main/home");

            } catch (err: any) {
                console.error("❌ Error finalizando apuesta:", err.message || err);
                Alert.alert("Error", err.message || "Ocurrió un error al finalizar la apuesta");
            }
            },
        },
        ]
    );
    };



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!bet) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>No se encontró la apuesta</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {bet.image_url && (
        <Image source={{ uri: bet.image_url }} style={styles.betImage} resizeMode="cover" />
      )}

      <Text style={styles.title}>{bet.title}</Text>
      <Text style={styles.desc}>{bet.description}</Text>

      {/* Si ya está terminada */}
      {bet.status === "terminated" ? (
        <Text style={styles.terminated}>
          ✅ Apuesta terminada. Ganador:{" "}
          {bet.bet_options.find((o: any) => o.id === bet.winner_option_id)?.label}
        </Text>
      ) : user?.role === "ADMIN" ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#fff", marginBottom: 10, fontWeight: "bold" }}>
            Selecciona opción ganadora:
          </Text>
          {bet.bet_options.map((opt: any) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.optionButton}
              onPress={() => handleSetWinner(opt.id)}
            >
              <Text style={styles.optionText}>
                {opt.label} (fee: {opt.odds})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={{ color: "#fff" }}>
          Esta apuesta está activa, usa la vista de usuario para apostar.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginVertical: 10 },
  desc: { fontSize: 15, color: "#ccc", marginBottom: 20 },
  betImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  optionText: { color: "#fff", fontWeight: "bold" },
  terminated: {
    color: "#0f0",
    fontWeight: "bold",
    marginTop: 15,
    fontSize: 16,
  },
});
