import {
  updateServiceProviderByAdmin,
  getUsersForSelect,
  getGovernoratesForSelect,
  getServiceCategoriesForSelect,
} from "../../../actions"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ServiceProvider } from "@/lib/supabase/types"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { isUuid } from "@/lib/utils"
import { ServiceProviderForm } from "@/app/admin/service-providers/components/service-provider-form"
import { NextPageParams } from "@/lib/utils/next-page-types"

export const dynamic = "force-dynamic"

async function getServiceProviderDataForEdit(id: string) {
  // This function assumes id is a valid UUID
  const { data, error } = await supabaseAdmin
    .from("service_providers")
    .select("*") // Select all fields for editing
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching service provider for edit:", error)
    return null
  }
  return data as ServiceProvider
}

export default async function EditServiceProviderPage({ params }: NextPageParams) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound() // If ID is not a UUID, show 404
  }

  const [providerData, usersData, governoratesData, categoriesData] = await Promise.all([
    getServiceProviderDataForEdit(id),
    getUsersForSelect(),
    getGovernoratesForSelect(),
    getServiceCategoriesForSelect(),
  ])

  if (!providerData) {
    // This means getServiceProviderDataForEdit returned null, e.g. actual DB error or not found for a valid UUID
    notFound()
  }
  if (usersData.error || governoratesData.error || categoriesData.error) {
    return (
      <div className="text-red-500 p-4">
        خطأ في تحميل البيانات اللازمة للتعديل:
        {usersData.error && <p>المستخدمون: {usersData.error}</p>}
        {governoratesData.error && <p>المحافظات: {governoratesData.error}</p>}
        {categoriesData.error && <p>الفئات: {categoriesData.error}</p>}
      </div>
    )
  }

  const updateActionWithId = updateServiceProviderByAdmin.bind(null, id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">تعديل مزود الخدمة</h1>
        <Button asChild variant="outline">
          <Link href={`/admin/service-providers/${id}`} className="flex items-center gap-2">
            العودة إلى التفاصيل <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      <ServiceProviderForm
        action={updateActionWithId}
        users={usersData.users}
        governorates={governoratesData.governorates}
        serviceCategories={categoriesData.categories}
        initialData={providerData}
        buttonText="حفظ التعديلات"
        isEditing={true}
      />
    </div>
  )
}
