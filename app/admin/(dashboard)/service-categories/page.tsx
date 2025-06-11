import { getServiceCategories } from "./actions"
// import { CategoriesTable } from "./components/categories-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { CategoriesTable } from "../../service-categories/components/categories-table"
import { NextPageParams } from "@/lib/utils/next-page-types"

export const dynamic = "force-dynamic" // Ensure dynamic rendering
export default async function ServiceCategoriesPage({
  searchParams,
}: NextPageParams) {
  // Destructure page and search from searchParams, providing default values.
  // If searchParams is undefined, or if page/search properties are missing,
  // they will default to '1' and '' respectively.
  const {
    page: pageParam = "1",
    search: searchParam = "",
    searchTerm = "",
  } = (await searchParams) || {};

  const currentPage = Number(pageParam);
  // Ensure currentPage defaults to 1 if pageParam was not a valid number
  const finalCurrentPage = isNaN(currentPage) ? 1 : currentPage;
  // const searchTerm = searchParam;
  const itemsPerPage = 10;

  const { categories, count, error } = await getServiceCategories(
    finalCurrentPage,
    itemsPerPage,
    searchTerm ? `${searchTerm}` : ""
  );

  if (error) {
    return (
      <div className="text-red-500 p-4">خطأ في تحميل فئات الخدمات: {error}</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">فئات الخدمات</h1>

      <form className="mb-6 flex gap-2">
        <Input
          type="search"
          name="search"
          placeholder="ابحث عن فئة..."
          defaultValue={searchTerm}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          <Search size={18} className="ml-2" /> بحث
        </Button>
      </form>

      <CategoriesTable
        key={`categories-${finalCurrentPage}-${searchTerm}`} // Use finalCurrentPage
        initialCategories={categories}
        totalCount={count}
        currentPage={finalCurrentPage} // Use finalCurrentPage
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}