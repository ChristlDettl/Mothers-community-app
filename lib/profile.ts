import { supabase } from "./supabaseClient";

export async function ensureUserProfile(user: any) {
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
        full_name: "",
        birth_date: null,
        num_children: 0,
        children_ages: "[]",
        city: "",
      },
    ]);
    if (insertError) console.error("Fehler beim Anlegen des Profils:", insertError);
  }
}

