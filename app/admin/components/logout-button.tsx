"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOutAction } from "../(dashboard)/actions"
import { useToast } from "@/components/ui/use-toast"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOutAction()
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      })
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="w-full justify-start text-white hover:bg-gray-700"
      disabled={isLoading}
    >
      <LogOut className="w-5 h-5 ml-2" />
      {isLoading ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
    </Button>
  )
}
