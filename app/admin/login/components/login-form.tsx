"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react"
import { signInWithPhone } from "../actions"
import { useToast } from "@/components/ui/use-toast"
import { PhoneInput } from "@/components/ui/phone-input"

export function LoginForm() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signInWithPhone(phone, password)

      if (result.success) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة التحكم الإدارية",
        })

        // Client-side redirect after successful login
        router.push("/admin")
        router.refresh()
      } else {
        setError(result.error || "حدث خطأ أثناء تسجيل الدخول")
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone" className="text-right block mb-2">
            البريد الإلكتروني
          </Label>
          <PhoneInput
            id="phone"
            initialValueFormat="national"
            placeholder="أدخل رقم الهاتف"
            disabled={isLoading}
            value={phone}
            onChange={(e) => setPhone(e)}
          />
          
        </div>

        <div>
          <Label htmlFor="password" className="text-right block mb-2">
            كلمة المرور
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="text-right pr-10"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <LogIn size={18} />
        )}
        {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
