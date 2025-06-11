"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/supabase/types"
import { Mail, Phone, AlertTriangle } from "lucide-react"

interface ConfirmationDialogProps {
  action: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string }>
  user: User & {
    email_confirmed_at?: string | null
    phone_confirmed_at?: string | null
  }
  type: "email" | "phone"
  onSuccess?: () => void
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "جاري التأكيد..." : text}
    </Button>
  )
}

export function ConfirmationDialog({ action, user, type, onSuccess }: ConfirmationDialogProps) {
  const [state, formAction] = useActionState(action, { success: false, message: "" })
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "نجاح" : "خطأ",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
      if (state.success && onSuccess) {
        onSuccess()
      }
    }
  }, [state, toast, onSuccess])

  // Ensure user has auth identification
  if (!user.user_id) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-semibold">لا يمكن التأكيد</p>
        </div>
        <p className="text-sm mt-1">
          يجب ربط المستخدم بحساب مصادقة أولاً قبل تأكيد {type === "email" ? "البريد الإلكتروني" : "رقم الهاتف"}.
        </p>
      </div>
    )
  }

  const isEmailType = type === "email"
  const isPhoneType = type === "phone"
  const value = isEmailType ? user.email : user.phone
  const isAlreadyConfirmed = isEmailType ? user.email_confirmed_at : user.phone_confirmed_at

  if (isAlreadyConfirmed) {
    return (
      <div className="p-4 bg-green-50 text-green-800 rounded-md">
        <div className="flex items-center gap-2">
          {isEmailType ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
          <p className="font-semibold">مؤكد بالفعل</p>
        </div>
        <p className="text-sm mt-1">
          {isEmailType ? "البريد الإلكتروني" : "رقم الهاتف"} مؤكد بالفعل في{" "}
          {new Date(isAlreadyConfirmed).toLocaleDateString("ar-EG")}
        </p>
      </div>
    )
  }

  if (isPhoneType && !user.phone) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-semibold">لا يوجد رقم هاتف</p>
        </div>
        <p className="text-sm mt-1">لا يمكن تأكيد رقم الهاتف لأن المستخدم لم يقم بإدخال رقم هاتف.</p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="user_id" value={user.user_id} />

      <div className="flex items-center gap-3">
        {isEmailType ? <Mail className="w-6 h-6 text-blue-500" /> : <Phone className="w-6 h-6 text-green-500" />}
        <div>
          <p className="font-semibold text-gray-800">تأكيد {isEmailType ? "البريد الإلكتروني" : "رقم الهاتف"}</p>
          <p className="text-sm text-gray-600">
            للمستخدم: {user.first_name} {user.last_name}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-sm text-gray-700 mb-2">{isEmailType ? "البريد الإلكتروني:" : "رقم الهاتف:"}</p>
        <p className="font-mono text-lg">{value}</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>تنبيه:</strong> سيتم تأكيد {isEmailType ? "البريد الإلكتروني" : "رقم الهاتف"} فوراً بدون إرسال رمز
          تأكيد. هذا الإجراء مخصص للمسؤولين فقط.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <SubmitButton text={`تأكيد ${isEmailType ? "البريد" : "الهاتف"}`} />
      </div>
    </form>
  )
}
