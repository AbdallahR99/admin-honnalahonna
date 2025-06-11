"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Helper function to generate slug from category name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
}

// Helper function to upload icon and return filename
async function uploadCategoryIcon(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null

  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `service_categories/${fileName}`

  const { error: uploadError } = await supabaseAdmin.storage.from("images").upload(filePath, file)

  if (uploadError) {
    console.error(`Error uploading icon ${filePath}:`, uploadError)
    throw new Error(`فشل تحميل الأيقونة: ${uploadError.message}`)
  }

  // Return only the filename with extension
  return fileName
}

export async function getServiceCategories(page = 1, limit = 10, searchTerm = "") {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from("service_categories")
    .select("*", { count: "exact" })
    .eq("is_deleted", false)
    .order("name", { ascending: true })
    .range(from, to)

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching service categories:", error)
    return { categories: [], count: 0, error: error.message }
  }
  return { categories: data || [], count: count || 0, error: null }
}

export async function createServiceCategory(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const slug = (formData.get("slug") as string) || generateSlug(name)
  const iconFile = formData.get("icon_file") as File | null

  if (!name) {
    return { success: false, message: "الاسم مطلوب" }
  }

  try {
    // Upload icon if provided
    let icon = null
    if (iconFile && iconFile.size > 0) {
      icon = await uploadCategoryIcon(iconFile)
    }

    const insertData = {
      name,
      slug,
      icon,
      created_by: "admin",
    }

    const { error } = await supabaseAdmin.from("service_categories").insert([insertData])

    if (error) {
      console.error("Error creating service category:", error)
      return { success: false, message: `فشل إنشاء الفئة: ${error.message}` }
    }

    revalidatePath("/admin/service-categories")
    return { success: true, message: "تم إنشاء الفئة بنجاح" }
  } catch (error: any) {
    console.error("Error in createServiceCategory:", error)
    return { success: false, message: error.message || "حدث خطأ أثناء إنشاء الفئة" }
  }
}

export async function updateServiceCategory(id: string, prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const slug = (formData.get("slug") as string) || generateSlug(name)
  const iconFile = formData.get("icon_file") as File | null
  const existingIcon = formData.get("existing_icon") as string | null

  if (!name) {
    return { success: false, message: "الاسم مطلوب" }
  }
  if (!id) {
    return { success: false, message: "المعرف مطلوب" }
  }

  try {
    // Handle icon upload or keep existing
    let icon = existingIcon
    if (iconFile && iconFile.size > 0) {
      icon = await uploadCategoryIcon(iconFile)
    }

    const updateData = {
      name,
      slug,
      icon,
      updated_at: new Date().toISOString(),
      updated_by: "admin",
    }

    const { error } = await supabaseAdmin.from("service_categories").update(updateData).eq("id", id)

    if (error) {
      console.error("Error updating service category:", error)
      return { success: false, message: `فشل تحديث الفئة: ${error.message}` }
    }

    revalidatePath("/admin/service-categories")
    return { success: true, message: "تم تحديث الفئة بنجاح" }
  } catch (error: any) {
    console.error("Error in updateServiceCategory:", error)
    return { success: false, message: error.message || "حدث خطأ أثناء تحديث الفئة" }
  }
}

export async function deleteServiceCategory(id: string) {
  if (!id) {
    return { success: false, message: "المعرف مطلوب" }
  }

  // Soft delete
  const { error } = await supabaseAdmin
    .from("service_categories")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: "admin",
    })
    .eq("id", id)

  if (error) {
    console.error("Error deleting service category:", error)
    return { success: false, message: `فشل حذف الفئة: ${error.message}` }
  }

  revalidatePath("/admin/service-categories")
  return { success: true, message: "تم حذف الفئة بنجاح" }
}
