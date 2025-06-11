import { supabase } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value
    const refreshToken = cookieStore.get("sb-refresh-token")?.value

    if (!accessToken || !refreshToken) {
      return null
    }

    // Create a temporary client with the stored token
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken)

    if (error || !user) {
      return null
    }

    return { user, accessToken, refreshToken }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/admin/login")
  }

  return session
}

export async function requireAdminAuth() {
  const session = await requireAuth()

  // Check if user is admin
  const isAdmin = session.user.user_metadata?.is_admin === true

  if (!isAdmin) {
    // Double-check with database
    const { data: userData, error } = await supabaseAdmin
      .from("users")
      .select("is_admin")
      .eq("user_id", session.user.id)
      .single()

    if (error || !userData?.is_admin) {
      redirect("/admin/unauthorized")
    }
  }

  return session
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
    }

    // Clear cookies
    const cookieStore = await cookies()
    cookieStore.delete("sb-access-token")
    cookieStore.delete("sb-refresh-token")
  } catch (error) {
    console.error("Error in signOut:", error)
  }
}
