import { getOrCreateChat } from "@/utils/chat";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatsScreen() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    fetchUser();
  }, []);

  // 🔍 buscar usuario por email
  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, avatar_url")
      .ilike("email", searchEmail.trim());

    if (error) {
      console.error("Error buscando usuario:", error.message);
      return;
    }

    setSearchResult(data && data.length > 0 ? data[0] : null);
  };

  // 🟢 iniciar chat
  const handleStartChat = async () => {
    if (!currentUserId || !searchResult) return;

    try {
      const chat = await getOrCreateChat(currentUserId, searchResult.id);
      if (chat?.id) {
        router.push({
          pathname: "/main/(tabs)/chats/[chatId]",
          params: { chatId: chat.id },
        });
      }
    } catch (error) {
      console.error("Error al iniciar chat:", error);
    }
  };

  // 📥 traer lista de chats con avatar
  useEffect(() => {
    if (!currentUserId) return;

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select(`
          id,
          user_id,
          user_id2,
          created_at,
          user1:profiles!chats_user_id_fkey(id, email, avatar_url),
          user2:profiles!chats_user_id2_fkey(id, email, avatar_url)
        `)
        .or(`user_id.eq.${currentUserId},user_id2.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (!error) setChats(data || []);
    };

    fetchChats();

    const channel = supabase
      .channel("chats-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
        (payload) => {
          const newChat = payload.new;
          if (
            newChat.user_id === currentUserId ||
            newChat.user_id2 === currentUserId
          ) {
            setChats((prev) => [newChat, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#040913" }}>
      {/* 🔍 barra de búsqueda */}
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        <TextInput
          value={searchEmail}
          onChangeText={setSearchEmail}
          placeholder="Buscar usuario por email..."
          placeholderTextColor="#aaa"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#0072f5",
            borderRadius: 8,
            padding: 8,
            color: "white",
          }}
        />
        <Button title="Buscar" onPress={handleSearch} />
      </View>

      {/* resultado de búsqueda */}
      {searchResult ? (
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#0072f5",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "white", marginBottom: 8 }}>
            Usuario encontrado: {searchResult.email}
          </Text>
          <Button title="Iniciar chat" onPress={handleStartChat} />
        </View>
      ) : searchEmail ? (
        <Text style={{ color: "gray", marginBottom: 16 }}>No encontrado</Text>
      ) : null}

      {/* lista de chats */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherUser =
            item.user1.id === currentUserId ? item.user2 : item.user1;

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/main/(tabs)/chats/[chatId]",
                  params: { chatId: item.id },
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                marginVertical: 6,
                marginHorizontal: 12,
                backgroundColor: "#1e293b",
                borderRadius: 12,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              {/* Avatar circular con imagen */}
              {otherUser?.avatar_url ? (
                <Image
                  source={{ uri: otherUser.avatar_url }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    marginRight: 12,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#334155",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {otherUser?.email?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}

              {/* Info de chat */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 16 }}
                >
                  {otherUser?.email || "Usuario"}
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                  Último mensaje...
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
