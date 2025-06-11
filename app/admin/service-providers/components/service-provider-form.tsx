"use client"

import type React from "react"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { User, Governorate, ServiceCategory, ServiceProvider } from "@/lib/supabase/types"
import Image from "next/image"
import { SupabasePaths } from "@/lib/supabase/paths"

interface ServiceProviderFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; message: string }>
  users: Pick<User, "id" | "user_id" | "first_name" | "last_name" | "email">[]
  governorates: Pick<Governorate, "id" | "name">[]
  serviceCategories: Pick<ServiceCategory, "id" | "name">[]
  initialData?: ServiceProvider | null // Use full ServiceProvider for edit
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

const FileInputPreview = ({
  name,
  label,
  accept,
  multiple = false,
  existingFilename,
}: {
  name: string
  label: string
  accept?: string
  multiple?: boolean
  existingFilename?: string | null
}) => {
  const [preview, setPreview] = useState<string | string[] | null>(
    existingFilename
      ? multiple
        ? existingFilename.split(", ").map((f) => `${SupabasePaths.SERVICE_PROVIDERS}/${f}`)
        : `${SupabasePaths.SERVICE_PROVIDERS}/${existingFilename}`
      : null,
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      if (multiple) {
        const fileArray = Array.from(event.target.files).map((file) => URL.createObjectURL(file))
        setPreview(fileArray)
      } else {
        setPreview(URL.createObjectURL(event.target.files[0]))
      }
    } else {
      // Revert to existing if selection is cleared
      setPreview(
        existingFilename
          ? multiple
            ? existingFilename.split(", ").map((f) => `${SupabasePaths.SERVICE_PROVIDERS}/${f}`)
            : `${SupabasePaths.SERVICE_PROVIDERS}/${existingFilename}`
          : null,
      )
    }
  }

  const renderPreview = () => {
    if (!preview) return null
    const urls = Array.isArray(preview) ? preview : [preview]
    return urls.map((url, index) =>
      url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
        <Image
          key={index}
          src={url || "/placeholder.svg"}
          alt={`${label} preview ${index + 1}`}
          width={100}
          height={100}
          className="mt-2 rounded object-cover"
        />
      ) : (
        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-blue-500">
          {label} معاينة {index + 1}
        </a>
      ),
    )
  }

  return (
    <div>
      <Label htmlFor={name} className="font-semibold text-gray-700">
        {label} {existingFilename && "(ملف حالي موجود)"}
      </Label>
      <Input
        id={name}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="mt-1"
      />
      {/* Hidden input to carry over existing filename if no new file is selected for edit scenarios */}
      {existingFilename && (
        <input type="hidden" name={`existing_${name.replace("_file", "")}`} value={existingFilename} />
      )}
      <div className="flex flex-wrap gap-2">{renderPreview()}</div>
    </div>
  )
}

export function ServiceProviderForm({
  action,
  users,
  governorates,
  serviceCategories,
  initialData,
  buttonText,
  onSuccess,
  isEditing = false,
}: ServiceProviderFormProps) {
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
          <Label htmlFor="user_id" className="font-semibold text-gray-700">
            المستخدم*
          </Label>
          <Select name="user_id" defaultValue={initialData?.user_id || ""} required>
            <SelectTrigger id="user_id">
              <SelectValue placeholder="اختر مستخدمًا" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.user_id || user.id}>
                  {user.first_name} {user.last_name} ({user.email}){!user.user_id && " - غير مرتبط بحساب"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="service_name" className="font-semibold text-gray-700">
            اسم الخدمة*
          </Label>
          <Input id="service_name" name="service_name" defaultValue={initialData?.service_name || ""} required />
        </div>
        <div>
          <Label htmlFor="service_category_id" className="font-semibold text-gray-700">
            فئة الخدمة*
          </Label>
          <Select name="service_category_id" defaultValue={initialData?.service_category_id || ""} required>
            <SelectTrigger id="service_category_id">
              <SelectValue placeholder="اختر فئة" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="governorate_id" className="font-semibold text-gray-700">
            المحافظة*
          </Label>
          <Select name="governorate_id" defaultValue={initialData?.governorate_id || ""} required>
            <SelectTrigger id="governorate_id">
              <SelectValue placeholder="اختر محافظة" />
            </SelectTrigger>
            <SelectContent>
              {governorates.map((gov) => (
                <SelectItem key={gov.id} value={gov.id}>
                  {gov.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="years_of_experience" className="font-semibold text-gray-700">
            سنوات الخبرة
          </Label>
          <Input
            id="years_of_experience"
            name="years_of_experience"
            type="number"
            defaultValue={initialData?.years_of_experience?.toString() || ""}
          />
        </div>
        <div>
          <Label htmlFor="service_delivery_method" className="font-semibold text-gray-700">
            طريقة تقديم الخدمة
          </Label>
          <Select name="service_delivery_method" defaultValue={initialData?.service_delivery_method || ""}>
            <SelectTrigger id="service_delivery_method">
              <SelectValue placeholder="اختر طريقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">عبر الإنترنت</SelectItem>
              <SelectItem value="offline">في الموقع</SelectItem>
              <SelectItem value="both">كلاهما</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="service_description" className="font-semibold text-gray-700">
          وصف الخدمة
        </Label>
        <Textarea
          id="service_description"
          name="service_description"
          defaultValue={initialData?.service_description || ""}
        />
      </div>
      <div>
        <Label htmlFor="bio" className="font-semibold text-gray-700">
          نبذة تعريفية (Bio)
        </Label>
        <Textarea id="bio" name="bio" defaultValue={initialData?.bio || ""} />
      </div>

      <h3 className="text-lg font-semibold pt-4 border-t mt-4">الملفات والمستندات</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileInputPreview
          name="logo_image_file"
          label="الشعار"
          accept="image/*"
          existingFilename={initialData?.logo_image}
        />
        <FileInputPreview
          name="id_card_front_image_file"
          label="وجه البطاقة الشخصية"
          accept="image/*"
          existingFilename={initialData?.id_card_front_image}
        />
        <FileInputPreview
          name="id_card_back_image_file"
          label="ظهر البطاقة الشخصية"
          accept="image/*"
          existingFilename={initialData?.id_card_back_image}
        />
        <FileInputPreview
          name="certificates_images_files" // Note: name ends with _files for server action
          label="الشهادات (يمكن تحديد أكثر من ملف)"
          accept="image/*,application/pdf"
          multiple={true}
          existingFilename={initialData?.certificates_images}
        />
        <FileInputPreview
          name="document_list_files" // Note: name ends with _files for server action
          label="مستندات أخرى (يمكن تحديد أكثر من ملف)"
          accept="image/*,application/pdf,.doc,.docx"
          multiple={true}
          existingFilename={initialData?.document_list}
        />
      </div>

      <h3 className="text-lg font-semibold pt-4 border-t mt-4">الروابط الخارجية</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="video_url" className="font-semibold text-gray-700">
            رابط الفيديو التعريفي
          </Label>
          <Input
            id="video_url"
            name="video_url"
            type="url"
            defaultValue={initialData?.video_url || ""}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div>
          <Label htmlFor="facebook_url" className="font-semibold text-gray-700">
            رابط فيسبوك
          </Label>
          <Input id="facebook_url" name="facebook_url" type="url" defaultValue={initialData?.facebook_url || ""} />
        </div>
        <div>
          <Label htmlFor="instagram_url" className="font-semibold text-gray-700">
            رابط انستغرام
          </Label>
          <Input id="instagram_url" name="instagram_url" type="url" defaultValue={initialData?.instagram_url || ""} />
        </div>
        <div>
          <Label htmlFor="whatsapp_url" className="font-semibold text-gray-700">
            رابط واتساب (API link)
          </Label>
          <Input
            id="whatsapp_url"
            name="whatsapp_url"
            type="url"
            defaultValue={initialData?.whatsapp_url || ""}
            placeholder="https://wa.me/201xxxxxxxxx"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="keywords" className="font-semibold text-gray-700">
          كلمات مفتاحية (مفصولة بفاصلة)
        </Label>
        <Input id="keywords" name="keywords" defaultValue={initialData?.keywords || ""} />
      </div>
      <div>
        <Label htmlFor="notes" className="font-semibold text-gray-700">
          ملاحظات إضافية
        </Label>
        <Textarea id="notes" name="notes" defaultValue={initialData?.notes || ""} />
      </div>

      {isEditing && initialData?.status && (
        <div>
          <Label htmlFor="status" className="font-semibold text-gray-700">
            الحالة
          </Label>
          <Select name="status" defaultValue={initialData?.status}>
            <SelectTrigger id="status">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">مقبول</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <SubmitButton text={buttonText} />
    </form>
  )
}
