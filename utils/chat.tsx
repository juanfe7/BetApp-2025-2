import { supabase } from "./supabase";

// Crear o traer un chat existente entre dos usuarios
export async function getOrCreateChat(userId1: string, userId2: string) {
  // 📌 asegurar siempre el mismo orden para evitar duplicados
  const [a, b] = [userId1, userId2].sort();

  // 1️⃣ verificar si ya existe un chat entre ambos
  const { data: existingChats, error: findError } = await supabase
    .from("chats")
    .select("*")
    .or(`and(user_id.eq.${a},user_id2.eq.${b}),and(user_id.eq.${b},user_id2.eq.${a})`)
    .limit(1);

  if (findError) {
    console.error("Error buscando chat:", findError.message);
    return null;
  }

  if (existingChats && existingChats.length > 0) {
    return existingChats[0]; // ya existe
  }

  // 2️⃣ si no existe, crearlo
  const { data, error: insertError } = await supabase
    .from("chats")
    .insert({
      user_id: a,
      user_id2: b,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creando chat:", insertError.message);
    return null;
  }

  return data;
}
