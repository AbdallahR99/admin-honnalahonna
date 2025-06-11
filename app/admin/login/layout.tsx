import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تسجيل الدخول - لوحة التحكم الإدارية",
  description: "تسجيل الدخول إلى لوحة التحكم الإدارية لمنصة هنا لا هنا",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">{children}</div>
}
