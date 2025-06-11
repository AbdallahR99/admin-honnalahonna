import { Label } from "@/components/ui/label"
import { getUsers } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UsersTable } from "../../users/components/users-table"
import { NextPageParams } from "@/lib/utils/next-page-types"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage({
  searchParams,
}: NextPageParams) {
  const { page, search, role } = await searchParams;
  const currentPage = Number(page) || 1;
  const searchTerm = search || "";
  const roleFilter = role || "all";
  const itemsPerPage = 10;

  const { users, count, error } = await getUsers(
    currentPage,
    itemsPerPage,
    `${searchTerm}`,
    `${roleFilter ?? "all"}` // Use roleFilter directly
  );

  if (error) {
    return <div className="text-red-500 p-4">خطأ في تحميل المستخدمين: {error}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">المستخدمون</h1>

      <form className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search_users" className="block text-sm font-medium text-gray-700 mb-1">
            بحث بالاسم أو البريد
          </Label>
          <Input id="search_users" type="search" name="search" placeholder="ابحث..." defaultValue={searchTerm} />
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="role_filter" className="block text-sm font-medium text-gray-700 mb-1">
            فلترة بالدور
          </Label>
          <Select name="role" defaultValue={roleFilter}>
            <SelectTrigger id="role_filter">
              <SelectValue placeholder="اختر الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="admin">مسؤول</SelectItem>
              <SelectItem value="public">مستخدم عادي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="flex items-center gap-2 self-end sm:self-auto h-10">
          <Filter size={18} /> تطبيق الفلاتر
        </Button>
      </form>

      <UsersTable
        key={`users-${currentPage}-${searchTerm}-${roleFilter}`}
        initialUsers={users}
        totalCount={count}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}
