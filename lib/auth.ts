import { db } from "./supabase";

export async function requireUser() {
  const supabase = db();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("You are not signed in. Please sign in and try again.");
  }

  return { supabase, user: data.user };
}
