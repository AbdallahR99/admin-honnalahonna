import { LoginForm } from "./components/login-form"
import { getSession } from "@/lib/auth/utils"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function AdminLoginPage() {
  // Redirect if already authenticated
  const session = await getSession()
  if (session) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image src="/icon.png" alt="Honna La Honna Logo" width={80} height={80} className="rounded-lg" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم الإدارية</h2>
          <p className="text-gray-600">تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <LoginForm />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>مخصص للمسؤولين فقط</p>
        </div>
      </div>
    </div>
  )
}
