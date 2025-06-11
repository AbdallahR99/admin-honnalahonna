"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/supabase/types"

interface SetPasswordFormProps {
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

export function SetPasswordForm({ action, user, onSuccess }: SetPasswordFormProps) {
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
      if (state.success) {
        formRef.current?.reset()
        if (onSuccess) onSuccess()
      }
    }
  }, [state, toast, onSuccess])

  return (
    <form ref={formRef} action={formAction} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="email" value={user.email} />

      <div>
        <p className="mb-4 text-gray-700">
          أنت على وشك إنشاء حساب مصادقة للمستخدم <strong>{user.email}</strong>. يرجى تعيين كلمة مرور للحساب.
        </p>
      </div>

      <div>
        <Label htmlFor="password" className="font-semibold text-gray-700">
          كلمة المرور* (6 أحرف على الأقل)
        </Label>
        <Input id="password" name="password" type="password" required className="mt-1" />
      </div>

      <div>
        <Label htmlFor="confirm_password" className="font-semibold text-gray-700">
          تأكيد كلمة المرور*
        </Label>
        <Input id="confirm_password" name="confirm_password" type="password" required className="mt-1" />
      </div>

      <SubmitButton text="إنشاء حساب المصادقة" />
    </form>
  )
}
