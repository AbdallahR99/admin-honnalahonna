// No changes needed here if the form component handles the new file inputs correctly.
// The action `createServiceProviderByAdmin` is already updated.
import {
  createServiceProviderByAdmin,
  getUsersForSelect,
  getGovernoratesForSelect,
  getServiceCategoriesForSelect,
} from "../actions"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ServiceProviderForm } from "@/app/admin/service-providers/components/service-provider-form"

export const dynamic = "force-dynamic"

export default async function NewServiceProviderPage() {
  const [usersData, governoratesData, categoriesData] = await Promise.all([
    getUsersForSelect(),
    getGovernoratesForSelect(),
    getServiceCategoriesForSelect(),
  ])

  if (usersData.error || governoratesData.error || categoriesData.error) {
    return (
      <div className="text-red-500 p-4">
        خطأ في تحميل البيانات اللازمة:
        {usersData.error && <p>المستخدمون: {usersData.error}</p>}
        {governoratesData.error && <p>المحافظات: {governoratesData.error}</p>}
        {categoriesData.error && <p>الفئات: {categoriesData.error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">إضافة مزود خدمة جديد</h1>
        <Button asChild variant="outline">
          <Link href="/admin/service-providers" className="flex items-center gap-2">
            العودة إلى القائمة <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      <ServiceProviderForm
        action={createServiceProviderByAdmin}
        users={usersData.users}
        governorates={governoratesData.governorates}
        serviceCategories={categoriesData.categories}
        buttonText="إنشاء مزود خدمة"
        isEditing={false}
      />
    </div>
  )
}
