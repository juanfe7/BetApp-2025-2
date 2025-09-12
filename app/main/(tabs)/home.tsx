import { FontAwesome5 } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.greeting}>Hello,</Text>
      <Text style={styles.username}>Juan Felipe</Text>

      {/* Search */}
      <View style={styles.searchBox}>
        <FontAwesome5 name="search" size={18} color="#aaa" style={{ marginRight: 8 }} />
        <TextInput placeholder="Search events, teams" placeholderTextColor="#aaa" style={styles.searchInput} />
      </View>

      {/* Torneos */}
      <Text style={styles.sectionTitle}>Tournaments</Text>
      <TouchableOpacity style={styles.tournamentCard}>
        <Text style={styles.tournamentText}>🏆 Premier League</Text>
      </TouchableOpacity>

      {/* Eventos en vivo */}
      <Text style={styles.sectionTitle}>Top Events</Text>
      <View style={styles.eventCard}>
        <Text style={styles.league}>Premier League</Text>
        <View style={styles.matchRow}>
          <Text style={styles.team}>Chelsea</Text>
          <Text style={styles.score}>1 : 2</Text>
          <Text style={styles.team}>Leicester</Text>
        </View>
        <View style={styles.oddsRow}>
          <Text style={styles.odds}>1.8</Text>
          <Text style={styles.odds}>2.1</Text>
          <Text style={styles.odds}>1.3</Text>
        </View>
      </View>

      <View style={styles.eventCard}>
        <Text style={styles.league}>UEFA Europa League</Text>
        <View style={styles.matchRow}>
          <Text style={styles.team}>Arsenal</Text>
          <Text style={styles.score}>0 : 1</Text>
          <Text style={styles.team}>Roma</Text>
        </View>
        <View style={styles.oddsRow}>
          <Text style={styles.odds}>2.0</Text>
          <Text style={styles.odds}>2.4</Text>
          <Text style={styles.odds}>1.6</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#040913ff",
    padding: 20,
  },
  greeting: {
    fontSize: 18,
    color: "#aaa",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a1222",
    borderRadius: 10,
    padding: 10,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 12,
  },
  tournamentCard: {
    backgroundColor: "#0072f5ff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
  },
  tournamentText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  eventCard: {
    backgroundColor: "#0a1222",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#0072f5ff",
  },
  league: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 10,
  },
  matchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  team: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  score: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  oddsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  odds: {
    backgroundColor: "#0072f5ff",
    color: "#fff",
    fontWeight: "bold",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    overflow: "hidden",
  },
});
