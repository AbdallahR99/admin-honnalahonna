"use server"

import { supabase } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function signInWithPhone(phone: string, password: string) {
  try {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password,
    })

    if (error) {
      console.error("Auth error:", error)
      return {
        success: false,
        error: getErrorMessage(error.message),
      }
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        error: "فشل في تسجيل الدخول",
      }
    }

    // Check if user is admin
    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("is_admin, is_banned")
      .eq("user_id", data.user.id)
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return {
        success: false,
        error: "خطأ في التحقق من صلاحيات المستخدم",
      }
    }

    if (userData?.is_banned) {
      // Sign out the banned user
      await supabase.auth.signOut()
      return {
        success: false,
        error: "تم حظر هذا الحساب",
      }
    }

    if (!userData?.is_admin) {
      // Sign out non-admin user
      await supabase.auth.signOut()
      return {
        success: false,
        error: "ليس لديك صلاحية للوصول إلى لوحة التحكم الإدارية",
      }
    }

    // Set cookies for session management
    const cookieStore = await cookies()

    cookieStore.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    cookieStore.set("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return {
      success: true,
      user: {
        id: data.user.id,
        phone: data.user.phone,
        email: data.user.email || "",
    
        is_admin: userData.is_admin,
      },
    }
  } catch (error) {
    console.error("Unexpected login error:", error)
    return {
      success: false,
      error: "حدث خطأ غير متوقع",
    }
  }
}

function getErrorMessage(errorMessage: string): string {
  if (errorMessage.includes("Invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة"
  }
  if (errorMessage.includes("Email not confirmed")) {
    return "يرجى تأكيد البريد الإلكتروني أولاً"
  }
  if (errorMessage.includes("Too many requests")) {
    return "محاولات كثيرة جداً، يرجى المحاولة لاحقاً"
  }
  return "حدث خطأ أثناء تسجيل الدخول"
}
