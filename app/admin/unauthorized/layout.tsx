import type React from "react"

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">{children}</div>
}
