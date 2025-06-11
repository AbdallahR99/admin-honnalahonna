"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, PlusCircle } from "lucide-react"
import { CategoryForm } from "./category-form"
import type { ServiceCategory } from "@/lib/supabase/types"
import { useToast } from "@/components/ui/use-toast"
import { AdminPagination } from "@/app/admin/components/pagination"
import Image from "next/image"
import { SupabasePaths } from "@/lib/supabase/paths"
import { deleteServiceCategory, updateServiceCategory, createServiceCategory } from "../../(dashboard)/service-categories/actions"

interface CategoriesTableProps {
  initialCategories: ServiceCategory[]
  totalCount: number
  currentPage: number
  itemsPerPage: number
}

export function CategoriesTable({ initialCategories, totalCount, currentPage, itemsPerPage }: CategoriesTableProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const { toast } = useToast()

  const handleEdit = (category: ServiceCategory) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  const handleDeletePrompt = (category: ServiceCategory) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return
    const result = await deleteServiceCategory(selectedCategory.id)
    toast({
      title: result.success ? "نجاح" : "خطأ",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    if (result.success) {
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id))
    }
    setIsDeleteModalOpen(false)
    setSelectedCategory(null)
  }

  // Create bound action for update
  const updateActionWithId = updateServiceCategory.bind(null, selectedCategory?.id || "")

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">إدارة فئات الخدمات</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={18} /> إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة فئة خدمة جديدة</DialogTitle>
            </DialogHeader>
            <CategoryForm
              action={createServiceCategory}
              buttonText="إنشاء فئة"
              onSuccess={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الأيقونة</TableHead>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">الرابط (Slug)</TableHead>
            <TableHead className="text-right">تاريخ الإنشاء</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                {category.icon ? (
                  <Image
                    src={`${SupabasePaths.SERVICE_CATEGORIES}/${category.icon}`}
                    alt={category.name}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-400">-</div>
                )}
              </TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-sm text-gray-600">{category.slug || "-"}</TableCell>
              <TableCell>
                {category.created_at ? new Date(category.created_at).toLocaleDateString("ar-EG") : "-"}
              </TableCell>
              <TableCell className="space-x-2 space-x-reverse">
                <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeletePrompt(category)}>
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                لا توجد فئات خدمات لعرضها.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalCount > itemsPerPage && (
        <AdminPagination
          currentPage={currentPage}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          basePath="/admin/service-categories"
        />
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل فئة الخدمة</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              action={updateActionWithId}
              initialData={selectedCategory}
              buttonText="حفظ التعديلات"
              onSuccess={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-700">
            هل أنت متأكد أنك تريد حذف الفئة "{selectedCategory?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              حذف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
