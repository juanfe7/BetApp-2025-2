import { supabase } from "./supabase";

// Crear o traer un chat existente entre dos usuarios
export const getOrCreateChat = async (currentUserId: string, otherUserId: string) => {
  // verificar si ya existe
  const { data: existingChat } = await supabase
    .from("chats")
    .select(`
      id,
      user_id,
      user_id2,
      user1:profiles!chats_user_id_fkey(id, email, avatar_url),
      user2:profiles!chats_user_id2_fkey(id, email, avatar_url)
    `)
    .or(`and(user_id.eq.${currentUserId},user_id2.eq.${otherUserId}),and(user_id.eq.${otherUserId},user_id2.eq.${currentUserId})`)
    .maybeSingle();

  if (existingChat) return existingChat;

  // crear chat nuevo
  const { data, error } = await supabase
    .from("chats")
    .insert([{ user_id: currentUserId, user_id2: otherUserId }])
    .select(`
      id,
      user_id,
      user_id2,
      user1:profiles!chats_user_id_fkey(id, email, avatar_url),
      user2:profiles!chats_user_id2_fkey(id, email, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
};
