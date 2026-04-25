import { supabase } from "../lib/supabase/client"

export async function createUserIfNotExists(user: any) {
  if (!supabase) return;
  
  console.log("[UserService] Syncing user:", user.uid);

  const { error } = await supabase.from("users").upsert({
    firebase_uid: user.uid,
    email: user.email,
    display_name: user.displayName,
    photo_url: user.photoURL,
  }, { 
    onConflict: 'firebase_uid' 
  });

  if (error) {
    console.error("[UserService] Error syncing user:", error);
  } else {
    console.log("[UserService] User synced successfully");
  }
}