// pages/api/deleteAccount.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// ⚠️ Service-Role Key verwenden (nicht den public anon key!)
// Den findest du im Supabase Projekt unter Project Settings → API
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // 1. Kinder löschen
    const { error: childrenError } = await supabaseAdmin
      .from("children")
      .delete()
      .eq("profile_id", userId);

    if (childrenError) {
      console.error("❌ Fehler beim Löschen der Kinder:", childrenError);
      return res.status(500).json({ error: "Fehler beim Löschen der Kinder" });
    }

    // 2. Profil löschen
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("❌ Fehler beim Löschen des Profils:", profileError);
      return res.status(500).json({ error: "Fehler beim Löschen des Profils" });
    }

    // 3. Benutzerkonto löschen
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (userError) {
      console.error("❌ Fehler beim Löschen des Users:", userError);
      return res.status(500).json({ error: "Fehler beim Löschen des Users" });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("❌ Unerwarteter Fehler beim Account löschen:", err);
    return res.status(500).json({ error: "Unerwarteter Fehler" });
  }
    }
