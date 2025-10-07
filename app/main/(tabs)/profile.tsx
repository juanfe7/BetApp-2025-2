import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase"; // 👈 asegúrate de tener tu cliente
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const router = useRouter();
  const { user } = useContext(AuthContext); // Usuario del contexto

  const [balance, setBalance] = useState<number | null>(null);

  // 🔹 Cargar balance desde supabase al iniciar
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching balance:", error);
      } else {
        setBalance(data?.balance ?? 0);
      }
    };

    fetchBalance();
  }, [user]);

  // 🔹 Actualizar balance en supabase
  const updateBalance = async (newBalance: number, type: "deposit" | "withdraw") => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating balance:", error);
      Alert.alert("Error", "Could not update balance");
    } else {
      setBalance(newBalance);
      if (type === "deposit") {
        Alert.alert("Transacción exitosa", "El depósito se realizó correctamente ✅");
      } else {
        Alert.alert("Transacción exitosa", "El retiro se realizó correctamente 💸");
      }
    }
  };

  // Función para depositar
  const handleDeposit = () => {
    Alert.prompt(
      "Deposit",
      "Enter the amount to deposit",
      (value) => {
        const amount = parseFloat(value);
        if (!isNaN(amount) && amount > 0) {
          updateBalance((balance ?? 0) + amount, "deposit");
        } else {
          Alert.alert("Error", "Enter a valid amount");
        }
      },
      "plain-text",
      ""
    );
  };

  // Función para retirar
  const handleWithdraw = () => {
    Alert.prompt(
      "Withdraw",
      "Enter the amount to withdraw",
      (value) => {
        const amount = parseFloat(value);
        if (!isNaN(amount) && amount > 0) {
          if (amount <= (balance ?? 0)) {
            updateBalance((balance ?? 0) - amount, "withdraw");
          } else {
            Alert.alert("Error", "Insufficient funds");
          }
        } else {
          Alert.alert("Error", "Enter a valid amount");
        }
      },
      "plain-text",
      ""
    );
  };


  return (
    <ScrollView style={styles.container}>
      {/* Header con logo */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              user?.avatar_url ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.appName}>
          {user?.name || user?.username || user?.email.split("@")[0]}
        </Text>
        <Text style={styles.userId}>ID: {user?.id}</Text>
      </View>

      {/* Balance dinámico */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceValue}>
          {balance !== null ? `$ ${balance.toLocaleString()}` : "Loading..."}
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.depositButton} onPress={handleDeposit}>
            <Text style={styles.buttonText}>+ Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <Text style={styles.buttonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Opciones de cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your account</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push("/main/editProfile")}
          >
            <MaterialIcons name="person" size={24} color="#0072f5ff" />
            <Text style={styles.gridText}>Personal info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons name="security" size={24} color="#0072f5ff" />
            <Text style={styles.gridText}>Security</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons name="notifications" size={24} color="#0072f5ff" />
            <Text style={styles.gridText}>Notifications</Text>
          </TouchableOpacity>

          {/* 🔹 Reemplazamos Support por Favorites */}
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push("/main/favoriteBets")}
          >
            <MaterialIcons name="star" size={24} color="#0072f5ff" />
            <Text style={styles.gridText}>Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#040913ff", padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  appName: { fontSize: 22, fontWeight: "bold", color: "#fff", marginTop: 8 },
  userId: { fontSize: 14, color: "#aaa" },
  balanceCard: {
    backgroundColor: "#0a1222",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#0072f5ff",
  },
  balanceLabel: { color: "#aaa", fontSize: 14 },
  balanceValue: { fontSize: 28, fontWeight: "bold", color: "#fff", marginVertical: 10 },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  depositButton: {
    backgroundColor: "#0072f5ff",
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: "center",
  },
  withdrawButton: {
    backgroundColor: "#ff3b30",
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: "#fff", fontWeight: "bold", marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: {
    backgroundColor: "#0a1222",
    width: "48%",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0072f5ff",
  },
  gridText: { color: "#fff", marginTop: 8, fontSize: 14 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#0072f5ff",
    marginBottom: 16,
  },
});
