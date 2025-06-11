"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { ServiceProviderStatus } from "@/lib/supabase/types"

export async function updateServiceProviderStatus(id: string, status: ServiceProviderStatus) {
  if (!id || !status) {
    return { success: false, message: "المعرف والحالة مطلوبان." }
  }

  const { error } = await supabaseAdmin
    .from("service_providers")
    .update({ status: status, updated_at: new Date().toISOString() }) // also update updated_at
    .eq("id", id)

  if (error) {
    console.error("Error updating service provider status:", error)
    return { success: false, message: `فشل تحديث حالة مزود الخدمة: ${error.message}` }
  }

  revalidatePath(`/admin/service-providers`)
  revalidatePath(`/admin/service-providers/${id}`)
  return { success: true, message: "تم تحديث حالة مزود الخدمة بنجاح." }
}
