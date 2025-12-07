// src/connect.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const connectDb = (
  supabaseUrl: string,
  supabaseKey: string
): SupabaseClient => {
  if (!supabaseKey || !supabaseUrl) {
    throw new Error("Supabase url or key is not defined");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log("✅ Supabase client created successfully");
  
  return supabase;
};