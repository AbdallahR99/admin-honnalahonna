"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Pencil,
  Trash2,
  PlusCircle,
  Key,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
} from "lucide-react"
import { UserForm } from "./user-form"

import type { User } from "@/lib/supabase/types"
import { useToast } from "@/components/ui/use-toast"
import { AdminPagination } from "@/app/admin/components/pagination"
import { SetPasswordForm } from "./set-password-form"
import { RoleSelector } from "./role-selector"
import { ConfirmationDialog } from "./confirmation-dialog"
import { deleteUserByAdmin, createUserByAdmin, updateUserByAdmin, setUserPassword, updateUserRole, confirmUserEmail, confirmUserPhone } from "../../(dashboard)/users/actions"

interface UsersTableProps {
  initialUsers: (User & {
    email_confirmed_at?: string | null
    phone_confirmed_at?: string | null
  })[]
  totalCount: number
  currentPage: number
  itemsPerPage: number
}

export function UsersTable({ initialUsers, totalCount, currentPage, itemsPerPage }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false)
  const [isSetRoleModalOpen, setIsSetRoleModalOpen] = useState(false)
  const [isConfirmEmailModalOpen, setIsConfirmEmailModalOpen] = useState(false)
  const [isConfirmPhoneModalOpen, setIsConfirmPhoneModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<(typeof initialUsers)[0] | null>(null)
  const { toast } = useToast()

  const handleEdit = (user: (typeof initialUsers)[0]) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleDeletePrompt = (user: (typeof initialUsers)[0]) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleSetPassword = (user: (typeof initialUsers)[0]) => {
    setSelectedUser(user)
    setIsSetPasswordModalOpen(true)
  }

  const handleSetRole = (user: (typeof initialUsers)[0]) => {
    setSelectedUser(user)
    setIsSetRoleModalOpen(true)
  }

  const handleConfirmEmail = (user: (typeof initialUsers)[0]) => {
    setSelectedUser(user)
    setIsConfirmEmailModalOpen(true)
  }

  const handleConfirmPhone = (user: (typeof initialUsers)[0]) => {
    setSelectedUser(user)
    setIsConfirmPhoneModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser || !selectedUser.id) return
    const result = await deleteUserByAdmin(selectedUser.id)
    toast({
      title: result.success ? "نجاح" : "خطأ",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    if (result.success) {
      // Rely on revalidatePath to refresh the list from the server
    }
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }

  const renderConfirmationStatus = (user: (typeof initialUsers)[0]) => {
    if (!user.user_id) {
      return <Badge variant="outline">غير مرتبط</Badge>
    }

    const emailConfirmed = user.email_confirmed_at
    const phoneConfirmed = user.phone_confirmed_at || !user.phone // Consider confirmed if no phone provided

    if (emailConfirmed && phoneConfirmed) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          مؤكد بالكامل
        </Badge>
      )
    } else if (emailConfirmed) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          البريد مؤكد
        </Badge>
      )
    } else {
      return <Badge variant="destructive">غير مؤكد</Badge>
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">إدارة المستخدمين</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={18} /> إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
            </DialogHeader>
            <UserForm
              action={createUserByAdmin}
              buttonText="إنشاء مستخدم"
              onSuccess={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">البريد الإلكتروني</TableHead>
            <TableHead className="text-right">الهاتف</TableHead>
            <TableHead className="text-right">حالة التأكيد</TableHead>
            <TableHead className="text-right">الدور</TableHead>
            <TableHead className="text-right">تاريخ الإنشاء</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.first_name || ""} {user.last_name || ""}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.email}
                  {user.user_id && !user.email_confirmed_at && (
                    <XCircle className="w-4 h-4 text-red-500" title="البريد غير مؤكد" />
                  )}
                  {user.user_id && user.email_confirmed_at && (
                    <CheckCircle className="w-4 h-4 text-green-500" title="البريد مؤكد" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.phone || "-"}
                  {user.user_id && user.phone && !user.phone_confirmed_at && (
                    <XCircle className="w-4 h-4 text-red-500" title="الهاتف غير مؤكد" />
                  )}
                  {user.user_id && user.phone && user.phone_confirmed_at && (
                    <CheckCircle className="w-4 h-4 text-green-500" title="الهاتف مؤكد" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.is_banned ? <Badge variant="destructive">محظور</Badge> : renderConfirmationStatus(user)}
              </TableCell>
              <TableCell>
                {user.is_admin ? (
                  <Badge variant="default" className="bg-blue-500">
                    <ShieldAlert className="w-3 h-3 mr-1" /> مسؤول
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    <ShieldCheck className="w-3 h-3 mr-1" /> مستخدم عادي
                  </Badge>
                )}
              </TableCell>
              <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString("ar-EG") : "-"}</TableCell>
              <TableCell className="space-x-1 space-x-reverse">
                <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                  <Pencil size={14} />
                </Button>
                {!user.user_id && (
                  <Button variant="outline" size="sm" onClick={() => handleSetPassword(user)}>
                    <Key size={14} />
                  </Button>
                )}
                {user.user_id && (
                  <Button variant="outline" size="sm" onClick={() => handleSetRole(user)}>
                    <ShieldAlert size={14} />
                  </Button>
                )}
                {user.user_id && !user.email_confirmed_at && (
                  <Button variant="outline" size="sm" onClick={() => handleConfirmEmail(user)} title="تأكيد البريد">
                    <Mail size={14} />
                  </Button>
                )}
                {user.user_id && user.phone && !user.phone_confirmed_at && (
                  <Button variant="outline" size="sm" onClick={() => handleConfirmPhone(user)} title="تأكيد الهاتف">
                    <Phone size={14} />
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleDeletePrompt(user)}>
                  <Trash2 size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {initialUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                لا يوجد مستخدمون لعرضهم.
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
          basePath="/admin/users"
        />
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              action={updateUserByAdmin}
              initialData={selectedUser}
              buttonText="حفظ التعديلات"
              onSuccess={() => setIsEditModalOpen(false)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Set Password Modal */}
      <Dialog open={isSetPasswordModalOpen} onOpenChange={setIsSetPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تعيين كلمة المرور وإنشاء حساب مصادقة</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <SetPasswordForm
              action={setUserPassword}
              user={selectedUser}
              onSuccess={() => setIsSetPasswordModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Set Role Modal */}
      <Dialog open={isSetRoleModalOpen} onOpenChange={setIsSetRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تعيين دور المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && selectedUser.user_id && (
            <RoleSelector action={updateUserRole} user={selectedUser} onSuccess={() => setIsSetRoleModalOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Email Modal */}
      <Dialog open={isConfirmEmailModalOpen} onOpenChange={setIsConfirmEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد البريد الإلكتروني</DialogTitle>
          </DialogHeader>
          {selectedUser && selectedUser.user_id && (
            <ConfirmationDialog
              action={confirmUserEmail}
              user={selectedUser}
              type="email"
              onSuccess={() => setIsConfirmEmailModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Phone Modal */}
      <Dialog open={isConfirmPhoneModalOpen} onOpenChange={setIsConfirmPhoneModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد رقم الهاتف</DialogTitle>
          </DialogHeader>
          {selectedUser && selectedUser.user_id && selectedUser.phone && (
            <ConfirmationDialog
              action={confirmUserPhone}
              user={selectedUser}
              type="phone"
              onSuccess={() => setIsConfirmPhoneModalOpen(false)}
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
            هل أنت متأكد أنك تريد حذف المستخدم "{selectedUser?.email}"؟ هذا الإجراء سيحذف حساب المستخدم نهائيًا.
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
