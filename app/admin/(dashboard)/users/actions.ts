"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getUsers(page = 1, limit = 10, searchTerm = "", roleFilter = "all") {
  const from = (page - 1) * limit
  const to = from + limit - 1

  // First, get users from public.users table
  let query = supabaseAdmin
    .from("users")
    .select("*", { count: "exact" })
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (searchTerm) {
    query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
  }

  // Handle role filtering
  if (roleFilter === "admin") {
    query = query.eq("is_admin", true)
  } else if (roleFilter === "public") {
    query = query.or("is_admin.is.null,is_admin.eq.false")
  }

  const { data: users, error, count } = await query

  if (error) {
    console.error("Error fetching users:", error)
    return { users: [], count: 0, error: error.message }
  }

  // Now fetch confirmation status for users with auth IDs
  const usersWithAuthIds = users?.filter((user) => user.user_id) || []
  const authUserIds = usersWithAuthIds.map((user) => user.user_id)

  let authUsersData: any[] = []
  if (authUserIds.length > 0) {
    try {
      // Fetch auth users data using admin API
      const authPromises = authUserIds.map(async (authId) => {
        try {
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(authId)
          if (authError) {
            console.warn(`Error fetching auth user ${authId}:`, authError)
            return { id: authId, email_confirmed_at: null, phone_confirmed_at: null }
          }
          return {
            id: authId,
            email_confirmed_at: authUser.user?.email_confirmed_at || null,
            phone_confirmed_at: authUser.user?.phone_confirmed_at || null,
          }
        } catch (err) {
          console.warn(`Error fetching auth user ${authId}:`, err)
          return { id: authId, email_confirmed_at: null, phone_confirmed_at: null }
        }
      })

      authUsersData = await Promise.all(authPromises)
    } catch (err) {
      console.warn("Error fetching auth users data:", err)
    }
  }

  // Merge the data
  const transformedUsers = (users || []).map((user) => {
    const authData = authUsersData.find((auth) => auth.id === user.user_id)
    return {
      ...user,
      email_confirmed_at: authData?.email_confirmed_at || null,
      phone_confirmed_at: authData?.phone_confirmed_at || null,
    }
  })

  return { users: transformedUsers, count: count || 0, error: null }
}

export async function createUserByAdmin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const first_name = formData.get("first_name") as string | null
  const last_name = formData.get("last_name") as string | null
  const phone = formData.get("phone") as string | null

  if (!email || !password) {
    return { success: false, message: "البريد الإلكتروني وكلمة المرور مطلوبان." }
  }
  if (password.length < 6) {
    return { success: false, message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }
  }

  const user_metadata: Record<string, any> = {}
  if (first_name) user_metadata.first_name = first_name
  if (last_name) user_metadata.last_name = last_name
  if (phone) user_metadata.phone = phone

  // First create the auth user
  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata,
  })

  if (createError) {
    console.error("Error creating auth user:", createError)
    return { success: false, message: `فشل إنشاء المستخدم: ${createError.message}` }
  }

  // Then create the public user with the auth user's ID
  const { error: publicUserError } = await supabaseAdmin.from("users").insert({
    email,
    first_name,
    last_name,
    phone,
    user_id: authUser.user.id,
    created_by: "admin",
    is_admin: false, // Default to regular user
  })

  if (publicUserError) {
    console.error("Error creating public user:", publicUserError)
    // Try to clean up the auth user if public user creation fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return { success: false, message: `فشل إنشاء المستخدم في قاعدة البيانات: ${publicUserError.message}` }
  }

  revalidatePath("/admin/users")
  return { success: true, message: "تم إنشاء المستخدم بنجاح." }
}

export async function updateUserByAdmin(prevState: any, formData: FormData) {
  const userId = formData.get("id") as string
  const authUserId = formData.get("user_id") as string
  const first_name = formData.get("first_name") as string | null
  const last_name = formData.get("last_name") as string | null
  const phone = formData.get("phone") as string | null

  if (!userId) {
    return { success: false, message: "معرف المستخدم مطلوب." }
  }

  // Update the public.users table
  const updateData: any = {
    updated_at: new Date().toISOString(),
    updated_by: "admin",
  }

  if (first_name !== undefined) updateData.first_name = first_name
  if (last_name !== undefined) updateData.last_name = last_name
  if (phone !== undefined) updateData.phone = phone

  const { error: updateError } = await supabaseAdmin.from("users").update(updateData).eq("id", userId)

  if (updateError) {
    console.error("Error updating user:", updateError)
    return { success: false, message: `فشل تحديث المستخدم: ${updateError.message}` }
  }

  // Also update auth.users metadata if user_id exists
  if (authUserId) {
    const user_metadata_update: Record<string, any> = {}
    if (first_name !== undefined) user_metadata_update.first_name = first_name
    if (last_name !== undefined) user_metadata_update.last_name = last_name
    if (phone !== undefined) user_metadata_update.phone = phone

    if (Object.keys(user_metadata_update).length > 0) {
      const {
        data: { user: existingUser },
        error: fetchError,
      } = await supabaseAdmin.auth.admin.getUserById(authUserId)

      if (!fetchError && existingUser) {
        const new_user_metadata = { ...existingUser.user_metadata, ...user_metadata_update }
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          user_metadata: new_user_metadata,
        })
      }
    }
  }

  revalidatePath("/admin/users")
  return { success: true, message: "تم تحديث المستخدم بنجاح." }
}

export async function deleteUserByAdmin(userId: string) {
  if (!userId) {
    return { success: false, message: "معرف المستخدم مطلوب." }
  }

  // Get the user to check if it has an auth user
  const { data: user, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("user_id")
    .eq("id", userId)
    .single()

  if (fetchError) {
    console.error("Error fetching user:", fetchError)
    return { success: false, message: `فشل العثور على المستخدم: ${fetchError.message}` }
  }

  // Soft delete in public.users table
  const { error: softDeleteError } = await supabaseAdmin
    .from("users")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: "admin",
    })
    .eq("id", userId)

  if (softDeleteError) {
    console.error("Error soft deleting user:", softDeleteError)
    return { success: false, message: `فشل حذف المستخدم: ${softDeleteError.message}` }
  }

  // Also delete from auth.users if user_id exists
  if (user?.user_id) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.user_id)

    if (error) {
      console.error("Error deleting auth user:", error)
      // Revert the soft delete if auth deletion fails
      await supabaseAdmin
        .from("users")
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
        })
        .eq("id", userId)
      return { success: false, message: `فشل حذف المستخدم من نظام المصادقة: ${error.message}` }
    }
  }

  revalidatePath("/admin/users")
  return { success: true, message: "تم حذف المستخدم بنجاح." }
}

export async function setUserPassword(prevState: any, formData: FormData) {
  const userId = formData.get("id") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!userId || !email || !password) {
    return { success: false, message: "معرف المستخدم والبريد الإلكتروني وكلمة المرور مطلوبة." }
  }

  if (password.length < 6) {
    return { success: false, message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }
  }

  // Get the user to check if it already has an auth user
  const { data: user, error: fetchError } = await supabaseAdmin.from("users").select("*").eq("id", userId).single()

  if (fetchError) {
    console.error("Error fetching user:", fetchError)
    return { success: false, message: `فشل العثور على المستخدم: ${fetchError.message}` }
  }

  if (user.user_id) {
    return { success: false, message: "هذا المستخدم مرتبط بالفعل بحساب مصادقة." }
  }

  // Create a new auth user
  const user_metadata: Record<string, any> = {}
  if (user.first_name) user_metadata.first_name = user.first_name
  if (user.last_name) user_metadata.last_name = user.last_name
  if (user.phone) user_metadata.phone = user.phone

  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata,
  })

  if (createError) {
    console.error("Error creating auth user:", createError)
    return { success: false, message: `فشل إنشاء حساب المصادقة: ${createError.message}` }
  }

  // Update the public user with the auth user's ID
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      user_id: authUser.user.id,
      updated_at: new Date().toISOString(),
      updated_by: "admin",
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating user with auth ID:", updateError)
    // Try to clean up the auth user if update fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return { success: false, message: `فشل ربط المستخدم بحساب المصادقة: ${updateError.message}` }
  }

  revalidatePath("/admin/users")
  return { success: true, message: "تم تعيين كلمة المرور وإنشاء حساب المصادقة بنجاح." }
}

export async function updateUserRole(prevState: any, formData: FormData) {
  const userId = formData.get("id") as string
  const authUserId = formData.get("user_id") as string
  const role = formData.get("role") as string

  if (!userId) {
    return { success: false, message: "معرف المستخدم مطلوب." }
  }

  if (!authUserId) {
    return {
      success: false,
      message: "لا يمكن تعيين دور للمستخدم بدون حساب مصادقة. الرجاء ربط المستخدم بحساب مصادقة أولاً.",
    }
  }

  const isAdmin = role === "admin"

  // Update the public.users table with the role
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      is_admin: isAdmin,
      updated_at: new Date().toISOString(),
      updated_by: "admin",
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating user role:", updateError)
    return { success: false, message: `فشل تحديث دور المستخدم: ${updateError.message}` }
  }

  // Also update auth.users metadata to include the role
  const {
    data: { user: existingUser },
    error: fetchError,
  } = await supabaseAdmin.auth.admin.getUserById(authUserId)

  if (!fetchError && existingUser) {
    const new_user_metadata = {
      ...existingUser.user_metadata,
      is_admin: isAdmin,
    }

    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      user_metadata: new_user_metadata,
    })
  }

  revalidatePath("/admin/users")
  return { success: true, message: `تم تعيين دور المستخدم بنجاح إلى ${isAdmin ? "مسؤول" : "مستخدم عادي"}.` }
}

export async function confirmUserEmail(prevState: any, formData: FormData) {
  const userId = formData.get("id") as string
  const authUserId = formData.get("user_id") as string

  if (!userId || !authUserId) {
    return { success: false, message: "معرف المستخدم ومعرف المصادقة مطلوبان." }
  }

  try {
    // Update the auth user to confirm email
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      email_confirm: true,
    })

    if (confirmError) {
      console.error("Error confirming user email:", confirmError)
      return { success: false, message: `فشل تأكيد البريد الإلكتروني: ${confirmError.message}` }
    }

    revalidatePath("/admin/users")
    return { success: true, message: "تم تأكيد البريد الإلكتروني بنجاح." }
  } catch (error: any) {
    console.error("Error in confirmUserEmail:", error)
    return { success: false, message: error.message || "حدث خطأ أثناء تأكيد البريد الإلكتروني." }
  }
}

export async function confirmUserPhone(prevState: any, formData: FormData) {
  const userId = formData.get("id") as string
  const authUserId = formData.get("user_id") as string

  if (!userId || !authUserId) {
    return { success: false, message: "معرف المستخدم ومعرف المصادقة مطلوبان." }
  }

  try {
    // Update the auth user to confirm phone
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      phone_confirm: true,
    })

    if (confirmError) {
      console.error("Error confirming user phone:", confirmError)
      return { success: false, message: `فشل تأكيد رقم الهاتف: ${confirmError.message}` }
    }

    revalidatePath("/admin/users")
    return { success: true, message: "تم تأكيد رقم الهاتف بنجاح." }
  } catch (error: any) {
    console.error("Error in confirmUserPhone:", error)
    return { success: false, message: error.message || "حدث خطأ أثناء تأكيد رقم الهاتف." }
  }
}
