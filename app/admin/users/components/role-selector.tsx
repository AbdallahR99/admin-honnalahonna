"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/supabase/types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ShieldAlert, ShieldCheck } from "lucide-react"

interface RoleSelectorProps {
  action: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string }>
  user: User
  onSuccess?: () => void
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "جاري الحفظ..." : text}
    </Button>
  )
}

export function RoleSelector({ action, user, onSuccess }: RoleSelectorProps) {
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
        <p className="font-semibold">لا يمكن تعيين دور</p>
        <p className="text-sm mt-1">
          يجب ربط المستخدم بحساب مصادقة أولاً قبل تعيين دور له. الرجاء استخدام خيار "تعيين كلمة المرور" أولاً.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="user_id" value={user.user_id} />

      <div>
        <p className="mb-4 text-gray-700">
          تعيين دور للمستخدم <strong>{user.email}</strong>
        </p>
      </div>

      <RadioGroup defaultValue={user.is_admin ? "admin" : "user"} name="role" className="space-y-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <RadioGroupItem value="user" id="user" />
          <Label htmlFor="user" className="flex items-center gap-2 cursor-pointer">
            <ShieldCheck className="w-4 h-4 text-gray-500" /> مستخدم عادي
          </Label>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <RadioGroupItem value="admin" id="admin" />
          <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer">
            <ShieldAlert className="w-4 h-4 text-blue-500" /> مسؤول
          </Label>
        </div>
      </RadioGroup>

      <div className="pt-4">
        <SubmitButton text="حفظ الدور" />
      </div>
    </form>
  )
}
