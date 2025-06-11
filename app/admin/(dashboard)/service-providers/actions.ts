"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { ServiceProvider, User, Governorate, ServiceCategory, ServiceProviderStatus } from "@/lib/supabase/types"
import { v4 as uuidv4 } from "uuid"

// Function to update service provider status (Approve/Reject)
export async function updateServiceProviderStatus(id: string, status: ServiceProviderStatus) {
  if (!id || !status) {
    return { success: false, message: "المعرف والحالة مطلوبان." }
  }

  const { error } = await supabaseAdmin
    .from("service_providers")
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating service provider status:", error)
    return { success: false, message: `فشل تحديث حالة مزود الخدمة: ${error.message}` }
  }

  revalidatePath(`/admin/service-providers`)
  revalidatePath(`/admin/service-providers/${id}`)
  return { success: true, message: "تم تحديث حالة مزود الخدمة بنجاح." }
}

export async function getUsersForSelect(): Promise<{
  users: Pick<User, "id" | "user_id" | "first_name" | "last_name" | "email">[]
  error: string | null
}> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, user_id, first_name, last_name, email")
    .eq("is_deleted", false)
    .order("first_name")
    .limit(100)

  if (error) {
    console.error("Error fetching users for select:", error)
    return { users: [], error: error.message }
  }
  return { users: data || [], error: null }
}

export async function getGovernoratesForSelect(): Promise<{
  governorates: Pick<Governorate, "id" | "name">[]
  error: string | null
}> {
  const { data, error } = await supabaseAdmin
    .from("governorates")
    .select("id, name")
    .eq("is_deleted", false)
    .order("name")

  if (error) {
    console.error("Error fetching governorates for select:", error)
    return { governorates: [], error: error.message }
  }
  return { governorates: data || [], error: null }
}

export async function getServiceCategoriesForSelect(): Promise<{
  categories: Pick<ServiceCategory, "id" | "name">[]
  error: string | null
}> {
  const { data, error } = await supabaseAdmin
    .from("service_categories")
    .select("id, name")
    .eq("is_deleted", false)
    .order("name")

  if (error) {
    console.error("Error fetching service categories for select:", error)
    return { categories: [], error: error.message }
  }
  return { categories: data || [], error: null }
}

// Helper function to upload file and return only filename
async function uploadFile(file: File, folder: string): Promise<string | null> {
  if (!file || file.size === 0) return null

  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `service_providers/${folder}/${fileName}`

  const { error: uploadError } = await supabaseAdmin.storage.from("images").upload(filePath, file)

  if (uploadError) {
    console.error(`Error uploading file ${filePath}:`, uploadError)
    throw new Error(`فشل تحميل الملف: ${file.name} - ${uploadError.message}`)
  }

  // Return only the filename with folder prefix for organization
  return `${folder}/${fileName}`
}

async function handleMultipleFilesUpload(files: File[] | File | undefined, folder: string): Promise<string | null> {
  if (!files) return null
  const fileArray = Array.isArray(files) ? files : [files]
  if (fileArray.length === 0 || (fileArray.length === 1 && fileArray[0].size === 0)) return null

  const filenames: string[] = []
  for (const file of fileArray) {
    if (file.size > 0) {
      const filename = await uploadFile(file, folder)
      if (filename) {
        filenames.push(filename)
      }
    }
  }
  return filenames.length > 0 ? filenames.join(", ") : null
}

// Helper function to generate slug from service name
function generateSlug(serviceName: string): string {
  return serviceName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
}

export async function createServiceProviderByAdmin(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries())

  try {
    // File uploads
    const logoImageFile = formData.get("logo_image_file") as File | null
    const idCardFrontFile = formData.get("id_card_front_image_file") as File | null
    const idCardBackFile = formData.get("id_card_back_image_file") as File | null
    const certificatesFiles = formData.getAll("certificates_images_files") as File[]
    const documentListFiles = formData.getAll("document_list_files") as File[]

    const logo_image = logoImageFile ? await uploadFile(logoImageFile, "logos") : null
    const id_card_front_image = idCardFrontFile ? await uploadFile(idCardFrontFile, "id_cards") : null
    const id_card_back_image = idCardBackFile ? await uploadFile(idCardBackFile, "id_cards") : null
    const certificates_images = await handleMultipleFilesUpload(certificatesFiles, "certificates")
    const document_list = await handleMultipleFilesUpload(documentListFiles, "documents")

    // Basic validation and type conversion
    const user_id = rawFormData.user_id as string
    const service_name = rawFormData.service_name as string
    const service_category_id = rawFormData.service_category_id as string
    const governorate_id = rawFormData.governorate_id as string
    const years_of_experience = rawFormData.years_of_experience
      ? Number.parseInt(rawFormData.years_of_experience as string)
      : null
    const service_delivery_method = rawFormData.service_delivery_method as "online" | "offline" | "both" | undefined

    if (!user_id || !service_name || !service_category_id || !governorate_id) {
      return { success: false, message: "الرجاء ملء الحقول الإلزامية: المستخدم، اسم الخدمة، الفئة، المحافظة." }
    }

    // Generate slug from service name
    const slug = generateSlug(service_name)

    const serviceProviderData: Partial<ServiceProvider> = {
      user_id,
      service_name,
      service_category_id,
      governorate_id,
      years_of_experience,
      service_delivery_method: service_delivery_method || null,
      service_description: rawFormData.service_description as string | null,
      bio: rawFormData.bio as string | null,
      facebook_url: rawFormData.facebook_url as string | null,
      instagram_url: rawFormData.instagram_url as string | null,
      whatsapp_url: rawFormData.whatsapp_url as string | null,
      video_url: rawFormData.video_url as string | null,
      keywords: rawFormData.keywords as string | null,
      notes: rawFormData.notes as string | null,
      status: "approved",
      created_by: "admin",
      slug, // Add the generated slug
      logo_image,
      id_card_front_image,
      id_card_back_image,
      certificates_images,
      document_list,
    }

    const { error } = await supabaseAdmin.from("service_providers").insert([serviceProviderData])

    if (error) {
      console.error("Error creating service provider by admin:", error)
      return { success: false, message: `فشل إنشاء مزود الخدمة: ${error.message}` }
    }

    revalidatePath("/admin/service-providers")
    return { success: true, message: "تم إنشاء مزود الخدمة بنجاح." }
  } catch (uploadError: any) {
    console.error("File upload error during service provider creation:", uploadError)
    return { success: false, message: uploadError.message || "حدث خطأ أثناء تحميل الملفات." }
  }
}

export async function updateServiceProviderByAdmin(id: string, formData: FormData) {
  console.warn("updateServiceProviderByAdmin is not fully implemented regarding file updates/deletions from storage.")
  const rawFormData = Object.fromEntries(formData.entries())

  try {
    const logoImageFile = formData.get("logo_image_file") as File | null
    const idCardFrontFile = formData.get("id_card_front_image_file") as File | null

    let logo_image = formData.get("existing_logo_image") as string | undefined
    if (logoImageFile && logoImageFile.size > 0) {
      logo_image = (await uploadFile(logoImageFile, "logos")) || undefined
    }

    let id_card_front_image = formData.get("existing_id_card_front_image") as string | undefined
    if (idCardFrontFile && idCardFrontFile.size > 0) {
      id_card_front_image = (await uploadFile(idCardFrontFile, "id_cards")) || undefined
    }

    const service_name = rawFormData.service_name as string
    const slug = service_name ? generateSlug(service_name) : undefined

    const updateData: Partial<ServiceProvider> = {
      service_name,
      slug, // Update slug when service name changes
      logo_image,
      id_card_front_image,
      status: (rawFormData.status as ServiceProviderStatus) || undefined,
      updated_at: new Date().toISOString(),
      updated_by: "admin",
    }

    const { error } = await supabaseAdmin.from("service_providers").update(updateData).eq("id", id)

    if (error) {
      return { success: false, message: `فشل تحديث مزود الخدمة: ${error.message}` }
    }
    revalidatePath("/admin/service-providers")
    revalidatePath(`/admin/service-providers/${id}`)
    return { success: true, message: "تم تحديث مزود الخدمة بنجاح (تحديث الملفات مبسط)." }
  } catch (uploadError: any) {
    return { success: false, message: uploadError.message || "حدث خطأ أثناء تحميل الملفات." }
  }
}
