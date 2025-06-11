import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "لوحة التحكم الإدارية - هنا لا هنا",
  description: "لوحة التحكم الإدارية لمنصة هنا لا هنا",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
