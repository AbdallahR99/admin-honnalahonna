import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ServiceProvider } from "@/lib/supabase/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Filter, PlusCircle } from "lucide-react"
import { AdminPagination } from "@/app/admin/components/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { StatusDropdown } from "../../service-providers/components/status-dropdown"
import { NextPageParams } from "@/lib/utils/next-page-types"

export const dynamic = "force-dynamic"

async function getServiceProviders(page = 1, limit = 10, statusFilter?: string, searchTerm?: string) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from("service_providers")
    .select(
      `
      id,
      service_name,
      status,
      created_at,
      slug,
      users (
        first_name,
        last_name,
        email
      )
    `,
      { count: "exact" },
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter)
  }

  // Fix the search query - use separate filters instead of complex OR
  if (searchTerm) {
    // For now, let's search only in service_name to avoid the join complexity
    // You can enhance this later with a more sophisticated search approach
    query = query.ilike("service_name", `%${searchTerm}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching service providers:", error)
    return { providers: [], count: 0, error: error.message }
  }
  return {
    providers:
      (data as unknown as (ServiceProvider & {
        users: { first_name: string | null; last_name: string | null; email: string | null } | null
      })[]) || [],
    count: count || 0,
    error: null,
  }
}

export default async function ServiceProvidersPage({
  searchParams,
}: NextPageParams) {
  const { page, status, search } = await searchParams || {};
  const currentPage = Number(page) || 1;
  const statusFilter = status || "all";
  const searchTerm = search || "";
  const itemsPerPage = 10;

  const { providers, count, error } = await getServiceProviders(currentPage, itemsPerPage, statusFilter ? `${statusFilter}` : undefined, searchTerm ? `${searchTerm}` : undefined);

  if (error) {
    return <div className="text-red-500 p-4">خطأ في تحميل طلبات مزودي الخدمة: {error}</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">طلبات مزودي الخدمة</h1>
        <Button asChild>
          <Link href="/admin/service-providers/new" className="flex items-center gap-2">
            <PlusCircle size={18} /> إضافة مزود خدمة جديد
          </Link>
        </Button>
      </div>

      <form className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            بحث
          </label>
          <Input
            id="search"
            type="search"
            name="search"
            placeholder="ابحث بالاسم، اسم الخدمة..."
            defaultValue={searchTerm}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            فلترة بالحالة
          </label>
          <Select name="status" defaultValue={statusFilter}>
            <SelectTrigger id="status">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">مقبول</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="flex items-center gap-2 self-end sm:self-auto h-10">
          <Filter size={18} /> تطبيق الفلاتر
        </Button>
      </form>

      <div key={`service-providers-table-${currentPage}-${searchTerm}-${statusFilter}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">اسم الخدمة</TableHead>
              <TableHead className="text-right">اسم مزود الخدمة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ التقديم</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.service_name || "غير متوفر"}</TableCell>
                <TableCell>
                  {provider.users
                    ? `${provider.users.first_name || ""} ${provider.users.last_name || ""}`.trim() ||
                      provider.users.email
                    : "مستخدم غير معروف"}
                </TableCell>
                <TableCell>
                  <StatusDropdown providerId={provider.id} currentStatus={provider.status} size="sm" />
                </TableCell>
                <TableCell>
                  {provider.created_at ? new Date(provider.created_at).toLocaleDateString("ar-EG") : "-"}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/service-providers/${provider.id}`} className="flex items-center gap-1">
                      <Eye size={16} /> عرض
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {providers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                  لا توجد طلبات لعرضها.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {count > itemsPerPage && (
        <AdminPagination
          currentPage={currentPage}
          totalCount={count}
          itemsPerPage={itemsPerPage}
          basePath="/admin/service-providers"
        />
      )}
    </div>
  )
}
