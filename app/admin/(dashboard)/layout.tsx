import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, Briefcase, Users, Layers, MapPin } from "lucide-react"
import { requireAdminAuth } from "@/lib/auth/utils"
import { LogoutButton } from "../components/logout-button"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require admin authentication for dashboard routes
  const session = await requireAdminAuth()

  const navItems = [
    { href: "/admin", label: "لوحة التحكم", icon: Home },
    { href: "/admin/service-providers", label: "طلبات مزودي الخدمة", icon: Briefcase },
    { href: "/admin/users", label: "ملفات المستخدمين", icon: Users },
    { href: "/admin/service-categories", label: "فئات الخدمات", icon: Layers },
    { href: "/admin/governorates", label: "المحافظات", icon: MapPin },
  ]
  const userFullName = `${session.user.user_metadata['first_name']} ${session.user.user_metadata['last_name']}`

  return (
    <div dir="rtl" className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-6 fixed h-full">
        <div className="flex items-center justify-center mb-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/icon.png" alt="Honna La Honna Logo" width={40} height={40} />
            <span className="text-xl font-semibold">هنا لهنا - الإدارة</span>
          </Link>
        </div>

        {/* User info */}
        <div className="bg-gray-700 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-300">مرحباً</p>
          <p className="font-semibold truncate">{userFullName}</p>
          <p className="text-xs text-green-400">مسؤول</p>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="border-t border-gray-700 pt-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8 mr-64">{children}</main>
    </div>
  )
}
