import { supabase } from "../lib/supabaseClient";

export async function ensureUserProfile(user) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data) {
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        email: user.email,
      },
    ]);

    if (insertError) console.error("Fehler beim Anlegen des Profils:", insertError);
  }
}
