import { getGovernorates } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { GovernoratesTable } from "../../governorates/components/governorates-table"
import { NextPageParams } from "@/lib/utils/next-page-types"

export const dynamic = "force-dynamic" // Ensure dynamic rendering

export default async function AdminGovernoratesPage({
  searchParams,
}: NextPageParams) {
  const { page, search } = await searchParams;
  const currentPage = Number(page) || 1;
  const searchTerm = search || "";
  const itemsPerPage = 10;

  const { governorates, count, error } = await getGovernorates(
    currentPage,
    itemsPerPage,
    `${searchTerm}`
  );

  if (error) {
    return <div className="text-red-500 p-4">خطأ في تحميل المحافظات: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">المحافظات</h1>

      <form className="mb-6 flex gap-2">
        <Input
          type="search"
          name="search"
          placeholder="ابحث بالاسم أو الكود..."
          defaultValue={searchTerm}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          <Search size={18} className="ml-2" /> بحث
        </Button>
      </form>

      <GovernoratesTable
        key={`governorates-${currentPage}-${searchTerm}`} // Add a unique key
        initialGovernorates={governorates}
        totalCount={count}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}
