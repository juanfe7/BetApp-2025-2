import { supabase } from "@/utils/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Chat() {
  const { chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data || []);
    };

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    fetchUser();
    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.chat_id === chatId) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    const { error } = await supabase.from("messages").insert({
      text: newMessage,
      chat_id: chatId,
      sent_by: userId,
    });

    if (error) console.error(error);
    else setNewMessage("");
  };

  // 📌 función para formatear hora
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#040913" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMine = item.sent_by === userId;
          return (
            <View
              style={{
                alignSelf: isMine ? "flex-end" : "flex-start",
                backgroundColor: isMine ? "#0072f5" : "#1e293b",
                borderRadius: 16,
                padding: 10,
                marginVertical: 4,
                marginHorizontal: 10,
                maxWidth: "75%",
              }}
            >
              <Text style={{ color: "white", fontSize: 15 }}>{item.text}</Text>
              <Text
                style={{
                  color: "#ccc",
                  fontSize: 10,
                  marginTop: 4,
                  alignSelf: isMine ? "flex-end" : "flex-start",
                }}
              >
                {formatTime(item.created_at)}
              </Text>
            </View>
          );
        }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      {/* input + botón */}
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          borderTopWidth: 1,
          borderTopColor: "#1e293b",
        }}
      >
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#aaa"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#0072f5",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 8,
            color: "white",
            marginRight: 8,
          }}
        />
        <Button title="Enviar" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}
