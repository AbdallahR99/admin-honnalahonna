"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { signOut } from "@/lib/auth/utils"
import { redirect } from "next/navigation"

export async function getDashboardStats() {
  try {
    const [
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalServiceProviders,
      totalUsers,
      totalCategories,
      totalGovernorates,
    ] = await Promise.all([
      supabaseAdmin
        .from("service_providers")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("is_deleted", false),
      supabaseAdmin
        .from("service_providers")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("is_deleted", false),
      supabaseAdmin
        .from("service_providers")
        .select("id", { count: "exact", head: true })
        .eq("status", "rejected")
        .eq("is_deleted", false),
      supabaseAdmin.from("service_providers").select("id", { count: "exact", head: true }).eq("is_deleted", false),
      supabaseAdmin.from("users").select("user_id", { count: "exact", head: true }).eq("is_deleted", false),
      supabaseAdmin.from("service_categories").select("id", { count: "exact", head: true }).eq("is_deleted", false),
      supabaseAdmin.from("governorates").select("id", { count: "exact", head: true }).eq("is_deleted", false),
    ])

    return {
      data: {
        pendingCount: pendingRequests.count ?? 0,
        approvedCount: approvedRequests.count ?? 0,
        rejectedCount: rejectedRequests.count ?? 0,
        totalServiceProvidersCount: totalServiceProviders.count ?? 0,
        totalUsersCount: totalUsers.count ?? 0,
        totalCategoriesCount: totalCategories.count ?? 0,
        totalGovernoratesCount: totalGovernorates.count ?? 0,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    let errorMessage = "فشل في جلب إحصائيات لوحة التحكم."
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      data: null,
      error: errorMessage,
    }
  }
}

export async function signOutAction() {
  try {
    await signOut()
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
  redirect("/admin/login")
}
