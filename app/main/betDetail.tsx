// betDetail.tsx
import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BetDetail() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { betId, optionId } = useLocalSearchParams();

  const [bet, setBet] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);

  // 🔹 traer info de la apuesta + opciones
  const fetchBet = async () => {
    setLoading(true);

    // 1. Traer la apuesta
    const { data: betData, error: betError } = await supabase
      .from("bets")
      .select("id, title, description, image_url")
      .eq("id", betId)
      .single();

    if (betError) {
      console.error("Error fetching bet:", betError.message);
      setLoading(false);
      return;
    }

    // 2. Traer las opciones asociadas
    const { data: optionsData, error: optionsError } = await supabase
      .from("bet_options")
      .select("id, label, odds, bet_id")
      .eq("bet_id", betId);

    if (optionsError) {
      console.error("Error fetching options:", optionsError.message);
      setLoading(false);
      return;
    }

    // 3. Unir apuesta + opciones
    const betWithOptions = { ...betData, bet_options: optionsData || [] };

    setBet(betWithOptions);

    // Buscar la opción seleccionada
    const option = (optionsData || []).find((o) => o.id == optionId);
    setSelectedOption(option);

    setLoading(false);
  };

  // 🔹 traer saldo del usuario
  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching balance:", error.message);
      return;
    }

    setBalance(data.balance);
  };

  useEffect(() => {
    fetchBet();
    fetchBalance();
  }, []);

  // 🔹 apostar con validación de saldo
  const handlePlaceBet = async () => {
    if (!amount.trim()) {
      Alert.alert("Error", "Por favor ingresa un monto");
      return;
    }

    const betAmount = Number(amount);
    if (!balance || betAmount > balance) {
      Alert.alert("Saldo insuficiente", "No tienes suficiente dinero para esta apuesta");
      return;
    }

    const { error } = await supabase.from("bets_participants").insert([
      {
        user_id: user.id,
        bet_id: betId,
        option_id: optionId,
        amount: betAmount,
      },
    ]);

    if (error) {
      console.error("Error placing bet:", error.message);
      Alert.alert("Error", error.message);
      return;
    }

    // 🔹 actualizar saldo en profiles
    await supabase
      .from("profiles")
      .update({ balance: balance - betAmount })
      .eq("id", user.id);

    Alert.alert("Éxito", "Tu apuesta fue registrada");
    router.push("/main/home");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  if (!bet || !selectedOption) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>No se encontró la apuesta</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {bet.image_url && (
          <Image
            source={{ uri: bet.image_url }}
            style={styles.betImage}
            resizeMode="cover"
          />
        )}

        <Text style={styles.title}>{bet.title}</Text>
        <Text style={styles.desc}>{bet.description}</Text>

        <View style={styles.optionBox}>
          <Text style={styles.optionText}>
            You are betting on:{" "}
            <Text style={{ fontWeight: "bold" }}>{selectedOption.label}</Text>
          </Text>
          <Text style={styles.optionText}>fee: {selectedOption.odds}</Text>
          <Text style={styles.optionText}>
            Your balance: {balance !== null ? `$${balance}` : "loading..."}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Amount to bet"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity style={styles.button} onPress={handlePlaceBet}>
          <Text style={styles.buttonText}>Confirm bet</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#040913ff", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginVertical: 10 },
  desc: { fontSize: 15, color: "#ccc", marginBottom: 20 },
  betImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionBox: {
    backgroundColor: "#0a1222",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  optionText: { color: "#fff", fontSize: 16, marginBottom: 5 },
  input: {
    backgroundColor: "#0a1222",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "#fff",
  },
  button: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
