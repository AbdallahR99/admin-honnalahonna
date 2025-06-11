import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image src="/icon.png" alt="Honna La Honna Logo" width={80} height={80} className="rounded-lg" />
          </div>
        </div>

        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <ShieldX className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600">غير مصرح لك بالدخول</CardTitle>
            <CardDescription className="text-gray-600">ليس لديك صلاحية للوصول إلى لوحة التحكم الإدارية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              هذه المنطقة مخصصة للمسؤولين فقط. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المسؤول.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/login" className="flex items-center gap-2">
                  تسجيل الدخول بحساب آخر <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/" className="flex items-center gap-2">
                  العودة إلى الموقع الرئيسي <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
