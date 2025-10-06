import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateBet() {
    const router = useRouter();
    const { user } = useContext(AuthContext);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [betOptions, setBetOptions] = useState([{ label: "", odds: "" }]);

    // Add new option
    const addOption = () => {
        setBetOptions([...betOptions, { label: "", odds: "" }]);
    };

    // Remove option
    const removeOption = (index: number) => {
        setBetOptions(betOptions.filter((_, i) => i !== index));
    };

    // Update option inputs
    const updateOption = (index: number, field: "label" | "odds", value: string) => {
        const updated = [...betOptions];
        updated[index][field] = value;
        setBetOptions(updated);
    };

    const handleCreateBet = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert("Error", "Please complete all fields");
            return;
        }

        // 1. Insert into bets with cost and image
        const { data: betData, error: betError } = await supabase
            .from("bets")
            .insert([
                {
                    title,
                    description,
                    cost: cost ? Number(cost) : null,
                    image_url: imageUrl || null,
                    created_by: user.id,
                },
            ])
            .select("id")
            .single();

        if (betError) {
            console.log("Error creating bet:", betError);
            Alert.alert("Error", betError.message);
            return;
        }

        // 2. Insert dynamic options
        const validOptions = betOptions.filter(
            (opt) =>
                opt.label.trim() &&
                opt.odds.trim() &&
                !isNaN(Number(opt.odds)) &&
                Number(opt.odds) > 0
        );

        if (validOptions.length === 0) {
            Alert.alert("Error", "You must add at least one valid option with odds");
            return;
        }

        const { error: optionsError } = await supabase
            .from("bet_options")
            .insert(
                validOptions.map((opt) => ({
                    bet_id: betData.id,
                    label: opt.label.trim(),
                    odds: Number(opt.odds),
                }))
            );

        if (optionsError) {
            console.log("Error creating options:", optionsError);
            Alert.alert("Error", optionsError.message);
            return;
        }

        Alert.alert("Success", "The bet was created with options");
        router.push("/main/home");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>Create Bet</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Bet Title"
                    placeholderTextColor="#888"
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    style={[styles.input, { height: 100 }]}
                    placeholder="Description"
                    placeholderTextColor="#888"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <TextInput
                    style={styles.input}
                    placeholder="Bet Cost"
                    placeholderTextColor="#888"
                    value={cost}
                    keyboardType="numeric"
                    onChangeText={setCost}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Image URL (optional)"
                    placeholderTextColor="#888"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                />

                <Text style={styles.subtitle}>Bet Options</Text>
                {betOptions.map((opt, index) => (
                    <View key={index} style={styles.optionRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 5 }]}
                            placeholder="Option"
                            placeholderTextColor="#888"
                            value={opt.label}
                            onChangeText={(text) => updateOption(index, "label", text)}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 5 }]}
                            placeholder="Odds"
                            placeholderTextColor="#888"
                            keyboardType="decimal-pad" // 👈 better than numeric on iOS
                            value={opt.odds}
                            onChangeText={(text) =>
                                updateOption(index, "odds", text.replace(",", "."))
                            }
                        />
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeOption(index)}
                        >
                            <Text style={{ color: "#fff" }}>❌</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={addOption}>
                    <Text style={styles.buttonText}>➕ Add Option</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleCreateBet}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#040913ff" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#fff" },
    subtitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#fff" },
    input: {
        // Levemente diferente para contraste sutil
        backgroundColor: "#081120", 
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        color: "#fff",
        // Borde añadido para destacar el campo
        borderWidth: 1, 
        borderColor: "#0072f5ff", // Azul claro brillante
    },
    button: {
        backgroundColor: "#0072f5ff",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    addBtn: {
        backgroundColor: "#2e8b36ff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 15,
    },
    optionRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    removeBtn: {
        backgroundColor: "#B22222",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
    },
});