import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.email) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", session.user.email)
    .single();

  return data;
}
