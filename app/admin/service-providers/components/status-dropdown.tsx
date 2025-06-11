"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import type { ServiceProviderStatus } from "@/lib/supabase/types"
import { updateServiceProviderStatus } from "../../(dashboard)/service-providers/actions"

interface StatusDropdownProps {
  providerId: string
  currentStatus: ServiceProviderStatus
  size?: "sm" | "default"
  showBadge?: boolean
}

const statusTranslations: Record<ServiceProviderStatus, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
}

const statusColors: Record<ServiceProviderStatus, string> = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
}

export function StatusDropdown({
  providerId,
  currentStatus,
  size = "default",
  showBadge = false,
}: StatusDropdownProps) {
  const [status, setStatus] = useState<ServiceProviderStatus>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleStatusChange = async (newStatus: ServiceProviderStatus) => {
    if (newStatus === status) return

    setIsUpdating(true)
    try {
      const result = await updateServiceProviderStatus(providerId, newStatus)

      if (result.success) {
        setStatus(newStatus)
        toast({
          title: "نجاح",
          description: result.message,
          variant: "default",
        })
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (showBadge) {
    return <Badge className={`${statusColors[status]} text-white`}>{statusTranslations[status]}</Badge>
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
      <SelectTrigger className={size === "sm" ? "h-8 text-xs" : ""}>
        <SelectValue>
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${statusColors[status]}`} />
          {isUpdating ? "جاري التحديث..." : statusTranslations[status]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2 bg-yellow-500" />
            قيد المراجعة
          </div>
        </SelectItem>
        <SelectItem value="approved">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500" />
            مقبول
          </div>
        </SelectItem>
        <SelectItem value="rejected">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2 bg-red-500" />
            مرفوض
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
