"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Governorate } from "@/lib/supabase/types"

export async function getGovernorates(page = 1, limit = 10, searchTerm = "") {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from("governorates")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to)

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,governorate_code.ilike.%${searchTerm}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching governorates:", error)
    return { governorates: [], count: 0, error: error.message }
  }
  return { governorates: data || [], count: count || 0, error: null }
}

export async function createGovernorate(formData: FormData) {
  const name = formData.get("name") as string
  const governorate_code = formData.get("governorate_code") as string | null
  // Add other meta fields if needed

  if (!name) {
    return { success: false, message: "اسم المحافظة مطلوب" }
  }

  const insertData: Partial<Governorate> = { name }
  if (governorate_code) insertData.governorate_code = governorate_code

  const { error } = await supabaseAdmin.from("governorates").insert([insertData])

  if (error) {
    console.error("Error creating governorate:", error)
    return { success: false, message: `فشل إنشاء المحافظة: ${error.message}` }
  }

  revalidatePath("/admin/governorates")
  return { success: true, message: "تم إنشاء المحافظة بنجاح" }
}

export async function updateGovernorate(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const governorate_code = formData.get("governorate_code") as string | null

  if (!name) {
    return { success: false, message: "اسم المحافظة مطلوب" }
  }
  if (!id) {
    return { success: false, message: "معرف المحافظة مطلوب" }
  }

  const updateData: Partial<Governorate> = { name }
  if (governorate_code !== undefined) updateData.governorate_code = governorate_code // Allow clearing the code

  const { error } = await supabaseAdmin.from("governorates").update(updateData).eq("id", id)

  if (error) {
    console.error("Error updating governorate:", error)
    return { success: false, message: `فشل تحديث المحافظة: ${error.message}` }
  }

  revalidatePath("/admin/governorates")
  return { success: true, message: "تم تحديث المحافظة بنجاح" }
}

export async function deleteGovernorate(id: string) {
  if (!id) {
    return { success: false, message: "معرف المحافظة مطلوب" }
  }

  // Consider soft delete: .update({ is_deleted: true, deleted_at: new Date().toISOString() })
  const { error } = await supabaseAdmin.from("governorates").delete().eq("id", id)

  if (error) {
    console.error("Error deleting governorate:", error)
    return { success: false, message: `فشل حذف المحافظة: ${error.message}` }
  }

  revalidatePath("/admin/governorates")
  return { success: true, message: "تم حذف المحافظة بنجاح" }
}
