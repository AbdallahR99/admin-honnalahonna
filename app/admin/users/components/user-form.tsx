"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/supabase/types"

interface UserFormProps {
  action: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string }>
  initialData?: User | null
  buttonText: string
  onSuccess?: () => void
  isEditing?: boolean
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "جاري الحفظ..." : text}
    </Button>
  )
}

export function UserForm({ action, initialData, buttonText, onSuccess, isEditing = false }: UserFormProps) {
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
        if (!isEditing) formRef.current?.reset()
        if (onSuccess) onSuccess()
      }
    }
  }, [state, toast, onSuccess, isEditing])

  return (
    <form ref={formRef} action={formAction} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="email" className="font-semibold text-gray-700">
            البريد الإلكتروني*
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email || ""}
            required
            className="mt-1"
            readOnly={isEditing}
            disabled={isEditing}
          />
          {isEditing && <input type="hidden" name="id" value={initialData?.id || ""} />}
          {isEditing && initialData?.user_id && <input type="hidden" name="user_id" value={initialData.user_id} />}
        </div>
        {!isEditing && (
          <div>
            <Label htmlFor="password_create" className="font-semibold text-gray-700">
              كلمة المرور* (6 أحرف على الأقل)
            </Label>
            <Input id="password_create" name="password" type="password" required className="mt-1" />
          </div>
        )}
        <div>
          <Label htmlFor="first_name" className="font-semibold text-gray-700">
            الاسم الأول
          </Label>
          <Input id="first_name" name="first_name" defaultValue={initialData?.first_name || ""} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="last_name" className="font-semibold text-gray-700">
            الاسم الأخير
          </Label>
          <Input id="last_name" name="last_name" defaultValue={initialData?.last_name || ""} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone" className="font-semibold text-gray-700">
            رقم الهاتف
          </Label>
          <Input id="phone" name="phone" type="tel" defaultValue={initialData?.phone || ""} className="mt-1" />
        </div>
      </div>
      <SubmitButton text={buttonText} />
    </form>
  )
}
