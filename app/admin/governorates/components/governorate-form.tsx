"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { Governorate } from "@/lib/supabase/types"

interface GovernorateFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; message: string }>
  initialData?: Governorate | null
  buttonText: string
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

export function GovernorateForm({ action, initialData, buttonText, onSuccess }: GovernorateFormProps) {
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
    <form ref={formRef} action={formAction} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <Label htmlFor="name" className="font-semibold text-gray-700">
          اسم المحافظة
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name || ""}
          required
          className="mt-1"
          placeholder="مثال: القاهرة"
        />
      </div>
      <div>
        <Label htmlFor="governorate_code" className="font-semibold text-gray-700">
          كود المحافظة (اختياري)
        </Label>
        <Input
          id="governorate_code"
          name="governorate_code"
          defaultValue={initialData?.governorate_code || ""}
          className="mt-1"
          placeholder="مثال: CAI"
        />
      </div>
      {/* Add more meta fields if needed */}
      <SubmitButton text={buttonText} />
    </form>
  )
}
