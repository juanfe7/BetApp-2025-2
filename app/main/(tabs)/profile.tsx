import { MaterialIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.container}>
      {/* Header con logo */}
      <View style={styles.header}>
        <Image
        source={{ uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" }} // Puedes cambiarlo por la foto del usuario
        style={styles.avatar}
        />
        <Text style={styles.appName}>Juan Felipe</Text>
        <Text style={styles.userId}>ID: 12345678</Text>
      </View>

      {/* Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceValue}>$ 250.000</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.depositButton}>
            <Text style={styles.buttonText}>+ Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.buttonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Opciones de cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your account</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem}>
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
          <TouchableOpacity style={styles.gridItem}>
            <MaterialIcons name="support-agent" size={24} color="#0072f5ff" />
            <Text style={styles.gridText}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#040913ff",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  userId: {
    fontSize: 14,
    color: "#aaa",
  },
  balanceCard: {
    backgroundColor: "#0a1222",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#0072f5ff",
  },
  balanceLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
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
  gridText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 14,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#0072f5ff",
    marginBottom: 16,
  },
});
