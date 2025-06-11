import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ServiceProvider } from "@/lib/supabase/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Edit } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { isUuid } from "@/lib/utils"
import { SupabasePaths } from "@/lib/supabase/paths"
import { StatusDropdown } from "@/app/admin/service-providers/components/status-dropdown"
import { NextPageParams } from "@/lib/utils/next-page-types"

export const dynamic = "force-dynamic"

async function getServiceProviderDetails(id: string) {
  const { data, error } = await supabaseAdmin
    .from("service_providers")
    .select(`
      *,
      users (
        first_name,
        last_name,
        email,
        phone,
        avatar
      ),
      governorates (name),
      service_categories (name)
    `)
    .eq("id", id)
    .eq("is_deleted", false)
    .single()

  if (error) {
    console.error("Error fetching service provider details:", error)
    if (error.message.includes("invalid input syntax for type uuid")) {
      return { provider: null, error: "Invalid ID format." }
    }
    return { provider: null, error: error.message }
  }
  return {
    provider: data as ServiceProvider & { users: any; governorates: any; service_categories: any },
    error: null,
  }
}

const renderDocumentLinks = (filenamesString: string | null | undefined, label: string) => {
  if (!filenamesString) return <p className="text-gray-500">{label}: غير متوفر</p>
  const filenames = filenamesString.split(", ").filter((filename) => filename.trim() !== "")
  if (filenames.length === 0) return <p className="text-gray-500">{label}: غير متوفر</p>

  return (
    <div>
      <p className="font-semibold">{label}:</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        {filenames.map((filename, index) => {
          const fullUrl = `${SupabasePaths.SERVICE_PROVIDERS}/${filename}`
          return (
            <li key={index}>
              {filename.match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                <Link href={fullUrl} target="_blank" rel="noopener noreferrer" className="block mt-1">
                  <Image
                    src={fullUrl || "/placeholder.svg"}
                    alt={`${label} ${index + 1}`}
                    width={150}
                    height={100}
                    className="rounded border object-cover hover:opacity-80 transition-opacity"
                  />
                </Link>
              ) : (
                <Link
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  عرض المستند {index + 1}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const renderSingleDocumentLink = (filename: string | null | undefined, label: string) => {
  if (!filename) return <p className="text-gray-500">{label}: غير متوفر</p>

  const fullUrl = `${SupabasePaths.SERVICE_PROVIDERS}/${filename}`

  if (filename.match(/\.(jpeg|jpg|gif|png)$/i) != null) {
    return (
      <div>
        <p className="font-semibold">{label}:</p>
        <Link href={fullUrl} target="_blank" rel="noopener noreferrer" className="block mt-1">
          <Image
            src={fullUrl || "/placeholder.svg"}
            alt={label}
            width={200}
            height={150}
            className="rounded border object-cover hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>
    )
  }
  return (
    <p>
      <span className="font-semibold">{label}: </span>
      <Link href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        عرض المستند
      </Link>
    </p>
  )
}

const renderVideoLink = (url: string | null | undefined, label: string) => {
  if (!url) return <p className="text-gray-500">{label}: غير متوفر</p>
  const fullUrl = `${SupabasePaths.SERVICE_PROVIDERS_VIDEOS}/${url}`;

  return (
    <p>
      <span className="font-semibold">{label}: </span>
      <Link href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        عرض الفيديو
      </Link>
    </p>
  )
}

export default async function ServiceProviderDetailsPage({ params }: NextPageParams) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound()
  }

  const { provider, error } = await getServiceProviderDetails(id)

  if (error || !provider) {
    console.error(`Error for ID ${id}: ${error}`)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">تفاصيل طلب مزود الخدمة</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/service-providers/${provider.id}/edit`} className="flex items-center gap-2">
              <Edit size={16} /> تعديل
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/service-providers" className="flex items-center gap-2">
              العودة إلى القائمة <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{provider.service_name || "اسم الخدمة غير متوفر"}</CardTitle>
              <CardDescription>
                مقدم بواسطة: {provider.users?.first_name} {provider.users?.last_name} ({provider.users?.email})
              </CardDescription>
              {provider.slug && <p className="text-sm text-gray-500 mt-1">الرابط: {provider.slug}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm text-gray-600">تغيير الحالة:</div>
              <StatusDropdown providerId={provider.id} currentStatus={provider.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <span className="font-semibold">فئة الخدمة:</span> {provider.service_categories?.name || "-"}
            </p>
            <p>
              <span className="font-semibold">المحافظة:</span> {provider.governorates?.name || "-"}
            </p>
            <p>
              <span className="font-semibold">سنوات الخبرة:</span> {provider.years_of_experience ?? "-"}
            </p>
            <p>
              <span className="font-semibold">طريقة تقديم الخدمة:</span> {provider.service_delivery_method || "-"}
            </p>
            <p>
              <span className="font-semibold">الهاتف:</span> {provider.users?.phone || "-"}
            </p>
            <p>
              <span className="font-semibold">تاريخ التقديم:</span>{" "}
              {new Date(provider.created_at!).toLocaleDateString("ar-EG")}
            </p>
          </div>

          <div>
            <span className="font-semibold">الوصف:</span>{" "}
            <p className="text-gray-700 whitespace-pre-wrap">{provider.service_description || "-"}</p>
          </div>
          <div>
            <span className="font-semibold">النبذة التعريفية (Bio):</span>{" "}
            <p className="text-gray-700 whitespace-pre-wrap">{provider.bio || "-"}</p>
          </div>

          <h3 className="text-lg font-semibold pt-4 border-t mt-4">الروابط والمستندات:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSingleDocumentLink(provider.logo_image, "الشعار")}
            {renderSingleDocumentLink(provider.id_card_front_image, "وجه البطاقة الشخصية")}
            {renderSingleDocumentLink(provider.id_card_back_image, "ظهر البطاقة الشخصية")}
            {renderDocumentLinks(provider.certificates_images, "الشهادات")}
            {renderDocumentLinks(provider.document_list, "قائمة المستندات الأخرى")}
            {renderVideoLink(provider.video_url, "رابط الفيديو")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm pt-4">
            {provider.facebook_url && (
              <p>
                <span className="font-semibold">فيسبوك:</span>{" "}
                <Link href={provider.facebook_url} target="_blank" className="text-blue-500 hover:underline">
                  رابط
                </Link>
              </p>
            )}
            {provider.instagram_url && (
              <p>
                <span className="font-semibold">انستغرام:</span>{" "}
                <Link href={provider.instagram_url} target="_blank" className="text-blue-500 hover:underline">
                  رابط
                </Link>
              </p>
            )}
            {provider.whatsapp_url && (
              <p>
                <span className="font-semibold">واتساب:</span>{" "}
                <Link href={provider.whatsapp_url} target="_blank" className="text-blue-500 hover:underline">
                  رابط
                </Link>
              </p>
            )}
          </div>
          {provider.notes && (
            <div className="pt-4">
              <span className="font-semibold">ملاحظات إضافية:</span>{" "}
              <p className="text-gray-700 whitespace-pre-wrap">{provider.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
