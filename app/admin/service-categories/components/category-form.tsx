"use client"

import type React from "react"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { ServiceCategory } from "@/lib/supabase/types"
import Image from "next/image"
import { SupabasePaths } from "@/lib/supabase/paths"

interface CategoryFormProps {
  action: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string }>
  initialData?: ServiceCategory | null
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

// Helper function to generate slug from category name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
}

export function CategoryForm({ action, initialData, buttonText, onSuccess }: CategoryFormProps) {
  const [state, formAction] = useActionState(action, { success: false, message: "" })
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(
    initialData?.icon ? `${SupabasePaths.SERVICE_CATEGORIES}/${initialData.icon}` : null,
  )

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

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      setIconPreview(URL.createObjectURL(file))
    } else {
      // If file selection is cleared, revert to initial icon if available
      setIconPreview(initialData?.icon ? `${SupabasePaths.SERVICE_CATEGORIES}/${initialData.icon}` : null)
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <Label htmlFor="name" className="font-semibold text-gray-700">
          اسم الفئة
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name || ""}
          required
          className="mt-1"
          placeholder="مثال: سباكة"
        />
      </div>
      <div>
        <Label htmlFor="slug" className="font-semibold text-gray-700">
          الرابط (Slug)
        </Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={initialData?.slug || ""}
          className="mt-1"
          placeholder="سيتم إنشاؤه تلقائياً من الاسم"
        />
      </div>
      <div>
        <Label htmlFor="icon_file" className="font-semibold text-gray-700">
          أيقونة الفئة (صورة)
        </Label>
        <Input
          id="icon_file"
          name="icon_file"
          type="file"
          accept="image/*"
          className="mt-1"
          onChange={handleIconChange}
        />
        {initialData?.icon && <input type="hidden" name="existing_icon" value={initialData.icon} />}
        {iconPreview && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-1">معاينة الأيقونة:</p>
            <Image
              src={iconPreview || "/placeholder.svg"}
              alt="معاينة الأيقونة"
              width={64}
              height={64}
              className="rounded border object-cover"
            />
          </div>
        )}
      </div>
      <SubmitButton text={buttonText} />
    </form>
  )
}
