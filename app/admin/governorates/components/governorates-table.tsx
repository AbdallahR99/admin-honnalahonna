"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, PlusCircle } from "lucide-react"
import { GovernorateForm } from "./governorate-form"
import type { Governorate } from "@/lib/supabase/types"
import { useToast } from "@/components/ui/use-toast"
import { AdminPagination } from "@/app/admin/components/pagination"
import { deleteGovernorate, updateGovernorate, createGovernorate } from "../../(dashboard)/governorates/actions"

interface GovernoratesTableProps {
  initialGovernorates: Governorate[]
  totalCount: number
  currentPage: number
  itemsPerPage: number
}

export function GovernoratesTable({
  initialGovernorates,
  totalCount,
  currentPage,
  itemsPerPage,
}: GovernoratesTableProps) {
  const [governorates, setGovernorates] = useState(initialGovernorates)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null)
  const { toast } = useToast()

  const handleEdit = (governorate: Governorate) => {
    setSelectedGovernorate(governorate)
    setIsEditModalOpen(true)
  }

  const handleDeletePrompt = (governorate: Governorate) => {
    setSelectedGovernorate(governorate)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedGovernorate) return
    const result = await deleteGovernorate(selectedGovernorate.id)
    toast({
      title: result.success ? "نجاح" : "خطأ",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    if (result.success) {
      setGovernorates(governorates.filter((gov) => gov.id !== selectedGovernorate.id))
      // Consider re-fetching or relying on revalidatePath for full consistency
    }
    setIsDeleteModalOpen(false)
    setSelectedGovernorate(null)
  }

  const actionWithId = updateGovernorate.bind(null, selectedGovernorate?.id || "")

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">إدارة المحافظات</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={18} /> إضافة محافظة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة محافظة جديدة</DialogTitle>
            </DialogHeader>
            <GovernorateForm
              action={createGovernorate}
              buttonText="إنشاء محافظة"
              onSuccess={() => {
                setIsCreateModalOpen(false)
                // Trigger re-fetch or rely on revalidatePath
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">الكود</TableHead>
            <TableHead className="text-right">تاريخ الإنشاء</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {governorates.map((governorate) => (
            <TableRow key={governorate.id}>
              <TableCell className="font-medium">{governorate.name}</TableCell>
              <TableCell>{governorate.governorate_code || "-"}</TableCell>
              <TableCell>
                {governorate.created_at ? new Date(governorate.created_at).toLocaleDateString("ar-EG") : "-"}
              </TableCell>
              <TableCell className="space-x-2 space-x-reverse">
                <Button variant="outline" size="sm" onClick={() => handleEdit(governorate)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeletePrompt(governorate)}>
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {governorates.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                لا توجد محافظات لعرضها.
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
          basePath="/admin/governorates"
        />
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل المحافظة</DialogTitle>
          </DialogHeader>
          {selectedGovernorate && (
            <GovernorateForm
              action={actionWithId}
              initialData={selectedGovernorate}
              buttonText="حفظ التعديلات"
              onSuccess={() => {
                setIsEditModalOpen(false)
                // Trigger re-fetch or rely on revalidatePath
              }}
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
          <p className="py-4 text-gray-700">هل أنت متأكد أنك تريد حذف المحافظة "{selectedGovernorate?.name}"؟</p>
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
